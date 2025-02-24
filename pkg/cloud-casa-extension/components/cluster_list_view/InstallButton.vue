<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { CLOUDCASA_URL } from './../../types/types.js';

import { 
  getCloudCasaApiKey, 
  getCloudCasaRequest, 
  getCloudCasaEndpoint,
} from './../../modules/network.js';

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
    }
  },
  methods: {
    getDetailsLink(clusterId){
      return this.detailsLink + clusterId;
    },
    localSetInstallState(value){
      this.$emit("install-state-func", value, this.row);
    },
    async waitForInstallComplete(cloudCasaId){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'GET';
      networkRequest.url = networkRequest.url + 'kubeclusters/' + cloudCasaId;

      this.ccWaitTimer = setInterval(() => {
        this.$store.dispatch(
          'management/request', 
          networkRequest, 
          { root: true },
        ).then(clusterObject => {
          let status = clusterObject.status.state;
          
          if (status == "ACTIVE"){
            this.row.cloudCasaId = cloudCasaId;
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
    async startCloudCasaInstall(clusterId, clusterName){
      this.localSetInstallState(2);

      let cloudCasaResponse = await this.registerClusterOnCloudCasa(
        clusterId,
        clusterName,
      ); 
      
      if (cloudCasaResponse == undefined) {
        return;
      }
      
      return this.installCloudCasaAgent(
        clusterId,
        cloudCasaResponse._id,
        cloudCasaResponse.status.agentURL,
      );
    },
    async registerClusterOnCloudCasa(clusterId, clusterName){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'POST';
      networkRequest.url = networkRequest.url + 'kubeclusters';
      networkRequest.data = {
        "name": clusterName,
        "description": "Cluster setup with the CloudCasa Rancher Extension.",
      };

      return await this.$store.dispatch(
        'management/request', 
        networkRequest, 
        { root: true },
      ).catch(function(error){
        console.log("Failed to create CC cluster:", error);
        this.localSetInstallState(1);
      }.bind(this));
    },

    //CloudCasa agent Install 
    async beginCloudCasaAgentInstall(cloudCasaId){
      this.localSetInstallState(2);
      
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'GET';
      networkRequest.url = networkRequest.url + 'kubeclusters/' + cloudCasaId;

      this.$store.dispatch(
        'management/request',
        networkRequest,
        { root: true },
      ).then(clusterObject => {
        this.installCloudCasaAgent(
          clusterId,
          clusterObject._id,
          clusterObject.status.agentURL,
        );
      }).catch(function(error){
        console.log('Did not find cluster in CloudCasa', error);
        this.localSetInstallState(1);
      }.bind(this));

    },
    async installCloudCasaAgent(clusterId, cloudCasaId, agentURL){
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
          this.waitForInstallComplete(cloudCasaId);

          //Apply config file to the cluster
          return this.$store.dispatch('management/request', {
            url: `/v1/management.cattle.io.clusters/` + clusterId + 
              '?action=apply',
            method: 'POST',
            data: {
              defaultNamespace: "default",
              yaml: data.data,
            }
          });
      }).catch(function(error){
        console.log('Failed to get CC config file:', error);
        this.localSetInstallState(4);
      }.bind(this));
    },
    routeToDetailedPage(id, ccid){
      this.$router.push('/CloudCasa/c/' + id + '/' + ccid);
    }
  },
}
</script>
<template>
  <button
    v-if="row.installState == 2 || row.installState == 0"
    v-bind="{disabled: row.installState == 2 ? true : null}"
    class="btn role-primary" 
    @click="startCloudCasaInstall(row.id, row.name)"
  >
    <span>
      Install <FontAwesomeIcon v-if="row.installState === 2" :icon="faSpinner" spin />
    </span>
  </button>
  <button
    v-if="row.installState == 1"
    class="btn role-primary" 
    @click="beginCloudCasaAgentInstall(row.cloudCasaId)"
  >
    <span>
      Install <FontAwesomeIcon v-if="row.installState === 2" :icon="faSpinner" spin />
    </span>
  </button>
  <a
    @click="this.routeToDetailedPage(row.id, row.cloudCasaId)"
    class="btn role-secondary"
    v-if="row.installState === 3"
  >
    View Details
  </a>
  <a
    @click="this.routeToDetailedPage(row.id, row.cloudCasaId)"
    class="btn role-secondary"
    v-if="row.installState === 4"
  >
    View Details
  </a>
</template>
<style scoped>
</style>
