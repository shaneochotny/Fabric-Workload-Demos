targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' existing = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
}

// Key Vault
//    Bicep: https://docs.microsoft.com/en-us/azure/templates/microsoft.keyvault/vaults
resource keyVault 'Microsoft.KeyVault/vaults@2024-12-01-preview' = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
  location: settings.azureRegion

  properties: {
    accessPolicies: [
      {
        objectId: az.deployer().objectId
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
        }
        tenantId: subscription().tenantId
      }
    ]
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
  }

  tags: {
    ...settings.resourceTags
    Component: 'Workload'
  }
}

// Diagnostic Logs for Key Vault
//    Bicep: https://docs.microsoft.com/en-us/azure/templates/microsoft.insights/diagnosticsettings
resource keyVaultDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'Diagnostics'
  scope: keyVault

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
