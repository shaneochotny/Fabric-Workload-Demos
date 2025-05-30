targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Azure AI Services
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.cognitiveservices/accounts
resource aiServicesAccount 'Microsoft.CognitiveServices/accounts@2025-04-01-preview' = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
  location: settings.azureRegion
  kind: 'AIServices'

  identity: {
    type: 'SystemAssigned'
  }
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
    publicNetworkAccess: 'Enabled'
  }

  tags: {
    ...settings.resourceTags
    Component: 'Copilot'
  }
}

// Content Filter
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.cognitiveservices/accounts/raipolicies
resource contentFilter 'Microsoft.CognitiveServices/accounts/raiPolicies@2025-04-01-preview' = {
  parent: aiServicesAccount
  name: 'Custom'

  properties: {
    basePolicyName: 'Microsoft.DefaultV2'
    contentFilters: [
      {
        blocking: true
        enabled: true
        name: 'Hate'
        severityThreshold: 'High'
        source: 'Prompt'
      }
      {
        blocking: true
        enabled: true
        name: 'Violence'
        severityThreshold: 'High'
        source: 'Prompt'
      }
      {
        blocking: true
        enabled: true
        name: 'Sexual'
        severityThreshold: 'High'
        source: 'Prompt'
      }
      {
        blocking: true
        enabled: true
        name: 'Selfharm'
        severityThreshold: 'High'
        source: 'Prompt'
      }
      {
        blocking: false
        enabled: false
        name: 'Jailbreak'
        source: 'Prompt'
      }
      {
        blocking: false
        enabled: false
        name: 'Indirect Attack'
        source: 'Prompt'
      }
      {
        blocking: true
        enabled: true
        name: 'Violence'
        severityThreshold: 'High'
        source: 'Completion'
      }
      {
        blocking: true
        enabled: true
        name: 'Hate'
        severityThreshold: 'High'
        source: 'Completion'
      }
      {
        blocking: true
        enabled: true
        name: 'Sexual'
        severityThreshold: 'High'
        source: 'Completion'
      }
      {
        blocking: true
        enabled: true
        name: 'Selfharm'
        severityThreshold: 'High'
        source: 'Completion'
      }
      {
        blocking: false
        enabled: false
        name: 'Protected Material Text'
        source: 'Completion'
      }
      {
        blocking: false
        enabled: false
        name: 'Protected Material Code'
        source: 'Completion'
      }
    ]
    mode: 'Default'
  }
}

// Model Deployment
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.cognitiveservices/accounts/deployments
resource gpt4o 'Microsoft.CognitiveServices/accounts/deployments@2025-04-01-preview' = {
  parent: aiServicesAccount
  name: 'gpt-4o'

  properties: {
    raiPolicyName: 'Custom'
    model: {
        publisher: 'Microsoft'
        format: 'OpenAI'
        name: 'gpt-4o'
        version: '2024-08-06'
    }
  }
  sku: {
    name: 'GlobalStandard'
    capacity: 50
  }

  dependsOn: [
    contentFilter
  ]
}

// Model Deployment
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.cognitiveservices/accounts/deployments
resource gpto1mini 'Microsoft.CognitiveServices/accounts/deployments@2025-04-01-preview' = {
  parent: aiServicesAccount
  name: 'o1-mini'

  properties: {
    raiPolicyName: 'Custom'
    model: {
        publisher: 'Microsoft'
        format: 'OpenAI'
        name: 'o1-mini'
        version: '2024-09-12'
    }
  }
  sku: {
    name: 'GlobalStandard'
    capacity: 50
  }

  dependsOn: [
    gpt4o
    contentFilter
  ]
}

// Azure AI Services: Cognitive Services OpenAI Contributor Role Assignment for You the User
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/Microsoft.Authorization/roleAssignments
resource roleBlobDataContributorAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(az.deployer().objectId, 'a001fd3d-188f-4b5d-821b-7da978bf7442', resourceGroup().id)
  scope: aiServicesAccount
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', 'a001fd3d-188f-4b5d-821b-7da978bf7442')
    principalId: az.deployer().objectId
  }
}

// Diagnostic Logs
//   Bicep: https://docs.microsoft.com/en-us/azure/templates/microsoft.insights/diagnosticsettings
resource diagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'Diagnostics'
  scope: aiServicesAccount

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
