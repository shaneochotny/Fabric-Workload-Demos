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
import { Ribbon } from "./Ribbon";
import { Statistics } from "./Statistics";
import { SummaryCharts } from './SummaryCharts';
import { Summary } from './Summary';
import { Copilot } from '../../components/Copilot';
import { Details } from './Details';

// Interfaces
import { IContextProps, IPageProps } from 'interfaces';
import {
  Item1ClientMetadata,
  GenericItem,
  ItemPayload,
  UpdateItemPayload,
  WorkloadItem,
} from 'models/SampleWorkloadModel';

// Styles & Images
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import 'styles.scss';


export function RetailIQ(props: IPageProps) {
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

  const [selectedTab, setSelectedTab] = useState<TabValue>("sales");
  
  const sampleQuestions = [
    "Analyze the current sales, inventory levels, and margin data for all SKUs across all stores, then propose a reallocation plan that prevents potential stockouts, minimizes excess inventory, and maximizes overall gross margin for the next two weeks—explain the rationale behind each transfer recommendation.",
    "We're planning a mid-season promotional campaign for our men's jackets in selected stores next week. Considering current inventory levels, last week's sales trends, and the gross margin target, which stores need extra stock, how many units should be transferred, and how does this impact our overall warehouse capacity? Propose a logistics plan and explain how it balances promotion timing with minimum shipping cost.",
    "Identify the top three (Store, SKU) combinations that are at high risk of stockout over the next week—based on their recent daily sales versus current inventory levels—and propose which overstocked store-SKU combos could supply them. Highlight how these reallocations preserve or improve gross margin in the process.",
  ];


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
    <WebSocketProvider endpoint={process.env.RETAILIQ_COPILOT_ENDPOINT}>
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
          {["sales"].includes(selectedTab as string) && (
            <Grid mb="xl">
              <Grid.Col span={12}>
                <Container fluid mt="lg">
                  <Statistics itemDetails={itemDetails} workloadClient={workloadClient} />
                </Container>
              </Grid.Col>
              <Grid.Col span={7}>
                <Container fluid mt="xs">
                  <SummaryCharts itemDetails={itemDetails} workloadClient={workloadClient} />
                </Container>
                <Container fluid mt="lg">
                  <Summary itemDetails={itemDetails} workloadClient={workloadClient} />
                </Container>
              </Grid.Col>
              <Grid.Col span={5}>
                <Container fluid mt="xs">
                  <Copilot 
                    workloadClient={workloadClient} 
                    sendPortfolioId={false} 
                    showAgentInteractions={true} 
                    sampleQuestions={sampleQuestions} 
                    copilotName="Retail IQ Copilot" 
                  />
                </Container>
              </Grid.Col>
              <Grid.Col span={12}>
                <Container fluid mt="lg">
                  <Details itemDetails={itemDetails} workloadClient={workloadClient} />
                </Container>
              </Grid.Col>
            </Grid>
          )}
          {["about"].includes(selectedTab as string) && (
            <iframe style={{ border: 'none', height: 800, width: 'auto' }} src="https://azurediagrams.com/B2XBm6uh?embed&controls"></iframe>
          )}
        </Stack>
      </Stack>
    </WebSocketProvider>
  );
}
