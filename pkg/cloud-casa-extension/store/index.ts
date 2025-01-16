import { CoreStoreConfig, CoreStoreSpecifics } from '@rancher/shell/core/types';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

export interface CloudCasaState {
  name?: string;
  apiToken?: string;
}

const cloudCasaStoreFactory = (config: CloudCasaState): CoreStoreSpecifics => {
  return {
    state: (): CloudCasaState => {
      return {
        name: config.name,
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
    name: '',
    apiToken: '',
  }),
  config,
};
