<script>
import ButtonDropdown from '@shell/components/ButtonDropdown';
import { 
  getCloudCasaRequest, 
  getCloudCasaEndpoint, 
  getCloudCasaApiKey,
} from './../../modules/network.js';

export default {
  layout: 'plain',
  name: 'cloud-casa-actions',
  props: {
    backupId: String,
    copyDef: String,
  },
  components: {
    ButtonDropdown,
  },
  data() {
    return {
      buttonLabel: 'Actions',
      dropdownOptions: ['Start Backup', 'Pause Backup', 'Restore', 'Edit']
    }
  },
  methods: {
    runJobWatcher(){
      /*Need to watch for backup job when initiated and check status of job before
      loading the dropdown options.*/
    },
    routeDropdownClick(action){
      switch (action) {
        case 'Start Backup':
          this.startBackup();
          break;
        case 'Pause Backup':
          
          break;
        case 'Restore':
          this.restoreLinkTo();
          break;
        case 'Edit':
          this.editLinkTo();
          break;
        default:
          this.$store.dispatch('growl/error', {
            title: 'Something Went Wrong',
            message: `Invalid action option.`,
          }, { root: true });
      }
    },
    async startBackup(){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'POST';
      networkRequest.url = networkRequest.url + 'kubeoffloads/' + this.copyDef + 
        '/action/run';
      networkRequest.data = {
        "retention": {
          "retainDays": 7
        },
        "runBackup": false,
      };
      
      return await this.$store.dispatch(
        'management/request', 
        networkRequest, 
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Failed to start backup job.`,
        }, { root: true });
      }.bind(this));
    },
    //cancel backup needed? Need to update dropdown list dynamically regardless
    async pausePolicy(){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'POST';
      networkRequest.url = networkRequest.url + 'policies/' + this.copyDef + 
        '/action/suspend';
      
      return await this.$store.dispatch(
        'management/request', 
        networkRequest, 
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Failed to pause the backup policy`,
        }, { root: true });
      }.bind(this));
    },
    async resumePolicy(){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'POST';
      networkRequest.url = networkRequest.url + 'policies/' + this.copyDef + 
        '/action/resume';
      
      return await this.$store.dispatch(
        'management/request', 
        networkRequest, 
        { root: true },
      ).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Failed to pause the backup policy`,
        }, { root: true });
      }.bind(this));
    },
    restoreLinkTo(){
      window.open(
        'https://home.cloudcasa.io/clusters/backups/' + this.backupId + 
          '/recovery-points', 
        '_blank',
      );
    },
    editLinkTo(){
      window.open(
        'https://home.cloudcasa.io/clusters/backups/' + this.backupId + 
          '/activity', 
        '_blank',
      );
    },
  }
}
</script>
<template>
   <ButtonDropdown
    :buttonLabel="this.buttonLabel"
    :dropdownOptions="this.dropdownOptions"
    size="sm"
    :selectable="selectable"
    @click-action="(o) => routeDropdownClick(o)"
  >
    <template>
      Actions
    </template>
  </ButtonDropdown>
</template>
<style>
</style>
