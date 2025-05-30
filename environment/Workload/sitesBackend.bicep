targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
}

// Reference: Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' existing = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
}

// Reference: App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2024-04-01' existing = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
}

// Reference: Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2024-12-01-preview' existing = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
}

// Web App Site
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.web/sites
resource appServiceSite 'Microsoft.Web/sites@2024-04-01' = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}be'
  location: settings.azureRegion
  kind: 'app'

  identity: {
    type: 'SystemAssigned'
  }

  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      scmType: 'None'
      netFrameworkVersion: 'v8.0'
      defaultDocuments: [
        'index.html'
      ]
      virtualApplications: [
        {
          virtualPath: '/'
          physicalPath: 'site\\wwwroot'
          preloadEnabled: false
        }
      ]
      cors: {
        allowedOrigins: [
          '*'
        ]
      }
      appSettings: [
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: applicationInsights.properties.ConnectionString
        }
        {
          name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
          value: '~3'
        }
        {
          name: 'Audience'
          value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=Audience)'
        }
        {
          name: 'ClientId'
          value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=ClientId)'
        }
        {
          name: 'ClientSecret'
          value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=ClientSecret)'
        }
        {
          name: 'PublisherTenantId'
          value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=PublisherTenantId)'
        }
      ]
    }
  }

  tags: {
    ...settings.resourceTags
    Component: 'Workload'
  }
}

// Key Vault Secret: Azure Entra App Registration Audience
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.keyvault/vaults/secrets
resource keyVaultSecret_Audience 'Microsoft.KeyVault/vaults/secrets@2024-12-01-preview' = {
  parent: keyVault
  name: 'Audience'
  properties: {
    attributes: {
      enabled: true
    }
    contentType: 'string'
    value: settings.authentication.entraApplicationAudience
  }
}

// Key Vault Secret: Azure Entra App Registration Client Id
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.keyvault/vaults/secrets
resource keyVaultSecret_ClientId 'Microsoft.KeyVault/vaults/secrets@2024-12-01-preview' = {
  parent: keyVault
  name: 'ClientId'
  properties: {
    attributes: {
      enabled: true
    }
    contentType: 'string'
    value: settings.authentication.entraApplicationClientId
  }
}

// Key Vault Secret: Azure Entra App Registration Client Secret
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.keyvault/vaults/secrets
resource keyVaultSecret_ClientSecret 'Microsoft.KeyVault/vaults/secrets@2024-12-01-preview' = {
  parent: keyVault
  name: 'ClientSecret'
  properties: {
    attributes: {
      enabled: true
    }
    contentType: 'string'
    value: settings.authentication.entraApplicationClientSecret
  }
}

// Key Vault Secret: Azure Entra App Registration Application Tenant Id
//    Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.keyvault/vaults/secrets
resource keyVaultSecret_ApplicationTenantId 'Microsoft.KeyVault/vaults/secrets@2024-12-01-preview' = {
  parent: keyVault
  name: 'ApplicationTenantId'
  properties: {
    attributes: {
      enabled: true
    }
    contentType: 'string'
    value: settings.authentication.entraApplicationTenantId
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
        objectId: appServiceSite.identity.principalId
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

// Diagnostic Logs for App Services
//   Bicep: https://docs.microsoft.com/en-us/azure/templates/microsoft.insights/diagnosticsettings
resource appServiceSiteDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'Diagnostics'
  scope: appServiceSite

  properties: {
    logs: [
      {
        category: 'AppServiceHTTPLogs'
        enabled: true
      }
      {
        category: 'AppServiceConsoleLogs'
        enabled: true
      }
      {
        category: 'AppServiceAppLogs'
        enabled: true
      }
      {
        category: 'AppServiceAuditLogs'
        enabled: true
      }
      {
        category: 'AppServiceIPSecAuditLogs'
        enabled: true
      }
      {
        category: 'AppServicePlatformLogs'
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
