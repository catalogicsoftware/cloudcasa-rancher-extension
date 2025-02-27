import { CloudCasaState } from './index';

export default {
  setApiToken(state: CloudCasaState, val: string) {
    state.apiToken = val;
  },
  setApiName(state: CloudCasaState, val: string) {
    state.apiName = val;
  }
};
