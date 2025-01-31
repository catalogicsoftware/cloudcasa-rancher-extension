<script>
import { defineComponent } from 'vue';
import DashboardButton from './../components/DashboardButton.vue';
import InstallButton from './../components/cluster_list_view/InstallButton.vue';
import ClusterState from './../components/cluster_list_view/ClusterState.vue';

import SortableTable from '@shell/components/SortableTable';
import { BadgeState } from '@components/BadgeState';
import { MANAGEMENT } from '@shell/config/types';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
 
export default defineComponent({
  layout: 'home',
  components: {
    SortableTable,
    DashboardButton,
    BadgeState,
    InstallButton,
    ClusterState,
    FontAwesomeIcon,
  },
  setup() {
    return {
      faTriangleExclamation
    }
  },
  data() {
    return {
      OBSERVABILITY_CRD: {
        apiVersion: 'apiextensions.k8s.io/v1',
        kind:       'CustomResourceDefinition',
        metadata:   { name: 'configurations.cloudcasa.rancher.io' },
        spec:       {
          group:    'cloudcasa.rancher.io',
          versions: [
            {
              name:    'v1beta1',
              served:  true,
              storage: true,
              schema:  {
                openAPIV3Schema: {
                  type:       'object',
                  properties: {
                    spec: {
                      type:       'object',
                      properties: {
                        name:          { type: 'string' },
                        apiToken:     { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          ],
          scope: 'Namespaced',
          names: {
            plural:   'configurations',
            singular: 'configuration',
            kind:     'Configuration',
            listKind: 'ConfigurationList',
          },
        },
      },
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
          width: '20%',
          sort: [
            "lastUpdated"
          ]
        },
        {
          name: 'spacing',
          label: ' ',
          width: '40%',
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
      parsedClusterData: [],
      mainDashboardLink: 'https://home.cloudcasa.io/dashboard',
    };
  },
  //Need to split this up
  async mounted() {
    /*const setRes = await this.$store.dispatch('cloudcasa/setApiToken', "test-token");

    const config = {
      metadata: { name: `configurations.rancher.io.cloudcasa`, namespace: 'default' },
      spec:     {
        apiToken: "testing-CHECK"
      },
      type:     "cloudcasa.rancher.io.configuration",
    };

    let newConfig = await this.$store.dispatch('management/create', config)
    console.log(newConfig)
    newConfig.save();

    //If in store we can see it here
    console.log("from store", this.$store.getters["cloudcasa/apiToken"]);

    let settings = await this.testGetRancherSettings();
    console.log("from server", settings);*/

    this.parsedClusterData = [];
    let rancherClusterData = await this.getClustersFromRancher();
    let cloudCasaClusterData = await this.getCloudCasaClusterData();

    for (let i = 0; i < rancherClusterData.length; i++) { 
      let newCluster = new Object;
      newCluster.id = rancherClusterData[i].spec.displayName;
      newCluster.installState = 0;
      newCluster.lastUpdated = "No Date Available"

      if (rancherClusterData[i].metadata.state.name != "active") {
        continue;
      }

      let rancherClusterServiceData = await this.getClusterServicesFromRancher(
        rancherClusterData[i].id
      );

      for (let f = 0; f < rancherClusterServiceData.data.length; f++) {
        newCluster = this.parseNewCluster(
          newCluster, 
          cloudCasaClusterData, 
          rancherClusterServiceData.data[f],
        );

        if (newCluster.installState == 3) {
          break;
        }
      }
    
      this.parsedClusterData.push(newCluster);
    }
  },
  methods: {
    async testGetRancherSettings(){
      const config = await this.$store.getters['management/schemaFor'](
        "cloudcasa.rancher.io.configuration"
      );

      if (config.id === undefined) {
        await this.$store.dispatch('management/request', {
          url:    '/v1/apiextensions.k8s.io.customresourcedefinitions',
          method: 'POST',
          data:   this.OBSERVABILITY_CRD,
        });
      }

      //If not in store, must pull from server
      return await this.$store.dispatch(
        'management/findAll', 
        { type: 'cloudcasa.rancher.io.configuration' },
      );
    },
    async getClustersFromRancher(){
      return await this.$store.dispatch(`management/findAll`, {
        type: MANAGEMENT.CLUSTER,
      });
    },
    async getClusterServicesFromRancher(cluster){
      return await this.$store.dispatch('cluster/request', {
        url: `/k8s/clusters/` + cluster + `/v1/services`,
      });
    },
    async getCloudCasaClusterData(){
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-auth-header': `Bearer ${ process.env.VUE_APP_CLOUDCASA_API_KEY }` 
      };
      let method = 'GET';
      let url = 'meta/proxy/api.cloudcasa.io/api/v1/kubeclusters';
      const res = await this.$store.dispatch('management/request', {
        url,
        method,
        headers,
        redirectUnauthorized: false,
      }, { root: true });

      return res;
    },
    setInstallState(value, row){
      row.installState = value;
    },
    parseNewCluster(newCluster, cloudCasaData, clusterServiceData){
      let index = cloudCasaData._items.findIndex(function(data) {
        return data.name == newCluster.id;
      });
      
      if (index == -1) {
        if (clusterServiceData.metadata.namespace == "cloudcasa-io") {
          newCluster.installState = 4;
        }
      }else{
        newCluster.lastUpdated = cloudCasaData._items[index]._updated
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
})
</script>
<template>
  <div class="main-spacing">
    <div class="header">
      <div class="section sub-header">
        <h1>Clusters</h1>
        <BadgeState color="bg-info" :label="this.parsedClusterData.length" />
      </div>
      <DashboardButton :dashboardLink="this.mainDashboardLink" />
    </div>
    <div v-if="this.parsedClusterData != undefined">
      <SortableTable
        :rows="this.parsedClusterData"
        :headers="this.tableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
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
    color: var(--success);
  }
  
  .yellow-text{
    font-size: 20px;
    color: var(--warning);
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
