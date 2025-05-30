targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Container Registry
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.containerregistry/registries
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
  location: settings.azureRegion
  sku: {
    name: 'Premium'
  }
  properties: {
    adminUserEnabled: true
    policies: {
      quarantinePolicy: {
        status: 'disabled'
      }
      retentionPolicy: {
        status: 'enabled'
        days: 7
      }
      trustPolicy: {
        status: 'disabled'
        type: 'Notary'
      }
    }
    zoneRedundancy: 'Disabled'
  }

  tags: {
    ...settings.resourceTags
    Component: 'Copilot'
  }
}

// Diagnostic Logs
//    Bicep: https://docs.microsoft.com/en-us/azure/templates/microsoft.insights/diagnosticsettings
resource diagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'Diagnostics'
  scope: containerRegistry

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
