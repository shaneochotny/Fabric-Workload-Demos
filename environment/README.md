# Deployment Steps

### Workload Environment
Deploy all the frontend and backend Azure resources for the Fabric Workload.

1. Update the ```settings.json``` file

1. Deploy the Bicep template

    ```
    az deployment sub create --subscription "MY_SUBSCRIPTION_GUID" --template-file workload.bicep --name "DEV-FabricWorkloadDemos-Workload" --location eastus2
    ```

<br />

### Copilot Environment
Deploy all the necessary Azure resources for Copilot.

1. Update the ```settings.json``` file

1. Deploy the Bicep template

    ```
    az deployment sub create --subscription "MY_SUBSCRIPTION_GUID" --template-file copilot.bicep --name "DEV-FabricWorkloadDemos-Copilot" --location eastus2
    ```

<br />

# Deployment Settings

### Root Keys

Normal Azure deployment parameters.

```
...
"environment": "DEV"
"resourceGroup": "DEV-Fabric-Workload-Demos",
"azureRegion": "eastus2",
"resourceNameSuffix": "123",
"resourceTags": {
    "Environment": "DEV",
    "Solution": "Fabric Workload Demos"
},
...
```

| Key | Value |
| --- | --- |
| environment | Environment name used to prefix resource names and for tagging, i.e. "DEV" or "PRD" |
| resourceGroup | Resource Group to place the created resources. |
| azureRegion | Azure Region to deploy the resources in. |
| resourceNameSuffix | A short suffix used to create unique resource names, some of which need to be globally unique. This should be a short 2-4 characters.
| resourceTags | Tags applied to the created resources. |

<br />

### Authentication Keys

Azure Entra application registration details for Copilot to authenticate to Fabric on-behalf-of the user. This is the same application registration used by the Workload backend.

```
...
"authentication": {
    "entraApplicationClientId": "00000000-0000-0000-0000-000000000000",
    "entraApplicationClientSecret": "abcde~f1g2h3i4j5k6l7m8n9o0*",
    "entraApplicationAudience": "https://YOUR_DOMAIN/YOUR_PATH/Org.WorkloadSample",
    "entraApplicationTenantId": "00000000-0000-0000-0000-000000000000"
},
...
```

| Key | Value |
| --- | --- |
| entraApplicationClientId | Azure Entra Application Registration Client Id GUID. |
| entraApplicationClientSecret | Azure Entra Application Registration Client Secret. |
| entraApplicationAudience | Application ID URI of the Application Registration. |
| entraApplicationTenantId | Azure Entra Tenant Id GUID of the Application Registration. |

<br />

### Copilots

Default Fabric connection details for Copilot. These are the defaults that allow Copilot to access data while on the Fabric Workloads page and not deployed within a Workspace. You can leave them as an empty string now and update the Container Apps Environment Variables later.

```
...
"copilots": {
    "copilotname": {
        "eventhouseConnectionString": "trd-abcdefghijklmnopqr.z6.kusto.fabric.microsoft.com",
        "eventhouseDatabase": "Market",
        "lakehouseSQLConnectionString": "abcdefghijklmnopqrstuvwxyz-abcdefghijklmnopqrstuvwxyz.datawarehouse.fabric.microsoft.com",
        "lakehouseSQLDatabase": "Clients"
    },
    ...
}
...
```

| Key | Value |
| --- | --- |
| eventhouseConnectionString | The Fabric Eventhouse **my_instance.z6.kusto.fabric.microsoft.com** connection string to use as the default. |
| eventhouseDatabase | The Fabric Eventhouse database to use as the default. |
| lakehouseSQLConnectionString | The Fabric Lakehouse SQL **my_instance.datawarehouse.fabric.microsoft.com** connection string to use as the default.|
| lakehouseSQLDatabase | The Fabric Lakehouse name/database to use as the default. |