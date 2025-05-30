import { AccessToken, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { IKQLDatabase } from "interfaces";

/**
 * Calls acquire access token from the WorkloadClientAPI.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} additionalScopesToConsent - Extra scopes to consent (only provide if you are sure the user is missing a consent)
 * @param {string} claimsForConditionalAccessPolicy - Claims returned from the server indicating that token conversion failed because of some conditional access policy - see https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/web-apps-apis/on-behalf-of-flow#handling-multi-factor-auth-mfa-conditional-access-and-incremental-consent
 * @returns {AccessToken}
 */
export async function callAuthAcquireAccessToken(workloadClient: WorkloadClientAPI): Promise<AccessToken> {
  return workloadClient.auth.acquireAccessToken({
    additionalScopesToConsent: null,
    claimsForConditionalAccessPolicy: null
  });
}

export async function GetEventhouse(
  workloadClient: WorkloadClientAPI, 
  workspaceId: string, 
  eventhouseId: string | null, 
  eventhouseName: string | null,
): Promise<any> {
  const accessToken = (await callAuthAcquireAccessToken(workloadClient)).token;
  const apiEndpoint = process.env.WORKLOAD_BE_URL + "/" + workspaceId + "/eventhouses/" + (eventhouseId ?? eventhouseName) + "/get";

  return fetch(apiEndpoint, 
      {
        method: 'GET',
        headers: { 
          'Authorization' : 'Bearer ' + accessToken,
        }
      }
    )
    .then(response =>  response.json());
}

export async function CreateEventhouse(
  workloadClient: WorkloadClientAPI,
  workspaceId: string, 
  eventhouseName: string,
): Promise<any> {
  const accessToken = (await callAuthAcquireAccessToken(workloadClient)).token;
  const apiEndpoint = process.env.WORKLOAD_BE_URL + "/" + workspaceId + "/eventhouses/create";

  try {
    const response = await fetch(apiEndpoint, 
      {
        method: 'POST', 
        body: JSON.stringify({
          displayName: eventhouseName,
          description: ''
        }),
        headers: { 
          'Authorization' : 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => { throw new Error('An unknown error occurred'); });
      throw new Error(errorResponse.message);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function GetKQLDatabase(
  workloadClient: WorkloadClientAPI, 
  workspaceId: string, 
  databaseId: string | null, 
  databaseName: string | null,
): Promise<any> {
  const accessToken = (await callAuthAcquireAccessToken(workloadClient)).token;
  const apiEndpoint = process.env.WORKLOAD_BE_URL + "/" + workspaceId + "/eventhouses/databases/" + (databaseId ?? databaseName) + "/get";

  return fetch(apiEndpoint, 
      {
        method: 'GET',
        headers: { 
          'Authorization' : 'Bearer ' + accessToken,
        }
      }
    )
    .then(response =>  response.json());
}

export async function GetKQLDatabaseTables(
  workloadClient: WorkloadClientAPI, 
  workspaceId: string, 
  eventhouseId: string, 
  databaseId: string,
): Promise<any> {
  const accessToken = (await callAuthAcquireAccessToken(workloadClient)).token;
  const apiEndpoint = process.env.WORKLOAD_BE_URL + "/" + workspaceId + "/eventhouses/" + eventhouseId + "/databases/" + databaseId + "/tables";

  try {
    const response = await fetch(apiEndpoint, 
      {
        method: 'GET',
        headers: { 
          'Authorization' : 'Bearer ' + accessToken,
        }
      }
    )

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => { throw new Error('An unknown error occurred'); });
      throw new Error(errorResponse.message);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function CreateKQLDatabase(
  workloadClient: WorkloadClientAPI, 
  workspaceId: string, 
  eventhouseId: string, 
  kqlDatabaseName: string,
): Promise<any> {
  const accessToken = (await callAuthAcquireAccessToken(workloadClient)).token;
  const apiEndpoint = process.env.WORKLOAD_BE_URL + "/" + workspaceId + "/eventhouses/" + eventhouseId + "/databases/create";

  try {
    const response = await fetch(apiEndpoint, 
      {
        method: 'POST', 
        body: JSON.stringify({
          displayName: kqlDatabaseName,
          description: ''
        }),
        headers: { 
          'Authorization' : 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => { throw new Error('An unknown error occurred'); });
      throw new Error(errorResponse.message);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function QueryKQLDatabase(
  workloadClient: WorkloadClientAPI,
  query: string,
  kqlDatabase: IKQLDatabase | undefined,
): Promise<any> {
  const accessToken = (await callAuthAcquireAccessToken(workloadClient)).token;
  const apiEndpoint = `${process.env.WORKLOAD_BE_URL}/${kqlDatabase?.workspaceId}/eventhouses/${kqlDatabase?.properties?.parentEventhouseItemId}/databases/${kqlDatabase?.id}/query?query=${query}&databaseName=${kqlDatabase?.displayName}&connectionString=${kqlDatabase?.properties?.queryServiceUri}`;

  try {
    const response = await fetch(apiEndpoint, 
      {
        method: 'GET',
        headers: { 
          'Authorization' : 'Bearer ' + accessToken,
        }
      }
    )

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => { throw new Error('An unknown error occurred'); });
      throw new Error(errorResponse.message);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}
