<script>
import SortableTable from '@shell/components/SortableTable';
import { MANAGEMENT } from '@shell/config/types';

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
          width: '33%',
        },
        {
          name: 'hasCloudCasa',
          label: 'CloudCasa Installed?',
          value: 'hasCloudCasa',
          width: '33%',
        },
        {
          name: 'serviceStatus',
          label: 'CloudCasa Service Status',
          value: 'serviceStatus',
          width: '33%',
        },
      ],
      cloudCasaData: [],
      clusters: [],
      clusterData: [],
    };
  },
  async mounted() {
    let clusterData = await this.getClusters();

    for (let i = 0; i < clusterData.length; i++) { 
      console.log("AEYO PIZZA HERE")
      let hasCloudCasa = false;
      let status = "Not Installed";
      let clusterServiceData = await this.getClusterData(clusterData[i].id);

      for (let f = 0; f < clusterServiceData.data.length; f++) {
        if (clusterServiceData.data[f].metadata.namespace == "cloudcasa-io") {
          hasCloudCasa = true;
          status = clusterServiceData.data[f].metadata.state.name
          break;
        }
      }
      
      this.cloudCasaData.push({
        id: clusterData[i].id,
        hasCloudCasa: hasCloudCasa,
        serviceStatus: status, 
      });
    }

    return this.cloudCasaData;
  },
  methods: {
    async getClusters() {
      return await this.$store.dispatch(`management/findAll`, {
        type: MANAGEMENT.CLUSTER,
      });
    },
    async getClusterData(cluster) {
      return await this.$store.dispatch('cluster/request', {
        url: `/k8s/clusters/` + cluster + `/v1/services`,
      });
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
        <button class="btn role-primary" label="Open CloudCasa">
          CloudCasa
        </button>
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

  .actions button{
    float:right;
  } 
</style>
