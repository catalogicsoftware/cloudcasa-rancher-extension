<script>
import { defineComponent } from 'vue';
import { MANAGEMENT } from '@shell/config/types';
import ClusterListView from "./../components/ClusterListView.vue"

export default defineComponent({
  layout: 'plain', /*This is going to be deprecated in the future, when it breaks
  try looking at change log or reaching out to Alexandre Alves. Reference this
  GitHub issue: https://github.com/rancher/dashboard/issues/12980*/

  components: {
    ClusterListView,
  },
  data() {
    return {
      url: 'api.cloudcasa.io'
    }
  },
  async mounted() {
    let nodeDriverUp = await this.ensureCloudCasaNodeDriver(this.url);
    let whitelistUp = await this.ensuretGlobalWhitelist(this.url);
    
    /*use nodeDriverUp, whitelistUp for initial screen, if false, don't allow 
    user forward*/
  },

  //Probbably need to move all of this to whatever comes of the api key page.
  methods: {
    async ensuretGlobalWhitelist(url){
      const whitelist = await this.$store.dispatch(
        'management/findAll', 
        { type: MANAGEMENT.SETTING },
      );

      const setting = whitelist.find(s => s.value === url);
      
      if (setting != undefined) {
        return true;
      }

      try {
        this.$store.dispatch('management/request', {
          url: `v1/${ MANAGEMENT.SETTING }`,
          method: 'POST', 
          data: {
            metadata: {
              name: 'cloudcasa-whitelist-domain',
            },
            value: url,
          },
        })
      } catch (e) {
        return false;
      }

      return true;
    },
    async ensureCloudCasaNodeDriver(url){
      const nodeDrivers = await this.$store.dispatch(
        'rancher/findAll',
        { type: 'nodeDriver' },
        { root: true }
      );

      const cloudCasaDriver = nodeDrivers.find(
          (driver) => this.isCloudCasaDriverName(driver.name) 
        ) ||
          (await this.newNodeDriver()
      );

      if (!cloudCasaDriver.whitelistDomains) {
        cloudCasaDriver.whitelistDomains = [];
      }

      // Already in the whitelist
      if (cloudCasaDriver.whitelistDomains.find((domain) => domain === url)) {
        return true;
      }

      cloudCasaDriver.state = 'inactive';
      cloudCasaDriver.url = 'local://';
      cloudCasaDriver.whitelistDomains.push(url);

      try {
        await cloudCasaDriver.save();

        return true;
      } catch (e) {
        return false;
      }
    },
    async newNodeDriver(){
      const emptyDriver = {
        name: `cloud-casa`,
        type: 'nodeDriver',
      };

      return await this.$store.dispatch('rancher/create', emptyDriver);
    },

    isCloudCasaDriverName(name){
      return name === 'cloud-casa';
    },
  },
})
</script>
<template>
  <ClusterListView />
</template>
