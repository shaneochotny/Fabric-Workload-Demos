import { AccessToken, WorkloadClientAPI } from "@ms-fabric/workload-client";

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

export async function LakehouseList(workloadClient: WorkloadClientAPI, workspaceId: string): Promise<any> {
  const accessToken = (await callAuthAcquireAccessToken(workloadClient)).token;
  const apiEndpoint = process.env.WORKLOAD_BE_URL + "/" + workspaceId + "/lakehouses";
  return fetch(apiEndpoint, 
      {
        method: 'GET', 
        headers: { 'Authorization' : 'Bearer ' + accessToken}
      }
    )
    .then(response =>  response.json());
}