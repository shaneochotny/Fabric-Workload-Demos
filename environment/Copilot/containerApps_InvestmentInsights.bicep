targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Container Apps Environment
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-10-02-preview' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: AI Foundry Hub
resource aiFoundryHub 'Microsoft.MachineLearningServices/workspaces@2025-01-01-preview' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}-hub'
}

// Reference: AI Foundry Project
resource aiFoundryProject 'Microsoft.MachineLearningServices/workspaces@2025-01-01-preview' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}-project'
}

// Reference: Azure AI Services
resource aiServicesAccount 'Microsoft.CognitiveServices/accounts@2025-04-01-preview' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Reference: Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}'
}

// Container Apps
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.app/containerapps
resource containerApps 'Microsoft.App/containerapps@2025-01-01' = {
  name: '${toLower(settings.environment)}copilot${toLower(settings.resourceNameSuffix)}-investinsights'
  location: settings.azureRegion

  identity: {
    type: 'SystemAssigned'
  }

  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8000
        exposedPort: 0
        transport: 'Auto'
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
        allowInsecure: false
      }
      registries: [
        {
          identity: 'system-environment'
          server: containerRegistry.properties.loginServer
        }
      ]
      maxInactiveRevisions: 100
      identitySettings: []
    }
    template: {
      containers: [
        {
          image: '${containerRegistry.name}.azurecr.io/copilotinvestmentinsights:latest'
          name: 'copilotinvestmentinsights'
          env: [
            {
              name: 'ENTRA_APP_AUTHORITY'
              value: 'https://login.microsoftonline.com/${settings.authentication.entraApplicationTenantId}'
            }
            {
              name: 'ENTRA_APP_ISSUER'
              value: 'https://sts.windows.net/${settings.authentication.entraApplicationTenantId}/'
            }
            {
              name: 'ENTRA_APP_CLIENT_ID'
              value: settings.authentication.entraApplicationClientId
            }
            {
              name: 'ENTRA_APP_CLIENT_SECRET'
              value: settings.authentication.entraApplicationClientSecret
            }
            {
              name: 'ENTRA_APP_AUDIENCE'
              value: settings.authentication.entraApplicationAudience
            }
            {
              name: 'EVENTHOUSE_CONNECTION_STRING'
              value: settings.copilots.investmentInsights.eventhouseConnectionString
            }
            {
              name: 'EVENTHOUSE_DATABASE'
              value: settings.copilots.investmentInsights.eventhouseDatabase
            }
            {
              name: 'LAKEHOUSE_CONNECTION_STRING'
              value: settings.copilots.investmentInsights.lakehouseSQLConnectionString
            }
            {
              name: 'LAKEHOUSE_DATABASE'
              value: settings.copilots.investmentInsights.lakehouseSQLDatabase
            }
            {
              name: 'FOUNDRY_PROJECT_CONNECTION_STRING'
              value: '${settings.azureRegion}.api.azureml.ms;${az.subscription().subscriptionId};${az.resourceGroup().name};${aiFoundryProject.name}'
            }
            {
              name: 'FOUNDRY_API_VERSION'
              value: '2024-12-01-preview'
            }
            {
              name: 'FOUNDRY_TASKS_DEPLOYMENT_NAME'
              value: 'gpt-4o'
            }
            {
              name: 'FOUNDRY_TASKS_MODEL'
              value: 'gpt-4o-2024-11-20'
            }
            {
              name: 'FOUNDRY_REASONING_DEPLOYMENT_NAME'
              value: 'o1-mini'
            }
            {
              name: 'FOUNDRY_REASONING_MODEL'
              value: 'o1-mini-2024-09-12'
            }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        maxReplicas: 10
        cooldownPeriod: 300
        pollingInterval: 30
        rules: [
          {
            name: 'http-scaler'
            http: {
              metadata: {
                concurrentRequests: '1'
              }
            }
          }
        ]
      }
    }
  }

  tags: {
    ...settings.resourceTags
    Component: 'Copilot: Investment Insights'
  }
}

// Azure AI Foundry Hub: Azure AI Developer
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/Microsoft.Authorization/roleAssignments
resource roleAIFoundryHub 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerApps.name, 'hub', '64702f94-c441-49e6-a78b-ef80e0188fee', resourceGroup().id)
  scope: aiFoundryHub
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', '64702f94-c441-49e6-a78b-ef80e0188fee')
    principalId: containerApps.identity.principalId
  }
}

// Azure AI Foundry Project: Azure AI Developer
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/Microsoft.Authorization/roleAssignments
resource roleAIFoundryProject 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerApps.name, 'project', '64702f94-c441-49e6-a78b-ef80e0188fee', resourceGroup().id)
  scope: aiFoundryProject
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', '64702f94-c441-49e6-a78b-ef80e0188fee')
    principalId: containerApps.identity.principalId
  }
}

// Azure AI Services: Cognitive Services OpenAI User
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/Microsoft.Authorization/roleAssignments
resource roleAIServices 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerApps.name, '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd', resourceGroup().id)
  scope: aiServicesAccount
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd')
    principalId: containerApps.identity.principalId
  }
}

// Application Insights: Monitoring Contributor
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/Microsoft.Authorization/roleAssignments
resource roleApplicationInsights 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerApps.name, '749f88d5-cbae-40b8-bcfc-e573ddc772fa', resourceGroup().id)
  scope: applicationInsights
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', '749f88d5-cbae-40b8-bcfc-e573ddc772fa')
    principalId: containerApps.identity.principalId
  }
}
