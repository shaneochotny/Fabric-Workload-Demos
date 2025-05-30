// Libraries
import React from "react";

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Components
import { Box, Center, Loader, Stack, Text } from '@mantine/core';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { GraphTooltip } from 'components/GraphTooltip';

// Interfaces
import { IKQLDatabase, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';
import { useUIStore, useShallow } from 'hooks/useRetailIQ';


const useUIStoreSelector = (state: any) => ({
  showBy: state.showBy,
  pivotBy: state.pivotBy,
  storeFilter: state.storeFilter,
  categoryFilter: state.categoryFilter,
  productFilter: state.productFilter,
});

type SourceData = {
  storeName: string;
  productName: string;
  last7DaysSales: number;
  inventoryOnHand: number;
};

type TargetData = {
  id: string;
  data: TargetValues[];
};

type TargetValues = {
  x: string;
  y: number;
};

function pivotData(source: SourceData[], pivotBy: string): TargetData[] {
  const productNames = Array.from(new Set(source.map(entry => entry.productName)));
  let targetData: TargetData[] = [];

  for (const productName of productNames) {
    let targetValues: TargetValues[] = [];
    for(const entry of source) {
      if(entry.productName === productName) {
        const { storeName, last7DaysSales, inventoryOnHand } = entry;
        targetValues.push({ x: storeName, y: pivotBy === 'last7DaysSales' ? last7DaysSales : inventoryOnHand });
      }
    }
    targetData.push({ id: productName, data: targetValues });
  };

  return targetData;
};

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function Heatmap({ itemDetails, workloadClient }: Props) {
  const { showBy, pivotBy, storeFilter, categoryFilter, productFilter } = useUIStore(useShallow(useUIStoreSelector));

  const { isFetching: kqlDatabaseIsFetching, data: kqlDatabase } = useQuery<IKQLDatabase>({
    queryKey: ['KQLDatabase', itemDetails?.workspaceId],
    queryFn: itemDetails?.workspaceId ? () => GetKQLDatabase(workloadClient, itemDetails?.workspaceId, null, process.env.RETAILIQ_DEFAULT_DATABASE_NAME) : skipToken,
    placeholderData: {
      id: process.env.RETAILIQ_DEFAULT_DATABASE,
      displayName: process.env.RETAILIQ_DEFAULT_DATABASE_NAME,
      workspaceId: process.env.RETAILIQ_DEFAULT_WORKSPACE,
      properties: {
        parentEventhouseItemId: process.env.RETAILIQ_DEFAULT_EVENTHOUSE,
        queryServiceUri: process.env.RETAILIQ_DEFAULT_EVENTHOUSE_CONNECTION_STRING,
      }
    }
  });
    
  const { isFetching, data } = useQuery({
    queryKey: ['RetailHeatmap', showBy, storeFilter, categoryFilter, productFilter],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `retail_Heatmap("${showBy}", "${storeFilter}", "${categoryFilter}", "${productFilter}")`, kqlDatabase) : skipToken,
    placeholderData: [],
  });

  type TooltipValues = {
    label: any;
    value: any;
  };

  // Lookup the Units Sold and Inventory on Hand for tooltips
  function getTooltipValues(name: any, serieId: any): TooltipValues[] {
    for (const entry of data) {
      if (entry.storeName === serieId && entry.productName === name) {
        return [
          {
            label: 'Units Sold',
            value: Intl.NumberFormat().format(entry.last7DaysSales),
          },
          {
            label: 'Inventory on Hand',
            value: Intl.NumberFormat().format(entry.inventoryOnHand),
          }
        ];
      }
    };

    return [{ label: '', value: '' }];
  };

  // We need to pivot the API JSON response to what Nivo needs
  const chartData = data && data.length > 0 ? pivotData(data, pivotBy) : [];

  return (
    <Box style={{ width: '100%', height: 300 }} mx="xs" px={0} my="xs">
      {isFetching ? 
        <Center w="100%" h="100%">
          <Stack align="center" gap={0}>
            <Loader type="oval" color="#117865" size="lg" />
          </Stack>
        </Center>
      : chartData.length < 1 ?
        <Center w="100%" h="100%">
          <Stack align="center" gap={0}>
            <Text c="dimmed" size="xs">
              No Sales
            </Text>
          </Stack>
        </Center>
      :
        <ResponsiveHeatMap
          data={chartData}
          margin={{ top: 50, right: 10, bottom: 10, left: 180 }}
          borderColor={{
              from: 'color',
              modifiers: [
                  [
                      'darker',
                      1.6
                  ]
              ]
          }}
          colors={{
            type: 'diverging',
            scheme: 'greens',
          }}
          valueFormat=" >(,.0f"
          axisTop={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legendPosition: 'middle',
              legendOffset: 32,
              truncateTickAt: 0,
          }}
          axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legendPosition: 'middle',
              legendOffset: -180,
              truncateTickAt: 0
          }}
          tooltip={
            ({cell}) =>
              <GraphTooltip
                indicatorColor={cell.color}
                title={cell.serieId}
                subTitle={cell.data.x}
                values={getTooltipValues(cell.serieId, cell.data.x)}
              />
          }
        />
      }
    </Box>
  )
}