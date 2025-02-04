<script>
import DashboardButton from './../components/DashboardButton.vue';
import LastThreeRuns from './../components/cluster_detail_view/LastThreeRuns.vue';

import Tabbed from '@shell/components/Tabbed';
import Tab from '@shell/components/Tabbed/Tab';
import SortableTable from '@shell/components/SortableTable';

import { CLOUDCASA_URL } from './../types/types.js';
import { MANAGEMENT } from '@shell/config/types';

export default {
  layout: 'plain',
  name: 'detailed-cluster-view',
  components: {
    DashboardButton,
    LastThreeRuns,
    SortableTable,
    Tabbed,
    Tab,
  },
  data() {
    return {
      cluster: null,
      clusterServices: null,
      clusterCloudCasaData: null,
      tableData: [],
      backupTableHeaders: [
        {
          name: 'name',
          label: 'Name',
          value: 'name',
          width: '15%',
          sort: [
            "name"
          ]
        },
        {
          name: 'policy',
          label: 'Policy',
          value: 'policy',
          width: '15%',
          sort: [
            "policy"
          ]
        },
        {
          name: 'lastRunTime',
          label: 'Last Run Time',
          value: 'lastRunTime',
          width: '20%',
          sort: [
            "lastRunTime"
          ]
        },
        {
          name: 'lastThreeRuns',
          label: 'Last 3 Runs',
          value: 'lastThreeRuns',
          width: '10%',
          sort: [
            "lastThreeRuns"
          ]
        },
        {
          name: 'spacing',
          label: ' ',
          width: '30%',
        },
        {
          name: 'additionalText',
          label: ' ',
          width: '7%',
        },
        {
          name: 'install',
          label: ' ',
          width: '3%',
        },

      ],
    }
  },
  async mounted() {
    //document.getElementsByClassName("tab-links")[0].click();

    this.cluster = await this.getCluster(this.clusterId);
    console.log(this.cluster)

    if (this.cluster != undefined) {
      this.clusterServices = await this.getClusterServicesData(this.cluster.spec.displayName);
      this.clusterCloudCasaData = await this.getCloudCasaData(this.cluster.spec.displayName);
      
      const backupData = await this.getCloudCasaBackupData(this.cloudCasaClusterId);
    }
  },
  computed: {
    installState(){
      let index = -1;
      if (this.clusterCloudCasaData != null && this.cluster != undefined) {
        index = this.clusterCloudCasaData._items.findIndex(function(data) {
          return data.name == this.clusterName;
        }.bind(this));
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
      if (this.clusterCloudCasaData != null) {
        return this.clusterCloudCasaData._items[0]._id;
      }else{
        return 'Loading...';
      }
    },
    cloudCasaLink(){
      return 'https://home.cloudcasa.io/clusters/overview/' + 
        this.cloudCasaClusterId + '/backups';
    }
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
        '?where={"name": {"$regex":"'+ clusterName +'"}}';

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
    async getCloudCasaBackupData(cloudCasaClusterId){
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-auth-header': `Bearer ${ this.cloudCasaApiKey }` 
      };
      let method = 'GET';
      let url = CLOUDCASA_URL + 'kubebackups?sort=-_updated&embedded={"policy": 1,' + 
        '"copy_policy": 1, "cluster": 1}&where={"migrationdef": ' +
        '{"$exists": false}, "cluster":"' + cloudCasaClusterId + '"}&page=1';

      const cloudCasaBackupData = await this.$store.dispatch(
        'management/request', 
        {
          url,
          method,
          headers,
          redirectUnauthorized: false,
        }, 
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch connection data, ensure your API Key 
            is correct.`,
        }, { root: true });
      }.bind(this));

      for (let i = 0; i < cloudCasaBackupData._items.length; i++){
        let copyPolicy = '';
        if (cloudCasaBackupData._items[i].copy_policy != undefined) {
          copyPolicy = cloudCasaBackupData._items[i].copy_policy.name;
        }else{
          copyPolicy = '-';
        }

        let parsedDate = '';
        if (cloudCasaBackupData._items[i].status.last_job_run_time != undefined) {
          let dateString = new Date(cloudCasaBackupData._items[i].status.
            last_job_run_time).toLocaleDateString('en-US');
          let timeString = new Date(cloudCasaBackupData._items[i].status.
            last_job_run_time).toLocaleTimeString('en-US');

          parsedDate = dateString + ' ' + timeString;
        }else{
          parsedDate = 'No Runs Have Occured';
        }

        let newJobset = new Object;
        newJobset.name = cloudCasaBackupData._items[i].name;
        newJobset.policy = copyPolicy;
        newJobset.lastRunTime = parsedDate;
        newJobset.lastThreeRuns = cloudCasaBackupData._items[i].status.jobs

        this.tableData.push(newJobset);
        console.log(this.tableData);
      }
    },
  },

}
</script>
<template>
  <div class="header">
    <div class="section sub-header">
      <h1>{{this.clusterName}} (ID: {{this.cloudCasaClusterId}})</h1>
    </div>
    <DashboardButton :dashboardLink="this.cloudCasaLink" />
  </div>
  <div v-if="this.installState === 3" class="custom-badge green">
    Connection Established
  </div>
  <div v-if="this.installState === 4" class="custom-badge red">
    Not Connected
  </div>
  <Tabbed>
    <Tab
      name="Backups"
      :label="Backups"
      :weight="10"
    >
      <SortableTable
        :rows="this.tableData"
        :headers="this.backupTableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
      >
        <template #cell:name="{ row }">
          {{ row.name }}
        </template>
        <template #cell:policy="{ row }">
          {{ row.policy }}
        </template>
        <template #cell:lastRunTime="{ row }">
          {{ row.lastRunTime}}
        </template>
        <template #cell:lastThreeRuns="{ row }">
          <LastThreeRuns />
        </template>
      </SortableTable>
    </Tab>
    <Tab
      name="Restores"
      :label="Restores"
      :weight="9"
    >
      Testing!
    </Tab>
    <Tab
      name="Migration"
      :label="Migration"
      :weight="8"
    >
      Testing!
    </Tab>
    <Tab
      name="Replication"
      :label="Replication"
      :weight="7"
    >
      Testing!
    </Tab>
  </Tabbed>
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
