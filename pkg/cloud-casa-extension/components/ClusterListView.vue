<script>
import StatusTable from './../models/StatusTable.vue';
import DashboardButton from './../components/cluster_list_view/DashboardButton.vue';
import InstallButton from './../components/cluster_list_view/InstallButton.vue';
import ClusterState from './../components/cluster_list_view/ClusterState.vue';

import ActionDropdown from '@shell/components/ActionDropdown';
import SortableTable from '@shell/components/SortableTable';
import { MANAGEMENT } from '@shell/config/types';

import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
 
export default {
  components: {
    SortableTable,
    DashboardButton,
    InstallButton,
    ClusterState,
    ActionDropdown,
    FontAwesomeIcon,
  },
  setup() {
    return {
      faTriangleExclamation
    }
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
          width: '49%',
        },
        {
          name: 'additionalText',
          label: ' ',
          width: '3%',
        },
        {
          name: 'install',
          label: ' ',
          width: '3%',
        },
      ],
      data: [],
      clusterCount: 0,
    };
  },
  //Need to split this up
  async mounted() {
    let clusterData = await this.getClusters();
    let cloudCasaData = await this.getCloudCasaData();
    this.clusterCount = clusterData.length;

    for (let i = 0; i < clusterData.length; i++) { 
      let newCluster = StatusTable;
      newCluster.id = clusterData[i].id;
      newCluster.installState = 0;
      newCluster.lastUpdated = "No Date Available"

      if (clusterData[i].metadata.state.name != "active") {
        continue;
      }

      let clusterServiceData = await this.getClusterData(clusterData[i].id);

      for (let f = 0; f < clusterServiceData.data.length; f++) {
        newCluster = this.parseNewCluster(
          newCluster, 
          cloudCasaData, 
          clusterServiceData.data[f],
        );
        if (newCluster.installState == 3){
          break;
        }
      }
    
      this.data.push(newCluster);
    }

    return this.cloudCasaData;
  },
  methods: {
    setInstallState(value, row){
      row.installState = value;
    },
    //Need to update methods to listen to changes, right now only page refresh 
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
    async getCloudCasaData(){
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
    parseNewCluster(newCluster, cloudCasaData, clusterServiceData){
      let index = cloudCasaData.data._items.findIndex(function(data) {
        return data.name == newCluster.id;
      });
      
      if (index == -1) {
        if (clusterServiceData.metadata.namespace == "cloudcasa-io") {
          newCluster.installState = 4;
        }
      }

      if (index != -1) {
        newCluster.lastUpdated = cloudCasaData.data._items[index]._updated
        newCluster.serviceStatus = clusterServiceData.metadata.state.name;

        if (clusterServiceData.metadata.namespace == "cloudcasa-io") {
          newCluster.installState = 3;
        }else{
          newCluster.installState = 1;
        }
      }
      
      return newCluster;
    }
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
      <DashboardButton />
    </div>
    <div v-if="this.data != undefined">
      <SortableTable
        :rows="this.data"
        :headers="tableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="true"
      >
        <template #cell:name="{ row }">
          {{ row.id }}
        </template>
        <template #cell:installState="{ row }">
          <ClusterState :installState="row.installState" />
        </template>
        <template #cell:serviceStatus="{ row }">
          {{ row.serviceStatus[0].toUpperCase() + row.serviceStatus.slice(1) }}
        </template>
        <template #cell:additionalText="{ row }">
          <div class="yellow-text" v-if="row.installState === 4">
            <div class="tooltip">
              <FontAwesomeIcon :icon="faTriangleExclamation" /> Error 
              <span class="tooltiptext">
                This agent is not currently found in CloudCasa.
              </span>
            </div>
          </div>
          <div class="green-text" v-if="row.installState === 3">
            ✔ Installed
          </div>
        </template>
        <template #cell:install="{ row }">
          <InstallButton 
            :row="row" 
            @install-state-func="setInstallState"
          />
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
    --warning-yellow: #D8A01E;
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

  .green-text{
    font-size: 20px;
    color: var(--active-green);
  }
  
  .yellow-text{
    font-size: 20px;
    color: var(--warning-yellow);
  }

  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip .tooltiptext {
    font-size: 14px;
    visibility: hidden;
    width: 160px;
    background-color: #4A4B52;
    color: #fff;
    text-align: left;
    border-radius: 6px;
    padding: 10px;

    /* Position the tooltip */
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -80px;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
  }

  .tooltip .tooltiptext::after {
    content: " ";
    position: absolute;
    top: 100%; /* At the bottom of the tooltip */
    left: 50%;
    margin-left: -8px;
    border-width: 8px;
    border-style: solid;
    border-color: #4A4B52 transparent transparent transparent;
  }
</style>
