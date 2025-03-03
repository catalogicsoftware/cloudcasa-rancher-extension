<script>
import { defineComponent } from 'vue';
import DashboardButton from './DashboardButton.vue';
import InstallButton from './cluster_list_view/InstallButton.vue';
import ClusterState from './cluster_list_view/ClusterState.vue';
import { CRD_NAME, CLOUDCASA_URL, PRODUCT_NAME } from './../types/types.js';

import SortableTable from '@shell/components/SortableTable';
import { BadgeState } from '@components/BadgeState';
import { MANAGEMENT } from '@shell/config/types';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTriangleExclamation, faGear } from '@fortawesome/free-solid-svg-icons'
 
import { 
  getCloudCasaApiKey, 
  getCloudCasaRequest, 
  getCloudCasaEndpoint,
} from './../modules/network.js';

export default defineComponent({
  layout: 'plain',
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
      faTriangleExclamation,
      faGear
    }
  },
  data() {
    return {
      dashboardName: 'CloudCasa Dashboard',
      tableHeaders: [
        {
          name: 'id',
          label: 'Cluster',
          value: 'name',
          width: '30%',
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
          width: '10%',
        },
        {
          name: 'additionalText',
          label: ' ',
          width: '10%',
        },
        {
          name: 'install',
          label: ' ',
          width: '15%',
        },

      ],
      mainDashboardLink: '',
      parsedClusterData: [],
      cloudCasaApiKey: '',
      loadingClusters: false,
    };
  },
  async mounted() {
    let endpoint = await getCloudCasaEndpoint(this.$store);
    this.mainDashboardLink = 'https://' + endpoint.replace('api/v1/', '') 
      + 'dashboard';

    this.loadingClusters = true;
    const cloudCasaApiKeyResponse = await this.$store.dispatch(
      'management/findAll', 
      { type: CRD_NAME },
    );

    if (cloudCasaApiKeyResponse.length != 0) {
      this.cloudCasaApiKey = cloudCasaApiKeyResponse[0].spec.apiToken;
    }else{
      this.$store.dispatch('growl/error', {
        title: 'Invalid API Key',
        message: `Make sure your CloudCasa API Key is set.`,
      }, { root: true });
    }

    this.parsedClusterData = [];
    let rancherClusterData = await this.getClustersFromRancher();
    let cloudCasaClusterData = await this.getCloudCasaClusterData();

    for (let i = 0; i < rancherClusterData.length; i++) { 
      let newCluster = new Object;
      newCluster.id = rancherClusterData[i].id;
      newCluster.cloudCasaId = undefined;
      newCluster.name = rancherClusterData[i].spec.displayName;
      newCluster.installState = 0;
      newCluster.lastUpdated = "No Date Available"

      if (rancherClusterData[i].metadata.state.name != "active") {
        continue;
      }

      let rancherClusterServiceData = await this.getClusterServicesFromRancher(
        rancherClusterData[i].id
      );

      for (let f = 0; f < rancherClusterServiceData.data.length; f++) {

        if (rancherClusterServiceData.data[f].metadata.namespace == 'cloudcasa-io') {
          const kubeAgent = await this.$store.dispatch('cluster/request', {
            url: `/k8s/clusters/` + newCluster.id + `/v1/apps.deployments/cloudcasa-io/kubeagent`,
          });

          const envVars = kubeAgent.spec.template.spec.containers[0].env;

          envVars.forEach(envVar =>{
            if (envVar.name == "AMDS_CLUSTER_ID") {
              newCluster.cloudCasaId = envVar.value;
            }
          })
        }

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
    this.loadingClusters = false;
  },
  methods: {
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
      let cloudCasaApiKey = await getCloudCasaApiKey(this.$store);
      let cloudCasaEndpoint = await getCloudCasaEndpoint(this.$store);
      
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-auth-header': `Bearer ${ cloudCasaApiKey }` 
      };
      let method = 'GET';
      let url = CLOUDCASA_URL + cloudCasaEndpoint + 'kubeclusters';
      const cloudCasaResponse = await this.$store.dispatch('management/request', {
        url,
        method,
        headers,
        redirectUnauthorized: false,
      }, { root: true });

      return cloudCasaResponse;
    },
    setInstallState(value, row){
      row.installState = value;
    },
    parseNewCluster(newCluster, cloudCasaData, clusterServiceData){
      let index = cloudCasaData._items.findIndex(function(data) {
        return data._id == newCluster.cloudCasaId;
      });
      
      if (index == -1) {
        if (clusterServiceData.metadata.namespace == 'cloudcasa-io') {
          newCluster.installState = 4;
        }
      }else{
        newCluster.lastUpdated = cloudCasaData._items[index]._updated
        newCluster.serviceStatus = clusterServiceData.metadata.state.name;

        if (clusterServiceData.metadata.namespace == 'cloudcasa-io') {
          newCluster.installState = 3;
        }else{
          newCluster.installState = 1;
        }
      }
      
      return newCluster;
    },
    routeToConfiguratorPage(){
      this.$router.push('/' + PRODUCT_NAME + '/configurator');
    },
  },
})
</script>
<template>
  <div class="center-all">
    <div class="max-width">
      <div class="main-spacing">
        <div style="text-align: center;">
          <img 
            style="width: 250px;"
            src="https://cloudcasa.io/assets/logo-white-1.png" 
          />
        </div>
        <div class="m-20"></div>
        <div class="header">
          <div class="section sub-header">
            <h1>Clusters</h1>
            <div v-if="!this.loadingClusters">
              <BadgeState 
                color="bg-info" 
                :label="parsedClusterData.length.toString()" 
              />
            </div>
          </div>
          <div class="section actions">
            <a
              @click="routeToConfiguratorPage()"
              class="btn role-primary reconfigure-button" 
              label="Open CloudCasa"
             >
              Reconfigure API Key <FontAwesomeIcon style="margin-left: 10px;" :icon="faGear" />
            </a>
            <DashboardButton 
              :dashboardName="this.dashboardName"
              :dashboardLink="this.mainDashboardLink" 
            />
          </div>
        </div>
        <div v-if="!this.loadingClusters">
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
                :cloudCasaApiKey="cloudCasaApiKey" 
                :cloudCasaId="row.cloudCasaId"
              />
            </template>
          </SortableTable>
        </div>
        <div class="text-center" v-else>
          <h3>Loading...</h3>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
  .center-all{
    width: 100%;
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

  .installing-text{
    color: #B6B6C2;
  }

  .green-text{
    color: var(--success);
  }
  
  .yellow-text{
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

  .reconfigure-button{
    margin-left: 15px;
  }
</style>
