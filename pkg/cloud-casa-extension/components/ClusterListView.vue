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
          name: 'id',
          label: 'Cluster',
          value: 'id',
          width: '15%',
          sort: [
            "id"
          ]
        },
        {
          name: 'installState',
          label: 'State',
          value: 'installState',
          width: '15%',
          sort: [
            "installState"
          ]
        },
        {
          name: 'lastUpdated',
          label: 'Last Updated',
          value: 'lastUpdated',
          width: '15%',
          sort: [
            "lastUpdated"
          ]
        },
        {
          name: 'spacing',
          label: ' ',
          width: '52%'
        },
        {
          name: 'install',
          label: ' ',
          width: '3%',
        }
      ],
      cloudCasaData: [],
      clusters: [],
      cloudCasaClusterData: [],
      clusterCount: 0,
    };
  },
  //Need to split this up
  async mounted() {
    let clusterData = await this.getClusters();
    this.ccClusterData = await this.getCCClusters();
    this.clusterCount = clusterData.length;

    //Add a check to cloud casa to check for backup errors?
    for (let i = 0; i < clusterData.length; i++) { 
      let newCluster = StatusTable;
      newCluster.installState = 1;
      newCluster.lastUpdated = "No Date Available"
      //newCluster.configLink = "No CC Config Found";

      if (clusterData[i].metadata.state.name != "active") {
        continue;
      }

      let clusterServiceData = await this.getClusterData(clusterData[i].id);

      for (let f = 0; f < clusterServiceData.data.length; f++) {
        if (clusterServiceData.data[f].metadata.namespace == "cloudcasa-io") {
          let index = this.ccClusterData.data._items.findIndex(function(data) {
            return data.name == clusterData[i].id;
          });


          newCluster.installState = 3;
          newCluster.lastUpdated = this.ccClusterData.data._items[index]._updated
          newCluster.serviceStatus = clusterServiceData.data[f].metadata.state.name;
          /*newCluster.configLink = "https://home.cloudcasa.io/clusters/overview/" + 
            this.ccClusterData.data._items[index]._id + "/backups";*/
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
  <div class="main-spacing">
    <div class="header">
      <div class="section sub-header">
        <h1>Clusters</h1>
        <span class="badge-state role-tertiary ml-20 mr-20 custom-badge-state">
          {{ clusterCount }}
        </span>
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
        :row-actions="true"
      >
        <template #cell:name="{ row }">
          {{ row.id }}
        </template>
        <template #cell:installState="{ row }">
          <div v-if="row.installState === 1" class="custom-badge gray">
            Not Paired
          </div>
          <div v-if="row.installState === 2" class="installing-text">
            Installing...
          </div>
          <div v-if="row.installState === 3" class="custom-badge green">
            Active
          </div>
          <div v-if="row.installState === 4" class="custom-badge red">
            Failed
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
  </div>
</template>
<style>
  :root{
    --active-green: #5D995D;
    --failure-red: #F64747;
    --neutral-gray: #828282;
  }

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

  .main-spacing{
    margin: 2rem;
  }

  .custom-badge-state{
    align-items: center;
    display: inline-flex;
    padding: 2px 10px 2px 10px;
    border-radius: 20px;
    border: 1px solid transparent;
  }

  tr{
    th:first-child{
      padding: 20px 0px 20px 10px !important;
    }

    th{
      padding: 20px 0px 20px 0px !important;
      font-size: 15px;
      .icon-stack{
        margin-left: 5px;
      }
    }

    td:first-child{
      padding: 10px 0px 10px 10px !important;
    }

    td:last-child{
      padding: 10px 10px 10px 0px !important;
    }

    td{
      font-size: 15px;
      padding: 10px 0px 10px 0px !important;
    }
  }

  .installing-text{
    color: #B6B6C2;
  }

  .custom-badge{
    padding: 2px 10px 3px 10px;
    border-width: 1px;
    border-style: solid;
    border-radius: 20px;
    display: inline-block;
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
