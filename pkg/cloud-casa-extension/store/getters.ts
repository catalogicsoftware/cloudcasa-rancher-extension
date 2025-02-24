import { CloudCasaState } from './index';

export default {
  apiEndpoint: (state: CloudCasaState) => state.apiEndpoint,
  apiToken: (state: CloudCasaState) => state.apiToken,
};
