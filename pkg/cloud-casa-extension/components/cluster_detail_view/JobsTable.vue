<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

import CloudcasaActions from './CloudcasaActions.vue';
import LastThreeRuns from './LastThreeRuns.vue';

import Tabbed from '@shell/components/Tabbed';
import Tab from '@shell/components/Tabbed/Tab';
import SortableTable from '@shell/components/SortableTable';

import { CLOUDCASA_URL } from './../../types/types.js';
import { 
  getCloudCasaRequest, 
  getCloudCasaEndpoint, 
  getCloudCasaApiKey,
} from './../../modules/network.js';

export default {
  layout: 'plain',
  name: 'detailed-cluster-tabbed-table',
  components: {
    CloudcasaActions,
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
      tableBackupHeaders: [
        {
          name: 'name',
          label: 'Name',
          value: 'name',
          width: '25%',
        },
        {
          name: 'policy',
          label: 'Policy',
          value: 'policy',
          width: '15%',
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
        },
        {
          name: 'spacing',
          label: ' ',
          width: '20%',
        },
        {
          name: 'actionsDropdownButton',
          label: ' ',
          width: '5%',
        },
        {
          name: 'detailsButton',
          label: ' ',
          width: '5%',
        },
      ],
      tableData: [],
      tableHeaders: [
        {
          name: 'name',
          label: 'Name',
          value: 'name',
          width: '25%',
        },
        {
          name: 'policy',
          label: 'Policy',
          value: 'policy',
          width: '15%',
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
      ],
      recoveryPointsTableData: [],
      recoveryPointsTableHeaders: [
        {
          name: 'name',
          label: 'Job',
          value: 'name',
          width: '20%',
        },
        {
          name: 'location',
          label: 'Location',
          value: 'location',
          width: '10%',
        },
        {
          name: 'starttime',
          label: 'Start Time',
          value: 'startTime',
          width: '10%',
          sort: [
            "starttime"
          ]
        },
        {
          name: 'pvs',
          label: 'PVs',
          value: 'pvs',
          width: '5%',
        },
        {
          name: 'expires',
          label: 'Expires',
          value: 'expires',
          width: '10%',
        },
        {
          name: 'size',
          label: 'Size',
          value: 'size',
          width: '10%',
        },
        {
          name: 'type',
          label: 'Type',
          value: 'type',
          width: '10%',
        },
        {
          name: 'spacing',
          label: ' ',
          width: '20%',
        },
        {
          name: 'detailsButton',
          label: ' ',
          width: '5%',
        },
      ],
      activityTableData: [],
      activityTableHeaders: [
        {
          name: 'name',
          label: 'Job',
          value: 'name',
          width: '35%',
        },
        {
          name: 'type',
          label: 'Type',
          value: 'type',
          width: '10%',
        },
        {
          name: 'message',
          label: 'Message',
          value: 'message',
          width: '10%',
        },
        {
          name: 'starttime',
          label: 'Start Time',
          value: 'startTime',
          width: '10%',
          sort: [
            "starttime"
          ]
        },
        {
          name: 'status',
          label: 'Status',
          value: 'status',
          width: '10%',
        },
        {
          name: 'duration',
          label: 'Duration',
          value: 'duration',
          width: '10%',
        },
        {
          name: 'spacing',
          label: ' ',
          width: '10%',
        },
        {
          name: 'detailsButton',
          label: ' ',
          width: '5%',
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
    const recoveryData = await this.getCloudCasaRecoveryPointsData(
      this.cloudCasaClusterId
    );
    const activityData = await this.getCloudCasaActivityData(
      this.cloudCasaClusterId
    );
  },
  computed: {
    getBackupData(){
      return this.tableData.filter(job => {
        return job.type == 'backup';
      });
    },
    getMigrationData(){
      return this.tableData.filter(job => {
        return job.type == 'migration';
      });
    },
    getReplicationData(){
      return this.tableData.filter(job => {
        return job.type == 'replication';
      });
    },
  },
  methods: {
    handlePaginationChanged(test){
      console.log('TEST');
    },
    getBackupsLink(id){
      return 'https://home.cloudcasa.io/clusters/backups/' + id + '/activity';
    },
    getRestoresLink(id){
      return 'https://home.cloudcasa.io/clusters/restores/' + id + '/activity';
    },
    getMigrationsLink(id){
      return 'https://home.cloudcasa.io/clusters/migrations/' + id + '/activity';
    },
    getReplicationsLink(id){
      return 'https://home.cloudcasa.io/clusters/replications/' + id + '/activity';
    },
    getRecoveryLink(id){
      return 'https://home.cloudcasa.io/clusters/overview/' + 
        this.cloudCasaClusterId + '/recovery-points';
    },
    getActivityLink(id){
      return 'https://home.cloudcasa.io/clusters/overview/' + 
        this.cloudCasaClusterId + '/activity(sidebar:job/' + id + ')';
    },
    async getCloudCasaRestoresData(){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'GET';
      networkRequest.url = networkRequest.url + `kuberestores?sort=-_updated&embedded={
        "cluster": 1,"backup_inst": 1, "backup_inst.cluster": 1}&where={
          "migrationdef":{"$exists": false},"$or":[{"cluster":"${this.cloudCasaClusterId}"},
          {"source_cluster":"${this.cloudCasaClusterId}"}]
        }`;

      const cloudCasaRestoreData = await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch restore data.`,
        }, { root: true });
      }.bind(this));
      
      for (let i = 0; i < cloudCasaRestoreData._items.length; i++){
        let parsedDate = this.parseDate(
          cloudCasaRestoreData._items[i].status.last_job_run_time
        );

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
        }`;

      const cloudCasaBackupData = await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch backup data.`,
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
      }`

      const cloudCasaMigrationData = await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch migration data.`,
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
      }`

      const cloudCasaReplicationData = await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch replication data.`,
        }, { root: true });
      }.bind(this));

      this.parseCloudCasaJobData("replication", cloudCasaReplicationData); 
    },
    async getCloudCasaRecoveryPointsData(cloudCasaClusterId){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'GET';
      networkRequest.url = networkRequest.url + `backupinstances?sort=-start_time&embedded={"backupdef":1,"objectstore":1,"cluster":1}&where={"cluster":"${this.cloudCasaClusterId}", "state":"READY"}`

      const cloudCasaRecoveryData = await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch recovery data`,
        }, { root: true });
      }.bind(this));

      for (let i = 0; i < cloudCasaRecoveryData._items.length; i++){
        let parsedStartDate = this.parseDate(
          cloudCasaRecoveryData._items[i].start_time
        );
        
        let parsedExpiresDate = this.parseDate(
          cloudCasaRecoveryData._items[i].expiry_timestamp
        );

        let newJobset = new Object;
        newJobset.id = cloudCasaRecoveryData._items[i]._id;
        newJobset.name = cloudCasaRecoveryData._items[i].backupdef_name;
        newJobset.location = cloudCasaRecoveryData._items[i].backup_location.
          backup_location_info;
        newJobset.startTime = parsedStartDate;
        newJobset.pvs = cloudCasaRecoveryData._items[i].pv_count;
        newJobset.expires = cloudCasaRecoveryData._items[i].retention.retainDays
          + ' Days | ' + parsedExpiresDate;
        newJobset.size = (cloudCasaRecoveryData._items[i].total_copy_data / 
          1048576).toFixed(1) + ' MB';
        newJobset.type = cloudCasaRecoveryData._items[i].type;

        this.recoveryPointsTableData.push(newJobset);
      }

      this.recoveryPointsTableData.reverse();
    },
    async getCloudCasaActivityData(cloudCasaClusterId){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'GET';
      networkRequest.url = networkRequest.url + `jobs?sort=-start_time&embedded={"backupdef":1, "restoredef":1, "awsrds.copydef":1}&where={"display_type":{"$nin":["AWSRDS_BACKUP_DELETE","AZURE_METRICS_UPDATE","AGENT_UPDATE"],"$exists":true},"cluster":"${this.cloudCasaClusterId}"}`

      const cloudCasaActivityData = await this.$store.dispatch(
        'management/request', 
        networkRequest,
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Unable to fetch activity data.`,
        }, { root: true });
      }.bind(this));

      for (let i = 0; i < cloudCasaActivityData._items.length; i++){
        let parsedStartDate = this.parseDate(
          cloudCasaActivityData._items[i].start_time
        );

        let rawDuration = cloudCasaActivityData._items[i].end_time - 
          cloudCasaActivityData._items[i].start_time;
        console.log(rawDuration);
        let parsedDuration = this.msToTime(rawDuration);

        let newJobset = new Object;
        newJobset.id = cloudCasaActivityData._items[i]._id;
        newJobset.name = cloudCasaActivityData._items[i].display_name;
        newJobset.type = cloudCasaActivityData._items[i].display_type;
        newJobset.message = cloudCasaActivityData._items[i].message;
        newJobset.startTime = parsedStartDate;
        newJobset.status = cloudCasaActivityData._items[i].state;
        newJobset.duration = parsedDuration;

        this.activityTableData.push(newJobset);
      }
    },
    parseDate(rawDate){
      if (rawDate != undefined) {
        let dateObject = new Date(rawDate * 1000);
        
        let dateString = dateObject.toLocaleDateString('en-US');
        let timeString = dateObject.toLocaleTimeString('en-US');

        return dateString + ' ' + timeString;
      }else{
        return 'No Date Available';
      }
    },
    msToTime(duration){
      if (duration < 60000 || isNaN(duration)){
        return '-';  
      }

      var milliseconds = Math.floor((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

      hours = (hours < 10) ? "0" + hours : hours;
      minutes = (minutes < 10) ? "0" + minutes : minutes;
      seconds = (seconds < 10) ? "0" + seconds : seconds;

      return hours + "h " + minutes + "m";
    },
    //Used for backups, migrations, and replications
    parseCloudCasaJobData(type, rawData){
      for (let i = 0; i < rawData._items.length; i++){
        let copyPolicy = '';
        if (rawData._items[i].copy_policy != undefined) {
          copyPolicy = rawData._items[i].copy_policy.name;
        }

        let parsedDate = 'No Data Available';
        if (rawData._items[i].status != undefined) {
          parsedDate = this.parseDate(
            rawData._items[i].status.last_job_run_time
          );
        }

        let newJobset = new Object;
        newJobset.type = type;
        newJobset.id = rawData._items[i]._id;
        newJobset.name = rawData._items[i].name;
        newJobset.policy = copyPolicy;
        newJobset.copyDef = rawData._items[i].copydef;
        newJobset.etag = rawData._items[i]._etag;
        newJobset.pause = rawData._items[i].pause;
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
      <SortableTable paging
        :rows="this.getBackupData"
        :headers="this.tableBackupHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
        :rowsPerPage="10"
        @pagination-changed="this.handlePaginationChanged"
      >
        <template #cell:lastThreeRuns="{ row }">
          <LastThreeRuns :jobs="row.lastThreeRuns" />
        </template>
        <template #cell:actionsDropdownButton="{ row }">
          <CloudcasaActions 
            :backupId="row.id" 
            :copyDef="row.copyDef"
            :etag="row.etag"
            :pause="row.pause"
          />
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
      <SortableTable paging
        :rows="this.restoresTableData"
        :headers="this.restoresTableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
        :rowsPerPage="10"
      >
        <template #cell:name="{ row }">
          <a :href="row.restoreLink" target="_Blank">{{ row.name }}</a>
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
      <SortableTable paging
        :rows="this.getMigrationData"
        :headers="this.tableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
        :rowsPerPage="10"
      >
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
      <SortableTable paging
        :rows="this.getReplicationData"
        :headers="this.tableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
        :rowsPerPage="10"
      >
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
    <Tab
      name="Recovery Points"
      :label="RecoveryPoints"
      :weight="6"
    >
      <SortableTable paging
        :rows="this.recoveryPointsTableData"
        :headers="this.recoveryPointsTableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
        :rowsPerPage="10"
      >
        <template #cell:detailsButton="{ row }">
          <a 
            :href="this.getRecoveryLink(row.id)"
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
      name="Activity"
      :label="Activity"
      :weight="5"
    >
      <SortableTable paging
        :rows="this.activityTableData"
        :headers="this.activityTableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
        :rowsPerPage="10"
      >
        <template #cell:detailsButton="{ row }">
          <a 
            :href="this.getActivityLink(row.id)"
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
<style scoped>
svg{
  margin-left: 10px;
}

.tabs .tab{
  padding: 0px;
}

.tabs .tab span{
  font-size: 16px;
  text-align: center;
  padding: 5px;
}
</style>
