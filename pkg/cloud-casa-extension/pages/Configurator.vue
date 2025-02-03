<script>
import { defineComponent } from 'vue';
import SimpleBox from '@shell/components/SimpleBox';
import { LabeledInput } from '@components/Form/LabeledInput';
import { CLOUDCASA_URL } from './../types/types.js';

export default defineComponent({
  layout: 'plain', /*This is going to be deprecated in the future, when it breaks
  try looking at change log or reaching out to Alexandre Alves. Reference this
  GitHub issue: https://github.com/rancher/dashboard/issues/12980*/
  name: "configurator-page",
  components: {
    SimpleBox,
    LabeledInput
  },
  data() {
    return {
      cloudCasaApiKey: ''
    }
  },
  async mounted() {

  },
  methods: {
    async saveApiKey(){
      let currentConfig;

      //Grab configuration (should exist since index.vue handles this)
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
          window.location.href = '../cloud-casa/dashboard';
        //If something is wrong with the key, show the growl
        }).catch(function(error){
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
  },
})
</script>
<template>
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
</template>
<style scoped>
  .flex-box{
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  .flex-item{
    flex: 1;
  }

  .simplebox-centering{
    height: 93vh;
    margin: 1rem;
    display: flex; 
    align-items: center;
    justify-content: center;
  }
  
  .key-input{
    width: 75rem;
  }

  .btn-save-api-key{
    margin-top: 10px;
  }
</style>
