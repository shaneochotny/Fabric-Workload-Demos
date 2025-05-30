targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// App Service Plan
//   Bicep: https://docs.microsoft.com/en-us/azure/templates/microsoft.web/serverfarms
resource appServicePlan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
  location: settings.azureRegion

  properties: {
    elasticScaleEnabled: false
    hyperV: false
    isSpot: false
    isXenon: false
    maximumElasticWorkerCount: 1
    perSiteScaling: false
    reserved: false
    targetWorkerCount: 0
    targetWorkerSizeId: 0
  }
  sku: {
    capacity: 1
    family: 'B'
    name: 'B1'
    size: 'B1'
    tier: 'Basic'
  }

  tags: {
    ...settings.resourceTags
    Component: 'Workload'
  }
}
