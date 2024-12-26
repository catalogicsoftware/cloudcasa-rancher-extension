<script>
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export default {
  emits: ['setInstallState'],
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
      this.$emit("data-sent", value, this.row);
    },
    async createClusterOnCC(clusterName){
      this.localSetInstallState(2);
      //Need error handling on all calls here
      //Need to split these up into seperate awaits/chain them
      const cloudCasaResponse = await axios.post(
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
      );
      return await fetch(cloudCasaResponse.data.status.agentURL).then(
        response=> response.text()
      ).then(data => {
          this.waitForInstallComplete();
          return this.$store.dispatch('management/request', {
            url: `/v1/management.cattle.io.clusters/` + clusterName + '?action=apply',
            method: 'POST',
            data: {
              defaultNamespace: "default",
              yaml: data,
            }
          });
        }
      );
    },
    waitForInstallComplete(){
      this.timer = setInterval(() => {
        axios.get(
          'https://api.cloudcasa.io/api/v1/kubeclusters?where={"name":{"$regex":"local"}}',
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
            clearInterval(this.timer)
          }
        });
      }, 10000)
    },
    beforeDestroy() {
      clearInterval(this.timer)
    }
  },
}
</script>
<template>
  <button
    v-if="row.installState !== 3"
    v-bind="{disabled: row.installState != 1 ? true : null}"
    class="btn role-primary" 
    @click="createClusterOnCC(row.id)"
  >
    <span>
      Install <FontAwesomeIcon v-if="row.installState === 2" :icon="faSpinner" spin />
    </span>
  </button>
  <button
    class="btn role-secondary"
    v-if="row.installState === 3"
  >
    View Details
  </button>
</template>
<style scoped>
  button{
    font-size: 20px;
  }
</style>
