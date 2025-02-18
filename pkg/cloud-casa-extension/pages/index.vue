<script>
import { defineComponent } from 'vue';
import { MANAGEMENT } from '@shell/config/types';

export default defineComponent({
  layout: 'plain', /*This is going to be deprecated in the future, when it breaks
  try looking at change log or reaching out to Alexandre Alves. Reference this
  GitHub issue: https://github.com/rancher/dashboard/issues/12980*/
  name: 'index-page',
  data() {
    return {
      url: 'api.cloudcasa.io',
      name: 'cloud-casa',
      cloudCasaApiKey: '',
      hasCloudCasaKeyState: 1, //1 = init state, 2 = no key, 3 = key
      CC_CRD: {
        apiVersion: 'apiextensions.k8s.io/v1',
        kind: 'CustomResourceDefinition',
        metadata: { name: 'configurations.cloudcasa.rancher.io' },
        spec: {
          group: 'cloudcasa.rancher.io',
          versions: [
            {
              name: 'v1beta1',
              served: true,
              storage: true,
              schema: {
                openAPIV3Schema: {
                  type: 'object',
                  properties: {
                    spec: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        apiToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          ],
          scope: 'Namespaced',
          names: {
            plural:   'configurations',
            singular: 'configuration',
            kind: 'Configuration',
            listKind: 'ConfigurationList',
          },
        },
      },
    }
  },
  async mounted() {
    let nodeDriverUp = await this.ensureCloudCasaNodeDriver(this.url);
    let whitelistUp = await this.ensuretGlobalWhitelist(this.url);
    
    /*use nodeDriverUp, whitelistUp for initial screen, if false, don't allow 
    user forward*/
    console.log(nodeDriverUp, whitelistUp);

    //Check for CloudCasa Key
    const apiKeyResponse = await this.testGetRancherSettings();
   
    //Key exists, show cluster list
    if (apiKeyResponse.length != 0) {
      this.cloudCasaApiKey = apiKeyResponse[0].spec.apiToken;
      this.hasCloudCasaKeyState == 3
      this.$router.push('/CloudCasa/dashboard');
    //Key does not exist, show configurator
    } else {
      this.hasCloudCasaKeyState == 2
      this.$router.push('/CloudCasa/configurator');
    }
  },
  methods: {
    async ensuretGlobalWhitelist(url){
      const whitelist = await this.$store.dispatch(
        'management/findAll', 
        { type: MANAGEMENT.SETTING },
      );

      const setting = whitelist.find(s => s.value === url);
      
      if (setting != undefined) {
        return true;
      }

      try {
        this.$store.dispatch('management/request', {
          url: `v1/${ MANAGEMENT.SETTING }`,
          method: 'POST', 
          data: {
            metadata: {
              name: 'cloudcasa-whitelist-domain',
            },
            value: url,
          },
        })
      } catch (e) {
        console.log(e);
        return false;
      }

      return true;
    },
    async ensureCloudCasaNodeDriver(url){
      const nodeDrivers = await this.$store.dispatch(
        'rancher/findAll',
        { type: 'nodeDriver' },
        { root: true }
      );

      const cloudCasaDriver = nodeDrivers.find(
          (driver) => this.isCloudCasaDriverName(driver.name) 
        ) ||
          (await this.newNodeDriver()
      );

      if (!cloudCasaDriver.whitelistDomains) {
        cloudCasaDriver.whitelistDomains = [];
      }

      // Already in the whitelist
      if (cloudCasaDriver.whitelistDomains.find((domain) => domain === url)) {
        return true;
      }

      cloudCasaDriver.state = 'inactive';
      cloudCasaDriver.url = 'https://api.cloudcasa.io';
      cloudCasaDriver.whitelistDomains.push(url);

      try {
        await cloudCasaDriver.save();

        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
    async newNodeDriver(){
      const emptyDriver = {
        name: this.name,
        type: 'nodeDriver',
      };

      return await this.$store.dispatch('rancher/create', emptyDriver);
    },
    async testGetRancherSettings(){
      //Grab existing configuration
      const config = await this.$store.getters['management/schemaFor'](
        "cloudcasa.rancher.io.configuration"
      );

      //If nothing exists, create a new configuration
      if (config === undefined) {
        await this.$store.dispatch('management/request', {
          url:    '/v1/apiextensions.k8s.io.customresourcedefinitions',
          method: 'POST',
          data:   this.CC_CRD,
        }).catch(function(error){
          console.log(error);
        });
        return [];
      }

      //return new configuration for key testing
      return await this.$store.dispatch(
        'management/findAll', 
        { type: 'cloudcasa.rancher.io.configuration' },
      ).catch(function(error){
        console.log(error);
      });
    },

    isCloudCasaDriverName(name){
      return name === this.name;
    },
  },
})
</script>
<template>
  <div v-if="hasCloudCasaKeyState == 1">
    <div class="text-center">
      <h1>Checking For CloudCasa API Key...</h1>
    </div>
  </div>
</template>
