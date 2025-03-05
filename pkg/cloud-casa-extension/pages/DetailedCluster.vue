<script>
import ClusterDetailedView from './../components/ClusterDetailedView.vue'

export default {
  layout: 'plain',
  name: 'detailed-cluster',
  components: {
    ClusterDetailedView,
  },
  data() {
    return {
      clusterId: null,
      cluster: null,
      cloudCasaLink: null,
      clusterCloudCasaData: null,
      clusterUITabs: [
        {
          "name": "Backups",
          "id": "backups"
        },
        {
          "name": "Restores",
          "id": "restores"
        },
        {
          "name": "Migration",
          "id": "migration"
        },
        {
          "name": "Replication",
          "id": "replication"
        },
        {
          "name": "Recovery Points",
          "id": "recovery-points"
        },
        {
          "name": "Activity",
          "id": "activity"
        },
      ],
    }
  },
}
</script>
<template>
  <div class="main-spacing">
    <div class="m-20"></div>
    <ClusterDetailedView />
  </div>
</template>
