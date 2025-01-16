import { CloudCasaState } from './index';

export default {
  setApiToken(state: CloudCasaState, val: string) {
    state.apiToken = val;
  }
};
