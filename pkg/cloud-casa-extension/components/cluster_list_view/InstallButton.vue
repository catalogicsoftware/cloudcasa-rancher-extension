<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { CLOUDCASA_URL } from './../../types/types.js';

export default {
  emits: ['install-state-func'],
  components: {
    FontAwesomeIcon,
  },
  setup() {
    return {
      faSpinner
    }
  },
  props: {
    row: Object,
    cloudCasaApiKey: String,
  },
  data(){
    return {
      ccWaitTimer: null,
      detailsLink: "/dashboard/cloud-casa/c/"
    }
  },
  methods: {
    getDetailsLink(clusterName){
      return this.detailsLink + clusterName;
    },
    localSetInstallState(value){
      this.$emit("install-state-func", value, this.row);
    },
    waitForInstallComplete(clusterName){
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-auth-header': `Bearer ${ this.cloudCasaApiKey }` 
      };
      let method = 'GET';
      let url = CLOUDCASA_URL + 'kubeclusters?where=' + 
        '{"name":{"$regex":"'+ clusterName +'"}}';

      this.ccWaitTimer = setInterval(() => {
        this.$store.dispatch('management/request', {
          url,
          method,
          headers,
          redirectUnauthorized: false,
        }, { root: true }).then(clusterObject => {
          let status = clusterObject._items[0].status.state;
          
          if (status == "ACTIVE"){
            this.localSetInstallState(3)
            clearInterval(this.ccWaitTimer)
          }
        });
      }, 10000)
    },
    beforeDestroy() {
      clearInterval(this.ccWaitTimer)
    },

    //Full install of cloud casa (register + agent install)
    async startCloudCasaInstall(clusterName){
      this.localSetInstallState(2);

      let cloudCasaResponse = await this.registerClusterOnCloudCasa(clusterName); 
      
      if (cloudCasaResponse == undefined) {
        return;
      }
      
      return this.installCloudCasaAgent(
        clusterName, 
        cloudCasaResponse.status.agentURL,
      );
    },
    async registerClusterOnCloudCasa(clusterName){
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-auth-header': `Bearer ${ this.cloudCasaApiKey }` 
      };
      let method = 'POST';
      let url = CLOUDCASA_URL + 'kubeclusters';
      let body = {
        "name": clusterName,
        "description": "Created for testing purposes",
      };
      return await this.$store.dispatch('management/request', {
        url,
        method,
        headers,
        data: body,
        redirectUnauthorized: false,
      }, { root: true }).catch(function(error){
        console.log("Failed to create CC cluster:",error);
        this.localSetInstallState(1);
      }.bind(this));
    },

    //CloudCasa agent Install 
    async beginCloudCasaAgentInstall(clusterName){
      this.localSetInstallState(2);
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-auth-header': `Bearer ${ this.cloudCasaApiKey }` 
      };
      let method = 'GET';
      let url = CLOUDCASA_URL + 'kubeclusters?where=' + 
        '{"name":{"$regex":"'+ clusterName +'"}}';

      this.$store.dispatch('management/request', {
        url,
        method,
        headers,
        redirectUnauthorized: false,
      }, { root: true }).then(clusterObject => {
        this.installCloudCasaAgent(
          clusterName, 
          clusterObject._items[0].status.agentURL,
        );
      }).catch(function(error){
        console.log('Did not find cluster in CloudCasa', error);
        this.localSetInstallState(1);
      }.bind(this));

    },
    async installCloudCasaAgent(clusterName, agentURL){
      //Get config file from CloudCasa
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-auth-header': `Bearer ${ this.cloudCasaApiKey }` 
      };
      let method = 'GET';
      let url = 'meta/proxy/' + agentURL.replace('https://', '');

      this.$store.dispatch('management/request', {
        url,
        method,
        headers,
        redirectUnauthorized: false,
      }, { root: true }).then(data => {
          //start listening to CloudCasa API for the install to complete
          this.waitForInstallComplete(clusterName);

          //Apply config file to the cluster
          return this.$store.dispatch('management/request', {
            url: `/v1/management.cattle.io.clusters/` + clusterName + 
              '?action=apply',
            method: 'POST',
            data: {
              defaultNamespace: "default",
              yaml: data.data,
            }
          });
      }).catch(function(error){
        console.log("Failed to get CC config file:", error);
        this.localSetInstallState(4);
      }.bind(this));
    },
  },
}
</script>
<template>
  <button
    v-if="row.installState == 2 || row.installState == 0"
    v-bind="{disabled: row.installState == 2 ? true : null}"
    class="btn role-primary" 
    @click="startCloudCasaInstall(row.id)"
  >
    <span>
      Install <FontAwesomeIcon v-if="row.installState === 2" :icon="faSpinner" spin />
    </span>
  </button>
  <button
    v-if="row.installState == 1"
    class="btn role-primary" 
    @click="beginCloudCasaAgentInstall(row.id)"
  >
    <span>
      Install <FontAwesomeIcon v-if="row.installState === 2" :icon="faSpinner" spin />
    </span>
  </button>
  <a
    :href="this.getDetailsLink(row.id)"
    class="btn role-secondary"
    v-if="row.installState === 3"
  >
    View Details
  </a>
  <button
    class="btn role-secondary"
    v-if="row.installState === 4"
  >
    View Details
  </button>
</template>
<style scoped>
</style>
