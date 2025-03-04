import { CoreStoreConfig, CoreStoreSpecifics } from '@rancher/shell/core/types';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

export interface CloudCasaState {
  clusterPrefix?: string;
  apiEndpoint?: string;
  apiToken?: string;
}

const cloudCasaStoreFactory = (config: CloudCasaState): CoreStoreSpecifics => {
  return {
    state: (): CloudCasaState => {
      return {
        clusterPrefix: config.clusterPrefix,
        apiEndpoint: config.apiEndpoint,
        apiToken: config.apiToken,
      };
    },
    getters:   { ...getters },
    mutations: { ...mutations },
    actions:   { ...actions },
  };
};

const config: CoreStoreConfig = { namespace: "cloudcasa" };

export default {
  specifics: cloudCasaStoreFactory({
    clusterPrefix: '',
    apiEndpoint: '',
    apiToken: '',
  }),
  config,
};
