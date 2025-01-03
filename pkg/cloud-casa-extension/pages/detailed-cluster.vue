<script>
import { MANAGEMENT } from '@shell/config/types';
import DashboardButton from './../components/DashboardButton.vue';
import PercentageBar from '@shell/components/PercentageBar';
import Tab from '@shell/components/Tabbed/Tab';
import ResourceTabs from '@shell/components/form/ResourceTabs';

export default {
  name: 'DetailedCluster',
  components: {
    DashboardButton,
    PercentageBar,
    Tab,
  },
  data() {
    return {
      clusterId: null,
      cluster: null,
      cloudCasaLink: null,
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
    document.getElementsByClassName("tab-links")[0].click();
    this.getClusterId();

    this.cluster = await this.getClusterData(this.clusterId);
  },
  methods: {
    getClusterId() {
      console.log(this.$route.params.cluster)
      this.clusterId = this.$route.params.cluster;
    },
    async getClusterData(cluster) {
      console.log(cluster);
      return await this.$store.dispatch('cluster/request', {
        url: `/k8s/clusters/` + cluster + `/v1/services`,
      });
    },
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
    <div class="header">
      <div class="section sub-header">
        <h1>{{this.clusterId}}</h1>
      </div>
      <DashboardButton :dashboardLink="this.cloudCasaLink" />
    </div>
    CONNECTION COMPONENT HERE
    <br />
    <hr>
    <h1 class="cluster-header">Cluster Metrics</h1>
    <br />
    <div class="card-container">
      <div class="card">
        <h1>Job Success</h1>
        <br />
        <div class="card-data-container">
          <div class="card-percentage">
            <h4 class="light-gray">55%</h4>
          </div>
          <div class="card-points">
            <h4 class="light-gray">55/100</h4>
          </div>
          <br />
        </div>
        <br />
        <PercentageBar :modelValue="55" />
      </div>
      <div class="card">
        <h1>PV Backup Coverage</h1>
        <br />
        <div class="card-data-container">
          <div class="card-percentage">
            <h4 class="light-gray">55%</h4>
          </div>
          <div class="card-points">
            <h4 class="light-gray">55/100</h4>
          </div>
          <br />
        </div>
        <br />
        <PercentageBar :modelValue="55" />
      </div>
      <div class="card">
        <h1>PV Snapshot Coverage</h1>
        <br />
        <div class="card-data-container">
          <div class="card-percentage">
            <h4 class="light-gray">55%</h4>
          </div>
          <div class="card-points">
            <h4 class="light-gray">55/100</h4>
          </div>
          <br />
        </div>
        <br />
        <PercentageBar :modelValue="55" />
      </div>
      <div class="card">
        <h1>Safelock Coverage</h1>
        <br />
        <div class="card-data-container">
          <div class="card-percentage">
            <h4 class="light-gray">55%</h4>
          </div>
          <div class="card-points">
            <h4 class="light-gray">55/100</h4>
          </div>
          <br />
        </div>
        <br />
        <PercentageBar :modelValue="55" />
      </div>
    </div>
     <!-- Tab links -->
    <div class="tab">
      <button 
        v-for="tab in this.clusterUITabs"
        class="tab-links" 
        @click="this.changeTab($event, tab.id)"
      >
        <h3>{{tab.name}}</h3>
      </button>
    </div>
    <div 
      v-for="tab in this.clusterUITabs"
      :id="tab.id" 
      class="tabcontent"
    >
      {{tab.id}}
    </div>
  </div>
</template>
<style scoped>
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

  .cluster-header{
    margin-top: 20px;
    margin-bottom: 25px;
  }

  .card-container{
    width: 100%;
    display: flex;
    margin: 0px !important;
    padding: 0px !important;
  }

  .card{
    margin-right: 20px;
    float: left;
    width: 25%;
    padding: 20px;
    border-width: 1px;
    border-color: gray;
    border-style: solid;
  }

  .card:last-child{
    margin-right: 0px !important;
  }

  .card-data-container{
    width: 100%;
  }

  .card-percentage{
    float: left;
  }

  .card-points{
    float: right;
  }

  /*Tab CSS*/

  .tab {
    overflow: hidden;
    border: 1px solid #ccc;
  }

  .tab button {
    background-color: inherit;
    float: left;
    border-bottom: 4px solid transparent;
    outline: none;
    cursor: pointer;
    padding: 5px 20px 0px 20px;
    transition: 0.3s;
  }

  .tab button.active {
    border-bottom: 3px solid var(--primary);
    background-color: inherit;
    h3{
      color: var(--primary) !important;
    }
  }

  .tabcontent {
    display: none;
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-top: none;
  }
</style>
