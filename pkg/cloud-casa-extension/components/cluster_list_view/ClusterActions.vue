<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { CLOUDCASA_URL, CRD_NAME } from './../../types/types.js';

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
        }).catch(function(error){
          this.$store.dispatch('growl/error', {
            title: 'Something Went Wrong',
            message: `CloudCasa could not be reached, this was likely do a 
            network issue.`,
          }, { root: true });
        }.bind(this));
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
      const findExistingConfig = await this.$store.dispatch(
        'management/findAll', 
        { type: CRD_NAME },
      ).catch(function(error){
        console.log(error);
      });

      let clusterPrefix = findExistingConfig[0].spec.clusterPrefix;

      if (clusterPrefix.length > 0) {
        clusterPrefix = clusterPrefix + '-';
      }

      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'POST';
      networkRequest.url = networkRequest.url + 'kubeclusters';
      networkRequest.data = {
        'name': clusterPrefix + clusterName,
        'description': 'Cluster setup with the CloudCasa Rancher Extension.',
      };

      return await this.$store.dispatch(
        'management/request', 
        networkRequest, 
        { root: true },
      ).catch(function(error){
        console.log("Failed to create CC cluster:", error);
        this.localSetInstallState(1);
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Failed to register cluster with CloudCasa, this is most 
          likely due to a duplicate cluster name. Check the console for details.`,
        }, { root: true });
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
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `The cluster was not found within CloudCasa, ensure it is 
          registered or restart the install process.`,
        }, { root: true });
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
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `The CloudCasa agent could not be installed on the cluster.
          Ensure the cluster is online.`,
        }, { root: true });
      }.bind(this));
    },
    async uninstallCloudCasaAgent(){
      return await this.$store.dispatch('cluster/request', {
        url: `/v1/namespace/cloudcasa-io`,
        method: 'DELETE',
      }).then(function(){
        this.$store.dispatch('growl/success', {
          title: 'Agent Removed',
          message: `The CloudCasa Agent has been successfully removed.`,
        }, { root: true });
        this.localSetInstallState(0);
      }.bind(this)).catch(function(error){
        console.log(error);
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `The CloudCasa Agent was not removed, make sure it still exists.`,
        }, { root: true });
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
  <div v-if="row.installState === 3">
    <a
      @click="this.routeToDetailedPage(row.id, row.cloudCasaId)"
      class="btn role-secondary"
      
    >
      View Details
    </a>
    <button
      class="btn role-primary" 
      @click="uninstallCloudCasaAgent(row.cloudCasaId)"
    >
      <span>
        Uninstall
      </span>
    </button>
  </div>
  <div v-if="row.installState === 4">
    <a
      @click="this.routeToDetailedPage(row.id, row.cloudCasaId)"
      class="btn role-secondary"
    >
      View Details
    </a>
    <button
      class="btn role-primary" 
      @click="uninstallCloudCasaAgent(row.cloudCasaId)"
    >
      <span>
        Uninstall
      </span>
    </button>
  </div>
</template>
<style scoped>
</style>
