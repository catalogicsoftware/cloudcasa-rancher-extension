import { CLOUDCASA_URL } from './../types/types.js';

export async function getCloudCasaRequest(store){
  let headers = await getAuthHeaders(store);

  return {
    url: CLOUDCASA_URL,
    method: '',
    headers: headers,
    redirectUnauthorized: false,
  }
}

async function getAuthHeaders(store){
  const key = await getCloudCasaApiKey(store);
  if (key != undefined) {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-auth-header': `Bearer ${key}` 
    }
  }else{
    return undefined;
  }
}

async function getCloudCasaApiKey(store){
  const cloudCasaApiKeyResponse = await store.dispatch(
    'management/findAll', 
    { type: 'cloudcasa.rancher.io.configuration' },
  );

  if (cloudCasaApiKeyResponse.length != 0) {
    return cloudCasaApiKeyResponse[0].spec.apiToken;
  }

  return undefined;
}
