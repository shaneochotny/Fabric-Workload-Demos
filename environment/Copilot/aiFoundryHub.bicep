targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: Azure AI Services
resource aiServicesAccount 'Microsoft.CognitiveServices/accounts@2025-04-01-preview' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2024-12-01-preview' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2024-01-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// AI Foundry Hub
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.machinelearningservices/workspaces
resource aiFoundryHub 'Microsoft.MachineLearningServices/workspaces@2025-01-01-preview' = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}-hub'
  location: settings.azureRegion

  identity: {
    type: 'SystemAssigned'
  }

  properties: {
    friendlyName: 'Copilot'
    keyVault: keyVault.id
    storageAccount: storageAccount.id
    applicationInsights: applicationInsights.id
    containerRegistry: containerRegistry.id
    systemDatastoresAuthMode: 'Identity'
  }

  kind: 'hub'
  tags: {
    ...settings.resourceTags
    Component: 'Copilot'
  }

  // AI Services Connection
  resource aiServicesConnection 'connections@2025-01-01-preview' = {
    name: 'AIServices'
    properties: {
      category: 'AIServices'
      target: aiServicesAccount.properties.endpoint
      authType: 'ApiKey'
      isSharedToAll: true
      credentials: {
        key: aiServicesAccount.listKeys().key1
      }
      metadata: {
        ApiType: 'Azure'
        ResourceId: aiServicesAccount.id
      }
    }
  }
}

// Key Vault: Access Policies
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.keyvault/vaults/accesspolicies
resource keyVaultPermissions 'Microsoft.KeyVault/vaults/accessPolicies@2024-12-01-preview' = {
  parent: keyVault
  name: 'add'
  properties: {
    accessPolicies: [
      {
        objectId: aiFoundryHub.identity.principalId
        permissions: {
          keys: [ 
            'all'
          ]
          secrets: [ 
            'all'
          ]
          certificates: [ 
            'all'
          ]
          storage: [ 
            'all'
          ]
        }
        tenantId: subscription().tenantId
      }
    ]
  }
}

// Diagnostic Logs
//    Bicep: https://docs.microsoft.com/en-us/azure/templates/microsoft.insights/diagnosticsettings
resource diagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'Diagnostics'
  scope: aiFoundryHub

  properties: {
    logs: [
      {
        categoryGroup: 'audit'
        enabled: true
      }
      {
        categoryGroup: 'allLogs'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
      }
    ]
    workspaceId: logAnalytics.id
  }
}
