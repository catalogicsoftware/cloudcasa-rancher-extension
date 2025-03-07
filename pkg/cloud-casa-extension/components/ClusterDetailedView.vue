<script>
import { ref } from 'vue';

import DashboardButton from './DashboardButton.vue';
import JobsTable from './cluster_detail_view/JobsTable.vue';
import CoverageCards from './cluster_detail_view/CoverageCards.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faRefresh, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

import Tabbed from '@shell/components/Tabbed';
import Tab from '@shell/components/Tabbed/Tab';
import SortableTable from '@shell/components/SortableTable';

import { CLOUDCASA_URL, PRODUCT_NAME } from './../types/types.js';
import { MANAGEMENT } from '@shell/config/types';

import { 
  getCloudCasaRequest, 
  getCloudCasaApiKey,
  getCloudCasaEndpoint,
} from './../modules/network.js';

const jobsTable = ref(0);
export default {
  layout: 'plain',
  name: 'detailed-cluster-view',
  components: {
    FontAwesomeIcon,
    DashboardButton,
    JobsTable,
    CoverageCards,
    SortableTable,
    Tabbed,
    Tab,
  },
  setup(){
    return {
      faArrowLeft,
      faRefresh
    }
  },
  data() {
    return {
      dashboardName: 'CloudCasa Cluster Dashboard',
      cluster: null,
      ccid: null,
      clusterServices: null,
      clusterCloudCasaData: null,
      mainDashboardLink: '',
      dataRefreshed: true,
    }
  },
  async mounted() {
    let endpoint = await getCloudCasaEndpoint(this.$store);
    this.mainDashboardLink = 'https://' + endpoint.replace('api/v1/', '') 
      + 'overview/' + this.cloudCasaClusterId + '/backups';

    this.cluster = await this.getCluster(this.clusterId);

    if (this.cluster != undefined) {
      this.clusterServices = await this.getClusterServicesData(
        this.cluster.spec.displayName
      );
      await this.getCloudCasaData(this.clusterId);
    }
  },
  computed: {
    installState(){
      let index = -1;
      if (this.clusterCloudCasaData != null && this.cluster != undefined) {
        if (this.clusterCloudCasaData._id == this.cloudCasaClusterId)
          index = 0;
      }

      if (index != -1) {
        return 3;
      } else {
        return 4;
      }
    },
    clusterName(){
      if (this.cluster != undefined) {
        return this.cluster.spec.displayName;
      }
    },
    clusterId(){
      return this.$route.params.cluster;
    },
    cloudCasaClusterId(){
      return this.$route.params.ccid;
    },
  },
  methods: {
    async refreshData(){
      this.dataRefreshed = false;
      let promises = [];

      promises.push(this.getCloudCasaData());
      promises.push(this.$refs.jobsTable.getAllClusterDetailData());
     
      Promise.all(promises).then(function(){
        this.$store.dispatch('growl/success', {
          title: 'Success',
          message: `Cluster Metrics and table data are refreshed!`,
        }, { root: true });
        this.dataRefreshed = true;
      }.bind(this)).catch(function(error){
        //console.log(error);
        this.$store.dispatch('growl/error', {
          title: 'Error',
          message: `Something went wrong refreshing the data, refresh the page.`,
        }, { root: true });
        this.dataRefreshed = true;
      }.bind(this));

    },
    async getCluster(clusterId){
      return await this.$store.dispatch(`management/find`, {
        type: MANAGEMENT.CLUSTER,
        id: clusterId,
      });
    },
    async getClusterServicesData(clusterId) {
      return await this.$store.dispatch('cluster/request', {
        url: `/k8s/clusters/` + this.clusterId + `/v1/services`,
      });
    },
    async getCloudCasaData(clusterName){
      let networkRequest = await getCloudCasaRequest(this.$store);

      if (networkRequest.headers == undefined) {
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch an API Key, try reconfiguring the 
            extension.`,
        }, { root: true });
        return;
      }

      networkRequest.method = 'GET';
      networkRequest.url = networkRequest.url + 
        `kubeclusters/${this.cloudCasaClusterId}?metrics={"days": 7}&embedded={
          "backup_provider.user_objectstore": 1
        }`;

      //Grab cluster data to calculate id and connection status
      return await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).then(function(response){
        this.clusterCloudCasaData = response;
      }.bind(this)).catch(function(error){
        //console.log(error);
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch connection data, ensure your API Key 
            is correct.`,
        }, { root: true });
      }.bind(this));
    },
    routeToMainPage(){
      this.$router.push('/' + PRODUCT_NAME + '/dashboard');
    }
  },
}
</script>
<template>
  <div class="center-all">
    <div class="max-width">
      <a 
        @click="this.routeToMainPage()"
        target="_Blank"
        class="btn role-primary" 
        label="Cluster List"
       >
        <FontAwesomeIcon :icon="faArrowLeft" /> Back To Cluster List
      </a>
      <div style="display: inline-block"></div>
      <div class="m-25"></div>
      <div class="header">
        <div class="section sub-header">
          <h1>{{this.clusterName}} (ID: {{this.cloudCasaClusterId}})</h1>
        </div>
        <div class="section actions">
          <a 
            @click="this.refreshData()"
            class="btn role-primary" 
            label="Refresh Data"
            v-bind="{disabled: this.dataRefreshed ? null : true}"
           >
            <div v-if="this.dataRefreshed">
              <FontAwesomeIcon :icon="faRefresh" /> Refresh Data
            </div>
            <div v-if="!this.dataRefreshed">
              <FontAwesomeIcon :icon="faRefresh" spin /> Refresh Data
            </div>
          </a>
          <DashboardButton 
            :dashboardName="this.dashboardName"
            :dashboardLink="this.mainDashboardLink" 
          />
        </div>
      </div>
      <div v-if="this.installState === 3" class="custom-badge green">
        Connection Established
      </div>
      <div v-if="this.installState === 4" class="custom-badge red">
        Not Connected
      </div>
      <h1 class="cluster-header">Cluster Metrics (Last 7 Days)</h1>
      <div class="m-5"></div>
      <CoverageCards :clusterCloudCasaData="this.clusterCloudCasaData" />
      <div class="m-20"></div>
      <div v-if="this.cloudCasaClusterId != 'Loading...'">
        <JobsTable 
          ref="jobsTable" 
          :cloudCasaClusterId="this.cloudCasaClusterId" 
        />
      </div>
      <div v-else>
        Loading Jobs...
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
  }

  .light-gray{
    color: #B6B6C2;
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
    margin-left: 10px;
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
    border-color: #5D995D;
    color: #5D995D;
  }

  .custom-badge.gray{
    border-color: #828282;
    color: #828282;
  }

  .custom-badge.red{
    border-color: #F64747;
    color: #F64747;
  }
</style>
