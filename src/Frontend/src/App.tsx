import React from "react";
import { Route, Router, Switch } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from '@mantine/core';
import { queryClient } from 'lib/queryClient';

import { ContosoInvestmentPartners, InvestmentInsights, RetailIQ } from 'workloads';

import { SaveAsDialog } from 'components/SampleWorkloadCreateDialog/SampleWorkloadCreateDialog';

// Interfaces
import { IAppProps } from 'interfaces';

export function App({ history, workloadClient }: IAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Router history={history}>
          <Switch>
            {/* This is the routing to the Sample Workload Editor.
                Add your workload editor path here, and reference it in index.worker.ts  */}
            <Route path="/investment-insights/:itemObjectId">
              <InvestmentInsights
                  workloadClient={workloadClient} />
            </Route>

            {/* This is the routing to the Sample Workload Frontend-ONLY experience.
                Add your workload creator path here, and reference it in index.worker.ts  */}
            <Route path="/investment-insights-demo">
              <InvestmentInsights
                  workloadClient={workloadClient} />
            </Route>

            <Route path="/contoso-investment-partners">
              <ContosoInvestmentPartners
                  workloadClient={workloadClient} />
            </Route>

            <Route path="/retailiq">
              <RetailIQ
                  workloadClient={workloadClient} />
            </Route>

            {/* This is the routing to the Sample Workload Create Dialog experience, 
                where an Item will be saved and the Editor will be opened
                Add your workload creator path here, and reference it in index.worker.ts  */}
            <Route path="/investment-insights-create-dialog/:workspaceObjectId">
              <SaveAsDialog
                  workloadClient={workloadClient}
                  isImmediateSave={true} />
            </Route>
          </Switch>
        </Router>
      </MantineProvider>
    </QueryClientProvider>
  )
}
