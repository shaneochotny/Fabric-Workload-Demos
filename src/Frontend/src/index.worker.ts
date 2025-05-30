import {
  ItemCreateContext,
  createWorkloadClient,
  DialogType,
  InitParams,
} from '@ms-fabric/workload-client';

import * as Controller from './controller/SampleWorkloadController';
import { ItemJobActionContext } from './models/SampleWorkloadModel';
import { getJobDetailsPane } from './utils';

export async function initialize(params: InitParams) {
  const workloadClient = createWorkloadClient();
  const workloadName = process.env.WORKLOAD_NAME;

  workloadClient.action.onAction(async function ({ action, data }) {
    switch (action) {
      /* This is the entry point for the Sample Workload Create experience, 
      as referenced by the Product->CreateExperience->Cards->onClick->action 'open.createSampleWorkload' in the localWorkloadManifest.json manifest.
        This will open a Save dialog, and after a successful creation, the editor experience of the saved sampleWorkload item will open
      */
      case 'open.createInvestmentInsights':
        const { workspaceObjectId } = data as ItemCreateContext;
        return workloadClient.dialog.open({
            workloadName: workloadName,
            dialogType: DialogType.IFrame,
            route: {
                path: `/investment-insights-create-dialog/${workspaceObjectId}`,
            },
            options: {
                width: 360,
                height: 360,
                hasCloseButton: false
            },
        });

      /**
       * This opens the Frontend-only experience, allowing to experiment with the UI without the need for CRUD operations.
       * This experience still allows saving the item, if the Backend is connected and registered
       */
      case 'open.investmentInsightsDemo':
        return workloadClient.page.open({
            workloadName: workloadName,
            route: {
                path: `/investment-insights-demo`,
            },
        });

      case 'open.contosoInvestmentPartners':
        return workloadClient.page.open({
            workloadName: workloadName,
            route: {
                path: `/contoso-investment-partners`,
            },
        });

      case 'open.retailIQ':
        return workloadClient.page.open({
            workloadName: workloadName,
            route: {
                path: `/retailiq`,
            },
        });
        

      case 'item.job.retry':
        const retryJobContext = data as ItemJobActionContext;
        return await Controller.callRunItemJob(
            retryJobContext.itemObjectId,
            retryJobContext.itemJobType,
            JSON.stringify({ metadata: 'JobMetadata' }),
            workloadClient,
            true /* showNotification */);

      case 'item.job.cancel':
        const cancelJobDetails = data as ItemJobActionContext;
        return await Controller.callCancelItemJob(cancelJobDetails.itemObjectId, cancelJobDetails.itemJobInstanceId, workloadClient, true);

      case 'item.job.detail':
        const jobDetailsContext = data as ItemJobActionContext;
        const hostUrl = (await Controller.callSettingsGet(workloadClient)).workloadHostOrigin;
        return getJobDetailsPane(jobDetailsContext, hostUrl);

      default:
        throw new Error('Unknown action received');
    }
  });
}
