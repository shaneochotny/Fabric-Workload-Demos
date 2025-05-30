targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Container Registry
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.containerregistry/registries
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Container Registry: Import Image
//    Description: We are importing a generic image so we can then deploy the Container App all in a single
//                 Bicep deployment. We'll overwrite the image later with the actual image we want to use.
module importImageToAcr_InvestmentInsights 'br/public:avm/ptn/deployment-script/import-image-to-acr:0.4.3' = {
  name: 'importImageToAcr_InvestmentInsights'
  params: {
    acrName: containerRegistry.name
    image: 'mcr.microsoft.com/k8se/quickstart:latest'
    name: 'copilotinvestmentinsights'
    newImageName: 'copilotinvestmentinsights:latest'
  }
}

// Container Registry: Import Image
//    Description: We are importing a generic image so we can then deploy the Container App all in a single
//                 Bicep deployment. We'll overwrite the image later with the actual image we want to use.
module importImageToAcr_RetailIQ 'br/public:avm/ptn/deployment-script/import-image-to-acr:0.4.3' = {
  name: 'importImageToAcr_RetailIQ'
  params: {
    acrName: containerRegistry.name
    image: 'mcr.microsoft.com/k8se/quickstart:latest'
    name: 'copilotretailiq'
    newImageName: 'copilotretailiq:latest'
  }
  dependsOn: [
    importImageToAcr_InvestmentInsights
  ]
}
