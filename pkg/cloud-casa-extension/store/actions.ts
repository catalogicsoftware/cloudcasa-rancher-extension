export default {
  setClusterPrefix: ({ commit }: any, clusterPrefix: string) => {
    commit('clusterPrefix', clusterPrefix);
  },
  setApiToken: ({ commit }: any, apiToken: string) => {
    commit('setApiToken', apiToken);
  },
  setApiEndpoint: ({ commit }: any, apiEndpoint: string) => {
    commit('setApiToken', apiEndpoint);
  }
};
