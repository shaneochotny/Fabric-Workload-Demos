# Workload Frontend

General steps to run the frontend locally along with building and deploying to Azure. More detailed instructions are coming soon.

### Local Development
Run the frontend locally in development mode.

1. Update the ```.env.dev``` file

1. Install Dependencies

    ```
    npm install
    ```

1. Run

    ```
    npm start
    ```

1. Ensure **Fabric Developer mode** is enabled in your Fabric UI. This is a local setting only for you and does not impact others.

<br />

### Build & Deploy
Perform a local build of the frontend and deploy to the Azure App Service.

1. Update the ```.env.test``` file

1. Build Locally. This will create the build in the **tools\dist** folder.

    ```
    npm run build:test
    ```

1. Zip up all the files **within** the **dist** folder (not the dist folder itself).

1. Deploy to the Azure Web App
    ```
    az webapp deploy --resource-group "MY-RESOURCE-GROUP-NAME" --name "MY-WEB-APP-NAME" --src-path .\MY_ZIP_FILE.zip
    ```
