targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Container Apps Environment
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.app/managedenvironments
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-10-02-preview' = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
  location: settings.azureRegion

  identity: {
    type: 'SystemAssigned'
  }

  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      {
        workloadProfileType: 'Consumption'
        name: 'Consumption'
      }
    ]
  }

  tags: {
    ...settings.resourceTags
    Component: 'Copilot'
  }
}

// Container Registry: AcrPull
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/Microsoft.Authorization/roleAssignments
resource roleAcrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.name, '7f951dda-4ed3-4680-a7ca-43fe172d538d', resourceGroup().id)
  scope: containerRegistry
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
    principalId: containerAppsEnvironment.identity.principalId
    principalType: 'ServicePrincipal'
  }
}
