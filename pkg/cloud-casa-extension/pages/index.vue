<script>
import { defineComponent } from 'vue';
import { CRD_NAME } from './../types/types.js';
import { getCloudCasaApiKey, getCloudCasaEndpoint } from './../modules/network.js';

export default defineComponent({
  layout: 'plain', /*This is going to be deprecated in the future, when it breaks
  try looking at change log or reaching out to Alexandre Alves. Reference this
  GitHub issue: https://github.com/rancher/dashboard/issues/12980*/
  name: 'index-page',
  data() {
    return {
      name: 'cloud-casa',
      hasCloudCasaKeyState: 1, //1 = init state, 2 = no key, 3 = key
      CC_CRD: {
        apiVersion: 'apiextensions.k8s.io/v1',
        kind: 'CustomResourceDefinition',
        metadata: { name: 'configurations.cloudcasa.rancher.io.v3' },
        spec: {
          group: 'cloudcasa.rancher.io.v3',
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
                        clusterPrefix: { type: 'string' },
                        apiEndpoint: { type: 'string' },
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
    //Check for CloudCasa Key
    const apiKeyResponse = await this.testGetCcCrd().catch(function(error){
      console.log(error);
    });
   
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
    async testGetCcCrd(){
      //Grab existing configuration
      const config = await this.$store.getters['management/schemaFor'](CRD_NAME);
      
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
        { type: CRD_NAME },
      ).catch(function(error){
        console.log(error);
      });
    },
  },
})
</script>
<template class="max-width">
  <div v-if="hasCloudCasaKeyState == 1">
    <div class="text-center">
      <h1>Checking For CloudCasa API Key...</h1>
    </div>
  </div>
</template>
<style>

  .max-width{
    width: 100%;
    margin: 0 auto;
  }
  
  @media screen and (min-width: 1920px) {
    .max-width {
      width: 100%;
    }
  }
  
  @media screen and (min-width: 2048px) {
    .max-width {
      width: 95%;
    }
  }
  
  @media screen and (min-width: 3840px) {
    .max-width {
      width: 85%;
    }
  }

</style>
