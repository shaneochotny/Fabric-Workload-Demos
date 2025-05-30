import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import {
  callItemGet,
  callItemUpdate,
  callItemDelete,
} from "../../controller/SampleWorkloadController";
import { convertGetItemResultToWorkloadItem } from "../../utils";

// Context
import { WebSocketProvider } from "providers/WebSocketProvider";

// Components
import { Stack } from "@fluentui/react";
import { TabValue } from "@fluentui/react-components";
import { Container, Grid } from '@mantine/core';
import { LoadingScreen } from './LoadingScreen';
import { Setup } from './Setup';
import { Ribbon } from "./Ribbon";
import { ClientDetails } from './ClientDetails';
import { AreaChart } from './AreaChart';
import { Allocations } from './Allocations';
import { Copilot } from '../../components/Copilot';
import { Activity } from './Activity';

// APIs
import { GetWorkloadSettings } from 'apis/Workload';

// Interfaces
import { IContextProps, IPageProps, IWorkloadSettings } from 'interfaces';
import {
  Item1ClientMetadata,
  GenericItem,
  ItemPayload,
  UpdateItemPayload,
  WorkloadItem,
} from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';

// Styles & Images
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import 'styles.scss';


export function InvestmentInsights(props: IPageProps) {
  const { workloadClient } = props;
  const pageContext = useParams<IContextProps>();
  const { pathname } = useLocation();

  // initializing usage of FluentUI icons
  initializeIcons();

  // React state for WorkloadClient APIs
  const [selectedLakehouse, setSelectedLakehouse] = useState<GenericItem>(undefined);
  const [sampleItem, setSampleItem] = useState<WorkloadItem<ItemPayload>>(undefined);
  const [itemDetails, setItemDetails] = useState<WorkloadItem<ItemPayload>>(undefined);
  const [operand1, setOperand1] = useState<number>(0);
  const [operand2, setOperand2] = useState<number>(0);
  const [operator, setOperator] = useState<string>('');
  const [isDirty, setDirty] = useState<boolean>(false);

  // load the existing Item (via its objectId)
  useMemo(() => loadDataFromUrl(pageContext, pathname), [pageContext, pathname]);
  useMemo(() => getItemDetails(pageContext, pathname), [pageContext, pathname]);

  const [selectedTab, setSelectedTab] = useState<TabValue>("portfolio");
  
  const sampleQuestions = [
    "What is the impact of expense ratios in the portfolio?",
    "What would be the impact of tax loss harvesting in the portfolio?",
    "Can you backtest what the impact would have been if 1,000 shares of Netflix were added to the portfolio last July?",
  ];

  const { isFetching: workloadSettingsIsFetching, data: workloadSettings } = useQuery<IWorkloadSettings>({
    queryKey: ['WorkloadSettings', itemDetails?.workspaceId],
    queryFn: itemDetails?.workspaceId ? () => GetWorkloadSettings(workloadClient, itemDetails?.workspaceId) : skipToken,
  });

  // Display a loading screen while we determine if we're in a Workspace and if the Settings lakehouse exists.
  if (workloadSettingsIsFetching) {
    return <LoadingScreen />;
  } else if (itemDetails?.workspaceId && !workloadSettingsIsFetching && workloadSettings.hasWorkloadSettingsLakehouse === false) {
    return <Setup itemDetails={itemDetails} workloadClient={workloadClient} />;
  }

  async function getItemDetails(pageContext: IContextProps, pathname: string): Promise<void> {
    if (pageContext.itemObjectId) {
      try {
        const getItemResult = await callItemGet(
            pageContext.itemObjectId,
            workloadClient
        );
        const item = convertGetItemResultToWorkloadItem<ItemPayload>(getItemResult);
        setItemDetails(item);
      } catch {}
    }
  }

  async function loadDataFromUrl(pageContext: IContextProps, pathname: string): Promise<void> {
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        const getItemResult = await callItemGet(
            pageContext.itemObjectId,
            workloadClient
        );
        const item =
            convertGetItemResultToWorkloadItem<ItemPayload>(getItemResult);

        setSampleItem(item);

        // load extendedMetadata
        const item1Metadata: Item1ClientMetadata =
            item.extendedMetdata.item1Metadata;
        setSelectedLakehouse(item1Metadata?.lakehouse);
        setOperand1(item1Metadata?.operand1);
        setOperand2(item1Metadata?.operand2);
        setOperator(item1Metadata?.operator);
      } catch (error) {
        console.error(
            `Error loading the Item (object ID:${pageContext.itemObjectId}`,
            error
        );
        clearItemData();
      }
    } else {
      console.log(`non-editor context. Current Path: ${pathname}`);
      clearItemData();
    }
  }

  function clearItemData() {
    setSampleItem(undefined);
  }

  async function SaveItem() {
    // call ItemUpdate with the current payload contents
    let payload: UpdateItemPayload = {
      item1Metadata: {
        lakehouse: selectedLakehouse,
        operand1: operand1,
        operand2: operand2,
        operator: operator,
      }
    };

    await callItemUpdate(sampleItem.id, payload, workloadClient);

    setDirty(false);
  }

  async function DeleteItem() {
    if (sampleItem) {
      await callItemDelete(sampleItem.id, workloadClient);
    }
  }

  function getItemObjectId() {
    const params = useParams<IContextProps>();
    return sampleItem?.id || params.itemObjectId;
  }

  return (
    <WebSocketProvider endpoint={process.env.INVESTMENTINSIGHTS_COPILOT_ENDPOINT}>
      <Stack className="editor">
        <Ribbon
          {...props}
          isLakeHouseSelected={selectedLakehouse != undefined}
          isSaveButtonEnabled={sampleItem?.id !== undefined && selectedLakehouse !== undefined && isDirty}
          saveItemCallback={SaveItem}
          isDeleteEnabled={sampleItem?.id !== undefined}
          deleteItemCallback={DeleteItem}
          itemObjectId={getItemObjectId()}
          onTabChange={setSelectedTab}
        />
        <Stack className="main">
          {["portfolio"].includes(selectedTab as string) && (
            <Grid mb="xl">
              <Grid.Col span={12}>
                <Container fluid mt="lg">
                  <ClientDetails itemDetails={itemDetails} workloadClient={workloadClient} />
                </Container>
              </Grid.Col>
              <Grid.Col span={8}>
                <Container fluid mt="xs">
                  <AreaChart itemDetails={itemDetails} workloadClient={workloadClient} />
                </Container>
                <Container fluid mt="lg">
                  <Allocations itemDetails={itemDetails} workloadClient={workloadClient} />
                </Container>
              </Grid.Col>
              <Grid.Col span={4}>
                <Container fluid mt="xs">
                  <Copilot 
                    workloadClient={workloadClient} 
                    sendPortfolioId={true} 
                    showAgentInteractions={true} 
                    sampleQuestions={sampleQuestions} 
                    copilotName="Advisor Copilot" 
                  />
                </Container>
              </Grid.Col>
              <Grid.Col span={12}>
                <Container fluid mt="lg">
                  <Activity itemDetails={itemDetails} workloadClient={workloadClient} />
                </Container>
              </Grid.Col>
            </Grid>
          )}
          {["about"].includes(selectedTab as string) && (
            <iframe style={{ border: 'none', height: 800, width: 'auto' }} src="https://azurediagrams.com/R2QszR9Q?embed&controls"></iframe>
          )}
        </Stack>
      </Stack>
    </WebSocketProvider>
  );
}
