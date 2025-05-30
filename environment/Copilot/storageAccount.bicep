targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Azure Storage
//   Bicep: https://docs.microsoft.com/en-us/azure/templates/microsoft.storage/storageaccounts
resource storageAccount 'Microsoft.Storage/storageAccounts@2024-01-01' = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
  location: settings.azureRegion
  kind: 'StorageV2'

  sku: {
    name: 'Standard_LRS'
  }

  properties: {
    isHnsEnabled: false
  }

  tags: {
    ...settings.resourceTags
    Component: 'Copilot'
  }
}

// Storage Account: Blob Data Contributor Role Assignment for You the User
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/Microsoft.Authorization/roleAssignments
resource roleBlobDataContributorAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.name, 'ba92f5b4-2d11-453d-a403-e96b0029c9fe', resourceGroup().id)
  scope: storageAccount
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe')
    principalId: az.deployer().objectId
  }
}

// Storage Account: File Data Privileged Role Assignment for You the User
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/Microsoft.Authorization/roleAssignments
resource roleFileDataPrivilegedAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.name, '69566ab7-960f-475b-8e7c-b3118f30c6bd', resourceGroup().id)
  scope: storageAccount
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', '69566ab7-960f-475b-8e7c-b3118f30c6bd')
    principalId: az.deployer().objectId
  }
}
