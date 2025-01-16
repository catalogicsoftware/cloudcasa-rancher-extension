import { CloudCasaState } from './index';

export default {
  name:         (state: CloudCasaState) => state.name,
  apiToken:       (state: CloudCasaState) => state.apiToken,
};
