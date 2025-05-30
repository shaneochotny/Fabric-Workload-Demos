targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Log Analytics
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.operationalinsights/workspaces
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
  location: settings.azureRegion

  properties: { 
    retentionInDays: 180
    sku: {
      name: 'PerGB2018'
    }
  }

  tags: {
    ...settings.resourceTags
    Component: 'Workload'
  }
}
