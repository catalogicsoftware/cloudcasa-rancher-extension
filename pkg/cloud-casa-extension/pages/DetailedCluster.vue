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
  async mounted() {
  },
  computed: {

  },
  methods: {
    changeTab(evt, tabId) {
      console.log(tabId);
      var i, tabcontent, tablinks;

      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }

      tablinks = document.getElementsByClassName("tab-links");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      document.getElementById(tabId).style.display = "block";
      evt.currentTarget.className += " active";
    }
  }
}
</script>
<template>
  <div class="main-spacing">
    <div class="m-20"></div>
    <ClusterDetailedView />
  </div>
</template>
