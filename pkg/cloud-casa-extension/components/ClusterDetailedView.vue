<script>
import DashboardButton from './../components/DashboardButton.vue';
import { CLOUDCASA_URL } from './../types/types.js';

export default {
  layout: 'plain',
  name: 'detailed-cluster-view',
  components: {
    DashboardButton,
  },
  data() {
    return {
      cluster: null,
      clusterCloudCasaData: null,
    }
  },
  async mounted() {
    //document.getElementsByClassName("tab-links")[0].click();

    this.cluster = await this.getClusterData(this.clusterName);
    this.clusterCloudCasaData = await this.getCloudCasaData();
  },
  computed: {
    installState(){
      let clusterId = this.$route.params.cluster;
      let index = -1;
      if (this.clusterCloudCasaData != null) {
        index = this.clusterCloudCasaData._items.findIndex(function(data) {
          return data.name == clusterId;
        });
      }

      if (index != -1) {
        return 3;
      } else {
        return 4;
      }
    },
    clusterName(){
      return this.$route.params.cluster;
    },
    clusterId(){
      if (this.clusterCloudCasaData != null) {
        return this.clusterCloudCasaData._items[0]._id;
      }else{
        return 'Loading...';
      }
    },
    cloudCasaLink(){
      return 'https://home.cloudcasa.io/clusters/overview/' + this.clusterId +
        '/backups';
    }
  },
  methods: {
    async getClusterData(cluster) {
      return await this.$store.dispatch('cluster/request', {
        url: `/k8s/clusters/` + cluster + `/v1/services`,
      });
    },
    async getCloudCasaData(){
      //TODO: Need to make this a module
      const cloudCasaApiKeyResponse = await this.$store.dispatch(
        'management/findAll', 
        { type: 'cloudcasa.rancher.io.configuration' },
      );

      if (cloudCasaApiKeyResponse.length != 0) {
        this.cloudCasaApiKey = cloudCasaApiKeyResponse[0].spec.apiToken;
      }else{
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch an API Key, try reconfiguring the 
            extension.`,
        }, { root: true });
      }

      //Grab cluster data to calculate id and connection status
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-auth-header': `Bearer ${ this.cloudCasaApiKey }` 
      };
      let method = 'GET';
      let url = CLOUDCASA_URL + 'kubeclusters' + 
        '?where={"name": {"$regex":"'+ this.$route.params.cluster +'"}}';

      return await this.$store.dispatch(
        'management/request', 
        {
          url,
          method,
          headers,
          redirectUnauthorized: false,
        }, 
        { root: true },
      ).catch(function(error){
        console.log(error);
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch connection data, ensure your API Key 
            is correct.`,
        }, { root: true });
      }.bind(this));
    },
  }
}
</script>
<template>
  <div class="header">
    <div class="section sub-header">
      <h1>{{this.clusterName}} (ID: {{this.clusterId}})</h1>
    </div>
    <DashboardButton :dashboardLink="this.cloudCasaLink" />
  </div>
  <div v-if="this.installState === 3" class="custom-badge green">
    Connection Established
  </div>
  <div v-if="this.installState === 4" class="custom-badge red">
    Not Connected
  </div>
</template>
<style>
  :root{
    --active-green: #5D995D;
    --failure-red: #F64747;
    --neutral-gray: #828282;
    --light-gray: #B6B6C2;
    --warning-yellow: #D8A01E;
  }

  .light-gray{
    color: var(--light-gray);
  }

  .header{
    display: flex;
    margin-bottom: 0.5rem;
    .section{
      width: 50%;
    }
  }

  .sub-header h1{
    float: left;
  }

  .actions a{
    float:right;
  }

  .main-spacing{
    margin: 2rem;
  }

  .cluster-header{
    margin-top: 20px;
    margin-bottom: 25px;
  }
  
  .custom-badge{
    width: fit-content;
    display: block;
    margin-bottom: 0.5rem;
    padding: 2px 10px 3px 10px;
    border-width: 1px;
    border-style: solid;
    border-radius: 20px;
  }

  .custom-badge.green{
    border-color: var(--active-green);
    color: var(--active-green);
  }

  .custom-badge.gray{
    border-color: var(--neutral-gray);
    color: var(--neutral-gray);
  }

  .custom-badge.red{
    border-color: var(--failure-red);
    color: var(--failure-red);
  }
</style>
