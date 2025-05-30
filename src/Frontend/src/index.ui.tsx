import { createBrowserHistory } from "history";
import React from "react";
import ReactDOM from "react-dom/client";

import { FluentProvider } from "@fluentui/react-components";
import { InitParams } from '@ms-fabric/workload-client';
import { workloadClient} from 'lib/workloadClient';

import { fabricLightTheme } from "./theme";
import { App } from "./App";

import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';

export async function initialize(params: InitParams) {
  const history = createBrowserHistory();
  workloadClient.navigation.onNavigate((route) => history.replace(route.targetUrl));

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
  );

  root.render(
    <FluentProvider theme={fabricLightTheme}>
      <App history={history} workloadClient={workloadClient} />
    </FluentProvider>
  );
}