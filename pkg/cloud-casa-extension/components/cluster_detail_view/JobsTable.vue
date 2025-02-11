<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

import LastThreeRuns from './../cluster_detail_view/LastThreeRuns.vue';

import Tabbed from '@shell/components/Tabbed';
import Tab from '@shell/components/Tabbed/Tab';
import SortableTable from '@shell/components/SortableTable';

import { CLOUDCASA_URL } from './../../types/types.js';
import { getCloudCasaRequest, getCloudCasaApiKey } from './../../modules/network.js';

export default {
  layout: 'plain',
  name: 'detailed-cluster-tabbed-table',
  components: {
    FontAwesomeIcon,
    LastThreeRuns,
    SortableTable,
    Tabbed,
    Tab,
  },
  setup(){
    return {
      faArrowUpRightFromSquare
    }
  },
  props: {
    cloudCasaClusterId: String,
  },
  data() {
    return {

      tableData: [],
      tableHeaders: [
        {
          name: 'name',
          label: 'Name',
          value: 'name',
          width: '25%',
          sort: [
            "name"
          ]
        },
        {
          name: 'policy',
          label: 'Policy',
          value: 'policy',
          width: '15%',
          sort: [
            "policy"
          ]
        },
        {
          name: 'lastRunTime',
          label: 'Last Run Time',
          value: 'lastRunTime',
          width: '20%',
          sort: [
            "lastRunTime"
          ]
        },
        {
          name: 'lastThreeRuns',
          label: 'Last 3 Runs',
          value: 'lastThreeRuns',
          width: '10%',
          sort: [
            "lastThreeRuns"
          ]
        },
        {
          name: 'spacing',
          label: ' ',
          width: '20%',
        },
        {
          name: 'additionalText',
          label: ' ',
          width: '7%',
        },
        {
          name: 'detailsButton',
          label: ' ',
          width: '3%',
        },
      ],
      restoresTableData: [],
      restoresTableHeaders: [
        {
          name: 'name',
          label: 'Restore Name',
          value: 'name',
          width: '35%',
          sort: [
            "name"
          ]
        },
        {
          name: 'lastRunTime',
          label: 'Last Run Time',
          value: 'lastRunTime',
          width: '20%',
          sort: [
            "lastRunTime"
          ]
        },
        {
          name: 'spacing',
          label: ' ',
          width: '35%',
        },
        {
          name: 'additionalText',
          label: ' ',
          width: '7%',
        },
        {
          name: 'detailsButton',
          label: ' ',
          width: '3%',
        },
      ]
    }
  },
  async mounted() {
    const restoresData = await this.getCloudCasaRestoresData(
      this.cloudCasaClusterId,
    );
    const backupData = await this.getCloudCasaBackupData(this.cloudCasaClusterId);
    const migrationData = await this.getCloudCasaMigrationData(
      this.cloudCasaClusterId
    );
    const replicationData = await this.getCloudCasaReplicationData(
      this.cloudCasaClusterId
    );
  },
  computed: {
    getBackupData(){
      return this.tableData.filter(job => {
        return job.type == "backup";
      });
    },
    getMigrationData(){
      return this.tableData.filter(job => {
        return job.type == "migration";
      });
    },
    getReplicationData(){
      return this.tableData.filter(job => {
        return job.type == "replication";
      });
    },
  },
  methods: {
    getBackupsLink(id){
      return 'https://home.cloudcasa.io/clusters/backups/' + id + '/activity'
    },
    getRestoresLink(id){
      return 'https://home.cloudcasa.io/clusters/restores/' + id + '/activity'
    },
    getMigrationsLink(id){
      return 'https://home.cloudcasa.io/clusters/migrations/' + id + '/activity'
    },
    getReplicationsLink(id){
      return 'https://home.cloudcasa.io/clusters/replications/' + id + '/activity'
    },
    async getCloudCasaRestoresData(){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'GET';
      networkRequest.url = networkRequest.url + `kuberestores?sort=-_updated&embedded=
        {"cluster": 1,"backup_inst": 1, "backup_inst.cluster": 1}&where={
          "migrationdef":{"$exists": false}, 
          "cluster":"${this.cloudCasaClusterId}"
        }&page=1`;

      const cloudCasaRestoreData = await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch connection data, ensure your API Key 
            is correct.`,
        }, { root: true });
      }.bind(this));
      
      for (let i = 0; i < cloudCasaRestoreData._items.length; i++){
        let parsedDate = '';
        if (cloudCasaRestoreData._items[i].status.last_job_run_time != undefined) {
          let dateObject = new Date(cloudCasaRestoreData._items[i].status.last_job_run_time 
            * 1000);
          
          let dateString = dateObject.toLocaleDateString('en-US');
          let timeString = dateObject.toLocaleTimeString('en-US');

          parsedDate = dateString + ' ' + timeString;
        }else{
          parsedDate = 'No Runs Have Occured';
        }

        let newJobset = new Object;
        newJobset.id = cloudCasaRestoreData._items[i]._id;
        newJobset.restoreLink = 'https://home.cloudcasa.io/clusters/restores/' + 
          cloudCasaRestoreData._items[i]._id + '/activity';
        newJobset.name = cloudCasaRestoreData._items[i].name;
        newJobset.lastRunTime = parsedDate;

        this.restoresTableData.push(newJobset);
      }
    },

    async getCloudCasaBackupData(cloudCasaClusterId){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'GET';
      networkRequest.url = networkRequest.url + `kubebackups?sort=-_updated&embedded=
      {"policy": 1, "copy_policy": 1, "cluster": 1}&where={
          "migrationdef":{"$exists": false},
          "cluster":"${cloudCasaClusterId}"
        }&page=1`;

      const cloudCasaBackupData = await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch connection data, ensure your API Key 
            is correct.`,
        }, { root: true });
      }.bind(this));
      
      this.parseCloudCasaJobData("backup", cloudCasaBackupData);
    },
    async getCloudCasaMigrationData(cloudCasaClusterId){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'GET';
      networkRequest.url = networkRequest.url + `kubemigrations?sort=-_updated&embedded=
        {"backup.cluster": 1, "restore.cluster": 1}&where=
        {"is_replication":{"$eq":false},"$or":[
          {"backup.cluster":"${this.cloudCasaClusterId}"},
          {"restore.cluster":"${this.cloudCasaClusterId}"}
        ]
      }&page=1`

      const cloudCasaMigrationData = await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch connection data, ensure your API Key 
            is correct.`,
        }, { root: true });
      }.bind(this));

      this.parseCloudCasaJobData("migration", cloudCasaMigrationData); 
    },
    async getCloudCasaReplicationData(cloudCasaClusterId){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'GET';
      networkRequest.url = networkRequest.url + `kubemigrations?sort=-_updated&embedded=
        {"backup.cluster": 1, "restore.cluster": 1, "policy": 1}&where=
        {"is_replication": {"$eq":true},"$or":[
          {"backup.cluster":"${this.cloudCasaClusterId}"},
          {"restore.cluster":"${this.cloudCasaClusterId}"}
        ]
      }&page=1`

      const cloudCasaReplicationData = await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch connection data, ensure your API Key 
            is correct.`,
        }, { root: true });
      }.bind(this));

      this.parseCloudCasaJobData("replication", cloudCasaReplicationData); 
    },

    //Used for backups, migrations, and replications
    parseCloudCasaJobData(type, rawData){
      for (let i = 0; i < rawData._items.length; i++){
        let copyPolicy = '';
        if (rawData._items[i].copy_policy != undefined) {
          copyPolicy = rawData._items[i].copy_policy.name;
        }else{
          copyPolicy = '-';
        }

        let parsedDate = '';
        console.log(i, type, rawData);
        if (
          rawData._items[i].status != undefined && 
          rawData._items[i].status.last_job_run_time != undefined
        ) {
          let dateObject = new Date(rawData._items[i].status.last_job_run_time 
            * 1000);
          
          let dateString = dateObject.toLocaleDateString('en-US');
          let timeString = dateObject.toLocaleTimeString('en-US');

          parsedDate = dateString + ' ' + timeString;
        }else{
          parsedDate = 'No Runs Have Occured';
        }

        let newJobset = new Object;
        newJobset.type = type;
        newJobset.id = rawData._items[i]._id;
        newJobset.name = rawData._items[i].name;
        newJobset.policy = copyPolicy;
        newJobset.lastRunTime = parsedDate;
        if (rawData._items[i].status != undefined)
          newJobset.lastThreeRuns = rawData._items[i].status.jobs

        this.tableData.push(newJobset);
      }
    }
  },
}
</script>
<template>
  <Tabbed>
    <Tab
      name="Backups"
      :label="Backups"
      :weight="10"
    >
      <SortableTable
        :rows="this.getBackupData"
        :headers="this.tableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
      >
        <template #cell:name="{ row }">
          {{ row.name }}
        </template>
        <template #cell:policy="{ row }">
          {{ row.policy }}
        </template>
        <template #cell:lastRunTime="{ row }">
          {{ row.lastRunTime}}
        </template>
        <template #cell:lastThreeRuns="{ row }">
          <LastThreeRuns :jobs="row.lastThreeRuns" />
        </template>
        <template #cell:detailsButton="{ row }">
          <a 
            :href="this.getBackupsLink(row.id)"
            target="_Blank"
            class="btn role-secondary" 
            label="Open CloudCasa"
           >
            Details <FontAwesomeIcon :icon="faArrowUpRightFromSquare" />
          </a>
        </template>
      </SortableTable>
    </Tab>
    <Tab
      name="Restores"
      :label="Restores"
      :weight="9"
    >
      <SortableTable
        :rows="this.restoresTableData"
        :headers="this.restoresTableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
      >
        <template #cell:name="{ row }">
          <a :href="row.restoreLink" target="_Blank">{{ row.name }}</a>
        </template>
        <template #cell:lastRunTime="{ row }">
          {{ row.lastRunTime}}
        </template>
        <template #cell:detailsButton="{ row }">
          <a 
            :href="this.getRestoresLink(row.id)"
            target="_Blank"
            class="btn role-secondary" 
            label="Open CloudCasa"
           >
            Details <FontAwesomeIcon :icon="faArrowUpRightFromSquare" />
          </a>
        </template>
      </SortableTable>
    </Tab>
    <Tab
      name="Migration"
      :label="Migration"
      :weight="8"
    >
      <SortableTable
        :rows="this.getMigrationData"
        :headers="this.tableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
      >
        <template #cell:name="{ row }">
          {{ row.name }}
        </template>
        <template #cell:policy="{ row }">
          {{ row.policy }}
        </template>
        <template #cell:lastRunTime="{ row }">
          {{ row.lastRunTime}}
        </template>
        <template #cell:lastThreeRuns="{ row }">
          <LastThreeRuns :jobs="row.lastThreeRuns" />
        </template>
        <template #cell:detailsButton="{ row }">
          <a 
            :href="this.getMigrationsLink(row.id)"
            target="_Blank"
            class="btn role-secondary" 
            label="Open CloudCasa"
           >
            Details <FontAwesomeIcon :icon="faArrowUpRightFromSquare" />
          </a>
        </template>
      </SortableTable>
    </Tab>
    <Tab
      name="Replication"
      :label="Replication"
      :weight="7"
    >
      <SortableTable
        :rows="this.getReplicationData"
        :headers="this.tableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
      >
        <template #cell:name="{ row }">
          {{ row.name }}
        </template>
        <template #cell:policy="{ row }">
          {{ row.policy }}
        </template>
        <template #cell:lastRunTime="{ row }">
          {{ row.lastRunTime}}
        </template>
        <template #cell:lastThreeRuns="{ row }">
          <LastThreeRuns :jobs="row.lastThreeRuns" />
        </template>
        <template #cell:detailsButton="{ row }">
          <a 
            v-bind:href="dashboardLink"
            target="_Blank"
            class="btn role-secondary" 
            label="Open CloudCasa"
           >
            Details <FontAwesomeIcon :icon="faArrowUpRightFromSquare" />
          </a>
        </template>
      </SortableTable>
    </Tab>
  </Tabbed>
</template>
<style>
.tabs .tab{
  padding: 0px;
}

.tabs .tab span{
  font-size: 16px;
  text-align: center;
  padding: 5px;
}
</style>
