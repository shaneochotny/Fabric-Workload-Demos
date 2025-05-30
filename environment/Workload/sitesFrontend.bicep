targetScope = 'resourceGroup'

// Load settings from the JSON file
var settings = loadJsonContent('../settings.json')

// Reference: Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' existing = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
}

// Reference: App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2024-04-01' existing = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}'
}

// Web App Site
//   Bicep: https://learn.microsoft.com/en-us/azure/templates/microsoft.web/sites
resource appServiceSite 'Microsoft.Web/sites@2024-04-01' = {
  name: '${toLower(settings.environment)}workload${toLower(settings.resourceNameSuffix)}fe'
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
      netFrameworkVersion: '4.0'
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
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
      ]
    }
  }

  tags: {
    ...settings.resourceTags
    Component: 'Workload'
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
