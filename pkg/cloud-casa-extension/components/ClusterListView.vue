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
        },
        {
          name: 'hasCloudCasa',
          label: 'CC Installed?',
          value: 'hasCloudCasa',
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
      let hasCloudCasa = false;
      let clusterServiceData = await this.getClusterData(clusterData[i].id);

      for (let f = 0; f < clusterServiceData.data.length; f++) {
        if (clusterServiceData.data[f].metadata.namespace == "cloudcasa-io") {
          hasCloudCasa = true;
          break;
        }
      }
      
      this.cloudCasaData.push({
        id: clusterData[i].id,
        hasCloudCasa: hasCloudCasa,
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
  Test
  <div v-if="this.cloudCasaData != undefined">
    {{this.cloudCasaData.length}}
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
        {{ row.hasCloudCasa }}
      </template>
    </SortableTable>
  </div>
</template>
