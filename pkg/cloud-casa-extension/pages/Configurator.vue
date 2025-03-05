<script>
import { MANAGEMENT } from '@shell/config/types';
import { defineComponent } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

import { Banner } from '@components/Banner';
import SimpleBox from '@shell/components/SimpleBox';
import { LabeledInput } from '@components/Form/LabeledInput';
import { CLOUDCASA_URL, PRODUCT_NAME, CRD_NAME } from './../types/types.js';

import { getCloudCasaRequest, getCloudCasaApiKey } from './../modules/network.js';
import { isDarkTheme } from './../modules/cookies.js';

export default defineComponent({
  layout: 'plain', /*This is going to be deprecated in the future, when it breaks
  try looking at change log or reaching out to Alexandre Alves. Reference this
  GitHub issue: https://github.com/rancher/dashboard/issues/12980*/
  name: "configurator-page",
  components: {
    FontAwesomeIcon,
    Banner,
    SimpleBox,
    LabeledInput,
  },
  setup(){
    return {
      faArrowLeft
    }
  },
  data() {
    return {
      clusterPrefix: '',
      cloudCasaApiEndpoint: 'home.cloudcasa.io/api/v1/',
      cloudCasaApiKey: '',
      isCloudCasaApiKeyValid: false,
      doesAPiKeyExist: false,
    }
  },
  computed: {
    isDarkTheme(){
      return isDarkTheme();
    },
  },
  async mounted() {
    await this.findCloudCasaApiKey().catch(function(error){
      //console.log(error);
    });

    const existingConfig = await this.findCrd();
    if (existingConfig.length > 0){
      this.clusterPrefix = existingConfig[0].spec.clusterPrefix;
      this.cloudCasaApiEndpoint = existingConfig[0].spec.apiEndpoint;
    }
  },
  methods: {
    async findCloudCasaApiKey(){
      const apiKeyValue = await getCloudCasaApiKey(this.$store);
     
      if (apiKeyValue !== undefined)
        this.doesAPiKeyExist = true;
      else
        this.doesAPiKeyExist = false;
    },
    async findCrd(){
      return await this.$store.dispatch(
        'management/findAll', 
        { type: CRD_NAME },
      ).catch(function(error){
        //console.log(error);
      });
    },
    async findExistingConfig(){
      let currentConfig;
      const findExistingConfig = await this.findCrd();

      //If no config found, create a new one locally
      if (findExistingConfig.length == 0) {
        //Setup data struct to send to rancher
        const config = {
          metadata: { 
            name: CRD_NAME, 
            namespace: 'default',
          },
          spec: {
            clusterPrefix: this.clusterPrefix.toLowerCase(),
            apiEndpoint: this.cloudCasaApiEndpoint,
            apiToken: this.cloudCasaApiKey
          },
          type: CRD_NAME,
        };

        currentConfig = await this.$store.dispatch('management/create', config);
      //If config exists, update key
      }else{
        currentConfig = findExistingConfig[0];
        currentConfig.spec.clusterPrefix = this.clusterPrefix.toLowerCase();
        currentConfig.spec.apiToken = this.cloudCasaApiKey;
        currentConfig.spec.apiEndpoint = this.cloudCasaApiEndpoint;
      }

      return currentConfig;
    },
    async saveApiInformation(){
      let nodeDriver = await this.ensureCloudCasaNodeDriver(this.cloudCasaApiEndpoint);
      let whitelistUp = await this.ensuretGlobalWhitelist(
        nodeDriver, 
        this.cloudCasaApiEndpoint,
      );
      
      /*use nodeDriverUp, whitelistUp for initial screen, if false, don't allow 
      user forward*/
      //console.log(nodeDriverUp, whitelistUp);

      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-auth-header': `Bearer ${ this.cloudCasaApiKey }`
      };
      let method = 'GET';
      let url = CLOUDCASA_URL + this.cloudCasaApiEndpoint + 'kubeclusters';

      this.$store.dispatch(
        'management/request',
        {
          url,
          method,
          headers,
          redirectUnauthorized: false,
        },
        { root: true },
      //If the key works against a CloudCasa endpoint, continue to cluster list
      ).then(async function(){
        //Grab configuration (should exist since index.vue handles this)
        let currentConfig = await this.findExistingConfig();

        currentConfig.save().then(_ => {
          this.$router.push('/' + PRODUCT_NAME + '/dashboard');
        //If something is wrong with the key, show the growl
        }).catch(function(error){
          //console.log(error);
          this.$store.dispatch('growl/error', {
            title: 'Invalid API Key',
            message: `Please ensure you have copied the CloudCasa API Key into 
            the input box below`,
          }, { root: true });
        }.bind(this));
      //If something is wrong with the key, show the growl
      }.bind(this)).catch(function(error){
        //console.log(error);
        this.$store.dispatch('growl/error', {
          title: 'Invalid API Key',
          message: `Please ensure you have copied the CloudCasa API Key into 
          the input box below`,
        }, { root: true });
      }.bind(this));
    },
    async ensuretGlobalWhitelist(nodeDriver, url){
      const whitelist = await this.$store.dispatch(
        'management/findAll', 
        { type: MANAGEMENT.SETTING },
      );

      const setting = whitelist.find(s => s.value === url);
      
      if (setting != undefined) {
        return true;
      }
      
      try {
        await nodeDriver.whitelistDomains.push(url);
        return true;
      } catch(error) {
        //console.log(error);
        return false;
      }

      return true;
    },
    async ensureCloudCasaNodeDriver(url){
      const nodeDrivers = await this.$store.dispatch(
        'rancher/findAll',
        { type: 'nodeDriver' },
        { root: true }
      ).catch(function(error){
        //console.log(error);
      });

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

      cloudCasaDriver.state = 'active';
      cloudCasaDriver.url = 'https://' + url;
      cloudCasaDriver.whitelistDomains.push(url.split('/')[0]);
      cloudCasaDriver.whitelistDomains.push('api.cloudcasa.io');

      try {
        return await cloudCasaDriver.save();
      } catch(error) {
        //console.log(error);
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
    isCloudCasaDriverName(name){
      return name === this.name;
    },
    routeToMainPage(){
      this.$router.push('/' + PRODUCT_NAME + '/dashboard');
    },
    validateCloudCasaApiKeyInput() {
      //Wait for input to update before testing it
      setTimeout(() => {
        const regex = /^[a-zA-Z0-9-_]+$/;
        if (!regex.test(this.cloudCasaApiKey)) {
          this.isCloudCasaApiKeyValid = false;
        } else if (
          this.cloudCasaApiKey.length < 100 || 
          this.cloudCasaApiKey.length > 255
        ){ 
          this.isCloudCasaApiKeyValid = false;
        } else {
          this.isCloudCasaApiKeyValid = true;
        }
      }, 1000);
    }
  },
})
</script>
<template>
  <div class="center-all">
    <div class="max-width">
      <a 
        v-if="this.doesAPiKeyExist"
        @click="this.routeToMainPage()"
        target="_Blank"
        class="btn role-primary back-button" 
        label="Cluster List"
       >
        <FontAwesomeIcon :icon="faArrowLeft" /> Back To Cluster List
      </a>
      <Banner
        color="warning"
        label="This Rancher Extension can be installed and managed by anyone with admin access. Please ensure that only trusted administrators are granted access, and regularly monitor the extension's usage and settings for unauthorized changes."
      />
      <div class="flex-box">
        <div class="flex-item">
          <SimpleBox class="simplebox-centering" style="text-align: center;">
            <img
              v-if="this.isDarkTheme"
              style="width: 250px;"
              src="../assets/full-logo-white.png" 
            />
            <img
              v-if="!this.isDarkTheme"
              style="width: 250px;"
              src="../assets/full-logo-black.svg" 
            />
            <h1>Welcome to the CloudCasa Extension!</h1>
            <h3>In order to get started you will need a CloudCasa API Key. To set 
              that up follow 
              <a 
                href="https://docs.cloudcasa.io/help/apikeys.html"
                target="_Blank"
              >
                this guide
              </a>.
            </h3>
            <div class="m-25"></div>
            <h1>Documentation & Help</h1>
            <a 
              href="https://docs.cloudcasa.io/help/rancher-installation.html"
              target="_Blank"
            >
              Rancher Extension CloudCasa Installation Guide
            </a>
            <div class="m-25"></div>
            <a 
              href="https://docs.cloudcasa.io/help/rancher.html" 
              target="_Blank"
            >
              Rancher Extension CloudCasa User Guide
            </a>
            <div class="m-25"></div>
            <a href="https://docs.cloudcasa.io/help/" target="_Blank">
              CloudCasa Help
            </a>
          </SimpleBox>
        </div>
        <div class="flex-item">
          <SimpleBox class="simplebox-centering">
             <LabeledInput 
              subLabel="The default api endpoint is 'home.cloudcasa.io/api/v1/'. For private CloudCasa instances replace the default api endpoint."
              class="key-input"
              type="text" 
              v-model:value="cloudCasaApiEndpoint"
              required
            >
              <template #label>CloudCasa API Endpoint</template>
            </LabeledInput>
            <div class="m-50"></div>
            <LabeledInput 
              class="key-input"
              type="text"
              :status="this.isCloudCasaApiKeyValid ? '' : 'error'"
              :subLabel="this.isCloudCasaApiKeyValid ? '' : 'Ensure the API Key is in the correct format.'"
              v-model:value="cloudCasaApiKey"
              @input="validateCloudCasaApiKeyInput"
              required
            >
              <template #label>CloudCasa API Key</template>
            </LabeledInput>
            <div class="m-35"></div>
             <LabeledInput 
              subLabel="This value will be combined with the cluster name to create a cluster entry in CloudCasa. This field is optional."
              class="key-input"
              type="text" 
              v-model:value="clusterPrefix"
              required
            >
              <template #label>Cluster Prefix</template>
            </LabeledInput>
            <div class="m-50"></div>
            <button
              class="btn role-primary btn-save-api-key"
              @click="saveApiInformation()"
              :disabled="!this.isCloudCasaApiKeyValid"
            >
              Save API Configuration
            </button>
          </SimpleBox>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
  svg {
    margin-right: 10px;
  }

  .center-all{
    width: 100%;
    text-align: center;
  }

  .flex-box{
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  .flex-item{
    flex: 1;
  }

  .simplebox-centering{
    height: 60vh;
    margin: 1rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
  
  .key-input{
    display: block;
    width: 450px;
  }

  .btn-save-api-key{
    margin-top: 10px;
  }

  .back-button {
    float: left;
    margin-bottom: 10px;
  }
</style>
