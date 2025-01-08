<script>
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

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
  },
  data(){
    return {
      ccWaitTimer: null
    }
  },
  methods: {
    localSetInstallState(value){
      this.$emit("install-state-func", value, this.row);
    },
    async createInstallCloudCasa(clusterName){
      this.localSetInstallState(2);

      let cloudCasaResponse = await this.registerClusterOnCloudCasa(clusterName); 
      
      if (cloudCasaResponse == undefined) {
        return;
      }

      this.installCloudCasaAgent(
        clusterName, 
        cloudCasaResponse.data.status.agentURL,
      );
    },
    async installAgentOnRancherCluster(clusterName){
      this.localSetInstallState(2);

      axios.get(
        'https://api.cloudcasa.io/api/v1/kubeclusters?where=' + 
          '{"name":{"$regex":"'+ clusterName +'"}}',
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': process.env.VUE_APP_CLOUDCASA_API_KEY,
          }
        }
      ).then(clusterObject => {
        this.installCloudCasaAgent(
          clusterName, 
          clusterObject.data._items[0].status.agentURL,
        );
      });
    },
    async registerClusterOnCloudCasa(clusterName){
      return await axios.post(
        'https://api.cloudcasa.io/api/v1/kubeclusters',
        {
          "name": clusterName,
          "description": "Created for testing purposes",
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': process.env.VUE_APP_CLOUDCASA_API_KEY,
          }
        }
      ).catch(function(error){
        console.log("Failed to create CC cluster:",error);
        this.localSetInstallState(4);
      }.bind(this));
    },
    async installCloudCasaAgent(clusterName, agentURL){
      //Get Config file and apply to local cluster
      return await fetch(agentURL).then(
        response=> response.text()
      ).then(data => {
          this.waitForInstallComplete(clusterName);
          return this.$store.dispatch('management/request', {
            url: `/v1/management.cattle.io.clusters/` + clusterName + '?action=apply',
            method: 'POST',
            data: {
              defaultNamespace: "default",
              yaml: data,
            }
          });
        }
      ).catch(function(error){
        console.log("Failed to get CC config file:", error);
        this.localSetInstallState(4);
      }.bind(this));
    },
    waitForInstallComplete(clusterName){
      this.ccWaitTimer = setInterval(() => {
        axios.get(
          'https://api.cloudcasa.io/api/v1/kubeclusters?where=' + 
            '{"name":{"$regex":"'+ clusterName +'"}}',
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Authorization': process.env.VUE_APP_CLOUDCASA_API_KEY,
            }
          }
        ).then(clusterObject => {
          let status = clusterObject.data._items[0].status.state;
          
          if (status == "ACTIVE"){
            this.localSetInstallState(3)
            clearInterval(this.ccWaitTimer)
          }
        });
      }, 10000)
    },
    beforeDestroy() {
      clearInterval(this.ccWaitTimer)
    }
  },
}
</script>
<template>
  <button
    v-if="row.installState == 2 || row.installState == 0"
    v-bind="{disabled: row.installState == 2 ? true : null}"
    class="btn role-primary" 
    @click="createInstallCloudCasa(row.id)"
  >
    <span>
      Install <FontAwesomeIcon v-if="row.installState === 2" :icon="faSpinner" spin />
    </span>
  </button>
  <button
    v-if="row.installState == 1"
    class="btn role-primary" 
    @click="installAgentOnRancherCluster(row.id)"
  >
    <span>
      Install
    </span>
  </button>
  <button
    class="btn role-secondary"
    v-if="row.installState === 3"
  >
    View Details
  </button>
  <button
    class="btn role-secondary"
    v-if="row.installState === 4"
  >
    View Details
  </button>
</template>
<style scoped>
</style>
