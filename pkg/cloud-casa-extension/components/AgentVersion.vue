<script>
import { defineComponent } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { 
  getCloudCasaRequest, 
  getCloudCasaEndpoint, 
  getCloudCasaApiKey,
} from './../modules/network.js';

import { getAgentVersion, getNewAgentVersion } from './../modules/cloudcasaAgent.js';
export default defineComponent({
  layout: 'plain',
  components: {
    FontAwesomeIcon,
  },
  setup() {
    return {
      faArrowRight
    }
  },
  props: {
    agentVersion: String,
    newAgentVersion: String,
  },
});
</script>
<template>
  <span v-if="newAgentVersion != undefined">
    <span v-if="agentVersion == newAgentVersion">
      <div class="tooltip">
        Up-To-Date 
        <span class="tooltiptext text-center">
          {{agentVersion}}
        </span>
      </div>
    </span>
    <span v-if="agentVersion != newAgentVersion">
      <div class="tooltip">
        Update Available
        <span class="tooltiptext text-center">
          {{agentVersion}} <FontAwesomeIcon :icon="faArrowRight" /> 
            {{newAgentVersion}}
        </span>
      </div>
    </span>
  </span>
  <span v-if="this.newAgentVersion == undefined">
    Version unavailable
  </span>
</template>
<style scoped>
  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip .tooltiptext {
    font-size: 14px;
    visibility: hidden;
    width: 250px;
    background-color: #4A4B52;
    color: #fff;
    text-align: left;
    border-radius: 6px;
    padding: 10px;

    /* Position the tooltip */
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -125px;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
  }

  .tooltip .tooltiptext::after {
    content: " ";
    position: absolute;
    top: 100%; /* At the bottom of the tooltip */
    left: 50%;
    margin-left: -8px;
    border-width: 8px;
    border-style: solid;
    border-color: #4A4B52 transparent transparent transparent;
  }
</style>
