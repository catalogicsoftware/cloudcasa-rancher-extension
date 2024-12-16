<script>
import StatusTable from './../models/StatusTable.vue';
import SortableTable from '@shell/components/SortableTable';
import { MANAGEMENT } from '@shell/config/types';
import axios from "axios"

export default {
  components: {
    SortableTable,
  },
  data() {
    return {
      tableHeaders: [
        {
          name: 'name',
          label: 'Name',
          value: 'id',
          width: '25%',
        },
        {
          name: 'hasCloudCasa',
          label: 'CloudCasa Installed?',
          value: 'hasCloudCasa',
          width: '25%',
        },
        {
          name: 'serviceStatus',
          label: 'CloudCasa Service Status',
          value: 'serviceStatus',
          width: '25%',
        },
        {
          name: 'configLink',
          label: 'CloudCasa Cluster Dashboard',
          value: 'configLink',
          width: '15%',
        },
        {
          name: 'install',
          label: 'Install',
          width: '9%',
        }
        //Do uninstall as well
      ],
      cloudCasaData: [],
      clusters: [],
      cloudCasaClusterData: [],
    };
  },
  async mounted() {
    let clusterData = await this.getClusters();
    this.ccClusterData = await this.getCCClusters();

    //Add a check to cloud casa to check for backup errors?
    for (let i = 0; i < clusterData.length; i++) { 
      let newCluster = StatusTable;
      newCluster.hasCloudCasa = false;
      newCluster.serviceStatus = "Not Installed";
      newCluster.configLink = "No CC Config Found";

      let clusterServiceData = await this.getClusterData(clusterData[i].id);

      for (let f = 0; f < clusterServiceData.data.length; f++) {
        if (clusterServiceData.data[f].metadata.namespace == "cloudcasa-io") {
          let index = this.ccClusterData.data._items.findIndex(function(data) {
            return data.name == clusterData[i].id;
          });

          newCluster.hasCloudCasa = true;
          newCluster.serviceStatus = clusterServiceData.data[f].metadata.state.name;
          newCluster.configLink = "https://home.cloudcasa.io/clusters/overview/" + 
            this.ccClusterData.data._items[index]._id + "/backups";
          break;
        }
      }
     
      newCluster.id = clusterData[i].id;
      this.cloudCasaData.push(newCluster);
    }

    return this.cloudCasaData;
  },
  methods: {
    //Need to update methods to listen to changes, right now only page refresh 
    //gets new data.
    async getClusters(){
      return await this.$store.dispatch(`management/findAll`, {
        type: MANAGEMENT.CLUSTER,
      });
    },
    async getClusterData(cluster) {
      return await this.$store.dispatch('cluster/request', {
        url: `/k8s/clusters/` + cluster + `/v1/services`,
      });
    },
    async getCCClusters(){
      return await axios.get(
        'https://api.cloudcasa.io/api/v1/kubeclusters',
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': process.env.VUE_APP_CLOUDCASA_API_KEY,
          }
        }
      );
    },
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
  <SimpleBox>
    <div class="header">
      <div class="section sub-header">
        <h1>Clusters</h1>
      </div>
      <div class="section actions">
        <a 
          href="https://home.cloudcasa.io/dashboard" 
          class="btn role-primary" 
          label="Open CloudCasa"
         >
          My Dashboard
        </a>
      </div>
    </div>
    <div v-if="this.cloudCasaData != undefined">
      <SortableTable
        :rows="this.cloudCasaData"
        :headers="tableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
      >
        <template #cell:name="{ row }">
          {{ row.id }}
        </template>
        <template #cell:hasCloudCasa="{ row }">
          <div v-if="row.hasCloudCasa === true">
            <i class="icon-checkmark" />
          </div>
          <div v-if="row.hasCloudCasa === false">
            <i class="icon-x" />
          </div>
        </template>
        <template #cell:serviceStatus="{ row }">
          {{ row.serviceStatus[0].toUpperCase() + row.serviceStatus.slice(1) }}
        </template>
        <template #cell:configLink="{ row }">
          <div v-if="row.hasCloudCasa === false">
            {{ row.configLink }}
          </div>
          <div v-if="row.hasCloudCasa === true">
            <a v-bind:href="row.configLink" target="_Blank">CloudCasa Cluster Dashboard</a>
          </div>
        </template>
        <template #cell:install="{ row }">
          <button 
            v-bind="{disabled: row.hasCloudCasa != true ? null : true}"

            class="btn role-primary" 
            @click="createClusterOnCC(row.id)"
           >
            Install
          </button>
        </template>
      </SortableTable>
    </div>
  </SimpleBox>
</template>
<style>
  .header{
    display: flex;
    margin-bottom: 1rem;
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
</style>
