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
    etag: String,
    pause: Boolean,
  },
  components: {
    ButtonDropdown,
  },
  data() {
    return {
      buttonLabel: 'Actions',
      localPause: this.pause,
      localEtag: this.etag,
      mainDashboardLink: '',
    }
  },
  async mounted() {
    let endpoint = await getCloudCasaEndpoint(this.$store);
    this.mainDashboardLink = endpoint.replace('api/v1/', '');
  },
  computed: {
    getDropdownOptions(){
      if (this.localPause) {
        return ['Start Backup', 'Resume Backup', 'Restore', 'Edit']
      }else{
        return ['Start Backup', 'Pause Backup', 'Restore', 'Edit']
      }
    }
  },
  methods: {
    routeDropdownClick(action){
      switch (action) {
        case 'Start Backup':
          this.startBackup();
          break;
        case 'Pause Backup':
          this.resumePauseBackup();    
          break;
        case 'Resume Backup':
          this.resumePauseBackup();    
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
      ).then(function(){
        this.$store.dispatch('growl/success', {
          title: 'Backup Started',
          message: `A backup has been successfully started.`,
        }, { root: true });
      }.bind(this)).catch(function(error){
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Failed to start backup job.`,
        }, { root: true });
      }.bind(this));
    },
    async resumePauseBackup(pause){
      let networkRequest = await getCloudCasaRequest(this.$store);
      networkRequest.method = 'PATCH';
      networkRequest.url = networkRequest.url + 'kubebackups/' + this.backupId;
      networkRequest.data = {
        "pause": !this.localPause
      }
      networkRequest.headers['If-Match'] = this.localEtag;

      return await this.$store.dispatch(
        'management/request', 
        networkRequest, 
        { root: true },
      ).then(function(response){
        //Paused or Resumed phrasing depending on boolean
        let phrase = '';

        if (this.localPause) {
          phrase = 'resumed';
        }else{
          phrase = 'paused';
        }

        this.localPause = !this.localPause;
        this.localEtag = response._etag;

        this.$store.dispatch('growl/success', {
          title: 'Backup Started',
          message: `A backup has been successfully ${phrase}.`,
        }, { root: true });
      }.bind(this)).catch(function(error){
        //console.log(error);
        this.$store.dispatch('growl/error', {
          title: 'Something Went Wrong',
          message: `Failed to pause the backup policy`,
        }, { root: true });
      }.bind(this));
    },
    restoreLinkTo(){
      window.open(
        'https://' + this.mainDashboardLink + 'clusters/backups/' + 
          this.backupId + '/recovery-points', 
        '_blank',
      );
    },
    editLinkTo(){
      window.open(
        'https://' + this.mainDashboardLink + 'clusters/backups/' + 
          this.backupId + '/activity', 
        '_blank',
      );
    },
  }
}
</script>
<template>
   <ButtonDropdown
    :buttonLabel="this.buttonLabel"
    :dropdownOptions="this.getDropdownOptions"
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
