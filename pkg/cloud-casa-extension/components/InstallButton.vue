<script>
export default {
  props: {
    clusterName: String,
    installState: String
  },
  methods: {
    async createClusterOnCC(clusterName){
      //Adding loading indicator in UI
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
  },
}
</script>
<template>
  <button 
    v-bind="{disabled: installState != 1 ? true : null}"
    class="btn role-primary" 
    @click="createClusterOnCC(clusterName)"
   >
   Install
  </button>
</template>
<style scoped>
  button{
    font-size: 20px;
  }
</style>
