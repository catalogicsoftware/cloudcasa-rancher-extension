export async function getAgentVersion(store, clusterId){
  let agentVersion = undefined;

  await store.dispatch('cluster/request', {
    url: `/k8s/clusters/` + clusterId + `/v1/apps.deployments/cloudcasa-io/kubeagent`,
  }).then(function(data){
    const envVars = data.spec.template.spec.containers[0].env;

    envVars.forEach(envVar =>{
      if (envVar.name == "KUBEMOVER_IMAGE") {
        agentVersion = envVar.value.split(":")[1];
      }
    })
  }).catch(function(error){
    console.log(error);
  });

  return agentVersion;
}

export async function getNewAgentVersion(store, cloudCasaApiKey, agentURL){
  if (agentURL == undefined) {
    return undefined;
  }

  let newAgentVersion = undefined;
  const yaml = require('js-yaml');

  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-api-auth-header': `Bearer ${ cloudCasaApiKey }` 
  };
  let method = 'GET';
  let url = 'meta/proxy/' + agentURL.replace('https://', '');

  //error check this
  const agentResult = await store.dispatch('management/request', {
    url,
    method,
    headers,
    redirectUnauthorized: false,
  }, { root: true }).then(data => {
    const agentYaml = yaml.load(data.data);
    //error check this
    newAgentVersion = agentYaml.items[3].spec.template.spec.containers[0].env[2].
      value.split(":")[1];
  });

  return newAgentVersion;
}
