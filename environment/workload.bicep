//////////////////////////////////////////////////////////////////////////
//                                                                      //
//  Fabric Workload Demos: Workload                                     //
//                                                                      //
//  Deploys the Azure resources for the Fabric Workload Demos Workload  //
//                                                                      //
//////////////////////////////////////////////////////////////////////////

targetScope = 'subscription'

// Load settings from the JSON file
var settings = loadJsonContent('./settings.json')

/*
  COMPONENT:   Resource Group
  DESCRIPTION: All resources are placed within this Resource Group.
*/
resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: settings.resourceGroup
  location: settings.azureRegion
  tags: settings.resourceTags
}

/*
  COMPONENT:   KeyVault
  DESCRIPTION: Secret store for the backend and the Azure Entra authentication details.
*/

module keyVault 'Workload/keyVault.bicep' = {
  name: 'keyVault'
  scope: resourceGroup
}

/*
  COMPONENT:   Frontend & Backend
  DESCRIPTION: Deploys the frontend and backend app services.
*/

module appServicePlan 'Workload/appServicePlan.bicep' = {
  name: 'appServicePlan'
  scope: resourceGroup
}

module sitesBackend 'Workload/sitesBackend.bicep' = {
  name: 'sitesBackend'
  scope: resourceGroup
  dependsOn:[
    applicationInsights
    appServicePlan
    keyVault
  ]
}

module sitesFrontend 'Workload/sitesFrontend.bicep' = {
  name: 'sitesFrontend'
  scope: resourceGroup
  dependsOn:[
    logAnalytics
    appServicePlan
  ]
}

/*
  COMPONENT:   Monitoring
  DESCRIPTION: Deploys Log Analytics and Application Insights for end-to-end monitoring
               of the environment.
*/

module logAnalytics 'Workload/logAnalytics.bicep' = {
  name: 'logAnalytics'
  scope: resourceGroup
}

module applicationInsights 'Workload/applicationInsights.bicep' = {
  name: 'applicationInsights'
  scope: resourceGroup
  dependsOn: [
    logAnalytics
  ]
}
