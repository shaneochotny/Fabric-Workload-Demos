# Workload Backend

General steps to run the backend locally along with building and deploying to Azure and Fabric. More detailed instructions are coming soon.

## Local Development
Run the backend locally in development mode.

1. Update the ```src\appsettings.json``` file with the Azure Entra application registraion details.

1. Update the ```src\Config\workload-dev-mode.json``` file.

    ```
    {  
        Your Fabric Capacity GUID
        "CapacityGuid": "00000000-0000-0000-0000-000000000000", 

        The full local path of the src\bin\Debug folder.
        "ManifestPackageFilePath": "C:\\Users\\...\\backend\\src\\bin\\Debug",

        "WorkloadEndpointURL": "http://127.0.0.1:5000/workload"
    }
    ```

1. Update the ```src\Packages\manifest\WorkloadManifest.xml``` file.

1. Ensure **Fabric Developer mode** is enabled in your Fabric UI. This is a local setting only for you and does not impact others.

<br />

## Deployment

### Deploy to the Azure Web App
Use the **Deploy to Web App** feature in VSCode.

### Build the Workload NuGet package
This builds the Workload manifest NuGet package. It's the only artifact that is deployed into Fabric.

1. Build the NuGet package in src\bin\

    ```
    dotnet build -c Release
    ```

1. Fabric -> Admin portal -> Workloads -> Upload workload
