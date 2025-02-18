<script>
import { defineComponent } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

import { Banner } from '@components/Banner';
import SimpleBox from '@shell/components/SimpleBox';
import { LabeledInput } from '@components/Form/LabeledInput';
import { CLOUDCASA_URL, PRODUCT_NAME } from './../types/types.js';

import { getCloudCasaApiKey } from './../modules/network.js';

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
    getCloudCasaApiKey
  },
  setup(){
    return {
      faArrowLeft
    }
  },
  data() {
    return {
      cloudCasaApiKey: '',
      doesAPiKeyExist: false,
    }
  },
  async mounted() {
    const cloudCasaApiKey = await this.findCloudCasaApiKey();
  },
  methods: {
    async findCloudCasaApiKey(){
      const apiKeyValue = await getCloudCasaApiKey(this.$store);
     
      console.log(apiKeyValue);
      if (apiKeyValue !== undefined)
        this.doesAPiKeyExist = true;
      else
        this.doesAPiKeyExist = false;
    },
    async findExistingConfig(){
      let currentConfig;

      const findExistingConfig = await this.$store.dispatch(
        'management/findAll', 
        { type: 'cloudcasa.rancher.io.configuration' },
      ).catch(function(error){
        console.log(error);
      });

      //If no config found, create a new one locally
      if (findExistingConfig.length == 0) {
        //Setup data struct to send to rancher
        const config = {
          metadata: { 
            name: `configurations.rancher.io.cloudcasa`, 
            namespace: 'default',
          },
          spec: {
            apiToken: this.cloudCasaApiKey
          },
          type: 'cloudcasa.rancher.io.configuration',
        };

        currentConfig = await this.$store.dispatch('management/create', config);
      //If config exists, update key
      }else{
        currentConfig = findExistingConfig[0];
        currentConfig.spec.apiToken = this.cloudCasaApiKey;
      }

      return currentConfig;
    },
    async saveApiKey(){
      //Grab configuration (should exist since index.vue handles this)
      let currentConfig = await this.findExistingConfig()

      //Save key
      currentConfig.save().then(_ => {
        let headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-auth-header': `Bearer ${ this.cloudCasaApiKey }` 
        };
        let method = 'GET';
        let url = CLOUDCASA_URL + 'kubeclusters';

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
        ).then(function(){
          this.$router.push("/cloud-casa/dashboard");
        //If something is wrong with the key, show the growl
        }.bind(this)).catch(function(error){
          console.log(error);
          this.$store.dispatch('growl/error', {
            title: 'Invalid API Key',
            message: `Please ensure you have copied the CloudCasa API Key into 
            the input box below`,
          }, { root: true });
        }.bind(this));

      //If something is wrong with the key, show the growl
      }).catch(function(error){
        console.log(error);
        this.$store.dispatch('growl/error', {
          title: 'Invalid API Key',
          message: `Please ensure you have copied the CloudCasa API Key into 
          the input box below`,
        }, { root: true });
      }.bind(this));
    },
    routeToMainPage(){
      this.$router.push('/' + PRODUCT_NAME + '/dashboard');
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
            <img src="https://cloudcasa.io/assets/logo-white-1.png" />
            <h1>Welcome to the CloudCasa Extension!</h1>
            <h3>In order to get started you will need a CloudCasa API Key. To set 
              that up follow 
              <a href="https://docs.cloudcasa.io/help/apikeys.html">this guide</a>.
            </h3>
          </SimpleBox>
        </div>
        <div class="flex-item">
          <SimpleBox class="simplebox-centering">
             <LabeledInput 
              class="key-input"
              type="text" 
              v-model:value="cloudCasaApiKey"
              required
            >
              <template #label>CloudCasa API Key</template>
            </LabeledInput>
            <button
              class="btn role-primary btn-save-api-key"
              @click="saveApiKey()"
            >
              Save API Key
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

  .max-width{
    width: 1440px;
    display: block;
    margin-left: auto;
    margin-right: auto;
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
    height: 45vh;
    margin: 1rem;
    display: flex; 
    align-items: center;
    justify-content: center;
  }
  
  .key-input{
    display: block;
    width: 700px;
  }

  .btn-save-api-key{
    margin-top: 10px;
  }

  .back-button {
    float: left;
    margin-bottom: 10px;
    font-size: 20px;
  }
</style>
