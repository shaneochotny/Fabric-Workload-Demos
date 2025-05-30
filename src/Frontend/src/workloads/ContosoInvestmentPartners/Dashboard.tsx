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
import { ClientDetails } from './ClientDetails';
import { AreaChart } from './AreaChart';
import { Investments } from './Investments';
import { Copilot } from '../../components/Copilot/Copilot';
import { Activity } from './Activity';

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

export function ContosoInvestmentPartners(props: IPageProps) {
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
    "For each property, calculate the break-even occupancy rate required to cover total operating expenses and debt service. Using the available data, analyze which properties have the highest and lowest break-even occupancy rates. Identify the properties with the widest margin of safety based on their current occupancy levels. Rank the properties from lowest to highest risk based on this metric.",
    "Perform a sensitivity analysis on each property under three economic scenarios: \n\nBest-Case: 5% rent growth, cap rate compression (-0.25%), and stable interest rates. \nBase-Case: Market rent growth projections, current cap rate, and a 0.25% interest rate hike. \nWorst-Case: 5% rent decline, 0.50% cap rate expansion, and an additional 0.50% interest rate hike. \n\nFor each property, calculate the impact on NOI, DSCR, IRR, and valuation. Rank properties from most resilient to most vulnerable based on their performance in the worst-case scenario. ",
    "Analyze the Net Operating Income (NOI) growth potential for each property based on market rent growth projections, occupancy trends, and capital improvement budgets. Identify properties with: \n\n- Under-market rents that allow for easy rent increases. \n- Stabilization upside (vacancy reduction potential). \n- Operational efficiencies that could reduce expenses. \n- Planned renovations that drive rent premiums. \n\nRank properties from highest to lowest NOI growth potential and suggest specific value-add strategies for maximizing income. ",
    "Evaluate how each property aligns with macro trends, job growth, and demographic shifts. Use the following indicators: \n\n- Median household income in the area vs. required rent-to-income ratio. \n- Market rent growth projections vs. national averages. \n- Walkability score and access to transit/jobs. \n- Occupancy trends over time. \n\nIdentify which properties are positioned in high-growth, resilient markets and which may face stagnation due to local economic trends. Rank properties by macroeconomic strength and demographic alignment. ",
    "Assess the risk-adjusted returns for each property considering leverage, DSCR trends, and refinancing risks: \n\n- Compare Loan-to-Cost (LTC) ratios and identify highly leveraged properties. \n- Assess DSCR changes before and after the interest rate hike. \n- Identify properties with potential refinancing risk (balloon payments, floating rates). \n- Analyze cap rate expansion sensitivity and how it impacts exit valuation. \n\nRank properties from most conservative (low risk) to most aggressive (high-risk) based on their ability to maintain cash flow stability and refinance efficiently. ",
    "You are a Real Estate Sales Analyst recommending the best multifamily investment property based on an investor's specific goals. Analyze the properties provided and present a data-backed investment pitch tailored to their risk profile, return expectations, and market preferences. Use the structured dataset below to identify the most suitable investment and justify your selection.\n\n- Target IRR: 14%\n- Cash-on-Cash Yield: 7%\n- Investment Horizon:  5-7 years\n- Moderate: Some value-add potential, manageable DSCR.\n- Aggressive: High-growth market\n- Sensitivity to Interest Rate Increases: Medium",
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
  };

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
        const item1Metadata: Item1ClientMetadata = item.extendedMetdata.item1Metadata;
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
  };

  function clearItemData() {
    setSampleItem(undefined);
  };

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
  };

  async function DeleteItem() {
    if (sampleItem) {
      await callItemDelete(sampleItem.id, workloadClient);
    }
  };

  function getItemObjectId() {
    const params = useParams<IContextProps>();
    return sampleItem?.id || params.itemObjectId;
  };

  return (
    <WebSocketProvider endpoint={process.env.INVESTMENTPARTNERS_COPILOT_ENDPOINT}>
      <Stack className="editor">
        <Ribbon
          {...props}
          isLakeHouseSelected={selectedLakehouse != undefined}
          //  disable save when in demo-only
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
              <Grid.Col span={7}>
                <Container fluid mt="xs">
                  <AreaChart itemDetails={itemDetails} workloadClient={workloadClient} />
                </Container>
                <Container fluid mt="lg">
                  <Investments itemDetails={itemDetails} workloadClient={workloadClient} />
                </Container>
              </Grid.Col>
              <Grid.Col span={5}>
                <Container fluid mt="xs">
                  <Copilot 
                    workloadClient={workloadClient} 
                    sendPortfolioId={false} 
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
            <iframe style={{ border: 'none', height: 800, width: 'auto' }} src="https://azurediagrams.com/PRvjVfcd?embed&controls"></iframe>
          )}
        </Stack>
      </Stack>
    </WebSocketProvider>
  );
};