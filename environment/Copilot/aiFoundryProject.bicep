targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2024-01-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2024-12-01-preview' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: AI Foundry Hub
resource aiFoundryHub 'Microsoft.MachineLearningServices/workspaces@2025-01-01-preview' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}-hub'
}

// AI Foundry Project
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.machinelearningservices/workspaces
resource aiFoundryProject 'Microsoft.MachineLearningServices/workspaces@2025-01-01-preview' = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}-project'
  location: settings.azureRegion

  identity: {
    type: 'SystemAssigned'
  }

  properties: {
    friendlyName: 'Copilot'
    hubResourceId: aiFoundryHub.id
    systemDatastoresAuthMode: 'Identity'
  }

  kind: 'project'
  tags: {
    ...settings.resourceTags
    Component: 'Copilot'
  }
}

// Storage Account: Contributor Role Assignment
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/Microsoft.Authorization/roleAssignments
resource roleBlobDataContributorAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid('b24988ac-6180-42a0-ab88-20f7382dd24c', resourceGroup().id)
  scope: storageAccount
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c')
    principalId: aiFoundryProject.identity.principalId
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
        objectId: aiFoundryProject.identity.principalId
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
  scope: aiFoundryProject

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
