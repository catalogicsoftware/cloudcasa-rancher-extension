import { CloudCasaState } from './index';

export default {
  clusterPrefix: (state: CloudCasaState) => state.clusterPrefix,
  apiEndpoint: (state: CloudCasaState) => state.apiEndpoint,
  apiToken: (state: CloudCasaState) => state.apiToken,
};
