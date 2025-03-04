import { CloudCasaState } from './index';

export default {
  setClusterPrefix(state: CloudCasaState, val: string) {
    state.clusterPrefix = val;
  },
  setApiToken(state: CloudCasaState, val: string) {
    state.apiToken = val;
  },
  setApiName(state: CloudCasaState, val: string) {
    state.apiEndpoint = val;
  }
};
