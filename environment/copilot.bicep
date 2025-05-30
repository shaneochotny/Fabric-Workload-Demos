/////////////////////////////////////////////////////////////////////////
//                                                                     //
//  Fabric Workload Demos: Copilot                                     //
//                                                                     //
//  Deploys the Azure resources for the Fabric Workload Demos Copilot  //
//                                                                     //
/////////////////////////////////////////////////////////////////////////

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
  COMPONENT:   Container Registry
  DESCRIPTION: This contains the Copilot images used in the Container Apps.
*/
module containerRegistry 'Copilot/containerRegistry.bicep' = {
  name: 'containerRegistry'
  scope: resourceGroup
}

/*
  COMPONENT:   Container Registry: Containers
  DESCRIPTION: This solves for a bit of a race condition. We can't deploy the Copilot image 
               until we have a Container Registry. We also can't deploy a Container App 
               unless there is an image in the Container Registry. To solve for that, we are
               importing a generic image into Container Registry so we can then deploy the 
               Container App all in a single Bicep deployment. Later when we push the Copilot
               images, we will overwrite the generic image.
*/
module containerRegistry_Containers 'Copilot/containerRegistry_Containers.bicep' = {
  name: 'containerRegistry_Containers'
  scope: resourceGroup
  dependsOn: [
    containerRegistry
  ]
}

/*
  COMPONENT:   AI Foundry
  DESCRIPTION: Deploys the Azure AI Services, AI Foundry Hub, AI Foundry Project, Key Vault, 
               and Storage Account for AI Foundry metadata. It also configures Application 
               Insights along and deploys the models.
*/
module keyVault 'Copilot/keyVault.bicep' = {
  name: 'keyVault'
  scope: resourceGroup
}

module storageAccount 'Copilot/storageAccount.bicep' = {
  name: 'storageAccount'
  scope: resourceGroup
}

module aiServices 'Copilot/aiServices.bicep' = {
  name: 'aiServices'
  scope: resourceGroup
}

module aiFoundryHub 'Copilot/aiFoundryHub.bicep' = {
  name: 'aiFoundryHub'
  scope: resourceGroup
  dependsOn:[
    keyVault
    containerRegistry
    storageAccount
    aiServices
    applicationInsights
  ]
}

module aiFoundryProject 'Copilot/aiFoundryProject.bicep' = {
  name: 'aiFoundryProject'
  scope: resourceGroup
  dependsOn:[
    aiFoundryHub
  ]
}

/*
  COMPONENT:   Container Apps
  DESCRIPTION: Deploys the Container Apps Environment and Container Apps for each of the 
               Copilots.
*/
module containerAppsEnvironment 'Copilot/containerAppsEnvironment.bicep' = {
  name: 'containerAppsEnvironment'
  scope: resourceGroup
  dependsOn: [
    logAnalytics
  ]
}

module containerApps_InvestmentInsights 'Copilot/containerApps_InvestmentInsights.bicep' = {
  name: 'containerApps_InvestmentInsights'
  scope: resourceGroup
  dependsOn: [
    containerAppsEnvironment
    containerRegistry_Containers
    aiFoundryProject
  ]
}

module containerApps_RetailIQ 'Copilot/containerApps_RetailIQ.bicep' = {
  name: 'containerApps_RetailIQ'
  scope: resourceGroup
  dependsOn: [
    containerApps_InvestmentInsights
  ]
}

/*
  COMPONENT:   Monitoring
  DESCRIPTION: Deploys Log Analytics and Application Insights for end-to-end monitoring
               of the environment.
*/
module logAnalytics 'Copilot/logAnalytics.bicep' = {
  name: 'logAnalytics'
  scope: resourceGroup
}

module applicationInsights 'Copilot/applicationInsights.bicep' = {
  name: 'applicationInsights'
  scope: resourceGroup
  dependsOn: [
    logAnalytics
  ]
}
