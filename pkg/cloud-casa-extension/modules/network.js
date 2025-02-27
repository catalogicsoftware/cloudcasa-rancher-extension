import { CLOUDCASA_URL, CRD_NAME } from './../types/types.js';

export async function getCloudCasaRequest(store){
  let headers = await getAuthHeaders(store);
  let apiEndpoint = await getCloudCasaEndpoint(store);

  return {
    url: CLOUDCASA_URL + apiEndpoint,
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

export async function getCloudCasaInfo(store){
  const cloudCasaApiKeyResponse = await store.dispatch(
    'management/findAll', 
    { type: CRD_NAME },
  ).catch(function(error){
    console.log(error)
  });

  if (cloudCasaApiKeyResponse == undefined)
    return undefined

  if (cloudCasaApiKeyResponse.length != 0)
    return cloudCasaApiKeyResponse[0].spec;

  return undefined;
}

export async function getCloudCasaApiKey(store){
  let cloudCasaConfigResponse = await getCloudCasaInfo(store).catch(
    function(error){
      console.log(error);
    }
  );

  if (cloudCasaConfigResponse == undefined)
    return undefined

  if (cloudCasaConfigResponse.length != 0)
    return cloudCasaConfigResponse.apiToken;

  return undefined;
}

export async function getCloudCasaEndpoint(store){
  let cloudCasaConfigResponse = await getCloudCasaInfo(store).catch(
    function(error){
      console.log(error);
    }
  );

  if (cloudCasaConfigResponse == undefined)
    return undefined

  if (cloudCasaConfigResponse.length != 0)
    return cloudCasaConfigResponse.apiEndpoint;

  return undefined;
}
