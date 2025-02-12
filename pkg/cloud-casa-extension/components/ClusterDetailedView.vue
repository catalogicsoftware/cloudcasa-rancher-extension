<script>
import DashboardButton from './DashboardButton.vue';
import JobsTable from './cluster_detail_view/JobsTable.vue';
import CoverageCards from './cluster_detail_view/CoverageCards.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

import Tabbed from '@shell/components/Tabbed';
import Tab from '@shell/components/Tabbed/Tab';
import SortableTable from '@shell/components/SortableTable';

import { CLOUDCASA_URL } from './../types/types.js';
import { getCloudCasaRequest, getCloudCasaApiKey } from './../modules/network.js';
import { MANAGEMENT } from '@shell/config/types';

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
      faArrowLeft
    }
  },
  data() {
    return {
      cluster: null,
      ccid: null,
      clusterServices: null,
      clusterCloudCasaData: null,
    }
  },
  async mounted() {
    this.cluster = await this.getCluster(this.clusterId);

    if (this.cluster != undefined) {
      this.clusterServices = await this.getClusterServicesData(
        this.cluster.spec.displayName
      );
      this.clusterCloudCasaData = await this.getCloudCasaData(
        this.cluster.spec.displayName
      );

      console.log(this.clusterCloudCasaData);
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
    cloudCasaLink(){
      return 'https://home.cloudcasa.io/clusters/overview/' + 
        this.cloudCasaClusterId + '/backups';
    },
  },
  methods: {
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
      ).catch(function(error){
        console.log(error);
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch connection data, ensure your API Key 
            is correct.`,
        }, { root: true });
      }.bind(this));
    },
    routeToMainPage(){
      this.$router.push('/cloud-casa/dashboard');
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
          <DashboardButton :dashboardLink="this.cloudCasaLink" />
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
        <JobsTable :cloudCasaClusterId="this.cloudCasaClusterId" />
      </div>
      <div v-else>
        Loading Jobs...
      </div>
    </div>
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
  
  svg {
    margin-right: 10px;
  }

  a{
    font-size: 20px;
  }

  .center-all{
    width: 100%;
  }

  .max-width{
    width: 1440px;
    display: block;
    margin-left: auto;
    margin-right: auto;  
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
