targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' existing = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
}

// Application Insights
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.insights/components
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
  location: settings.azureRegion
  kind: 'web'

  properties: { 
    Application_Type: 'web'
    Flow_Type: 'Bluefield'
    Request_Source: 'rest'
    WorkspaceResourceId: logAnalytics.id
  }

  tags: {
    ...settings.resourceTags
    Component: 'Workload'
  }
}
