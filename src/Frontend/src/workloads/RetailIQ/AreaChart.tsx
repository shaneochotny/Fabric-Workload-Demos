// Libraries
import React from "react";
import moment from 'moment';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Components
import { Box, Center, Loader, Stack, Text } from '@mantine/core';
import { ResponsiveLine } from '@nivo/line';
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
  date: string;
  name: string;
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
  // Record name which can be the Store or Product
  const recordNames = Array.from(new Set(source.map(entry => entry.name)));
  let targetData: TargetData[] = [];

  for (const recordName of recordNames) {
    let targetValues: TargetValues[] = [];
    for(const entry of source) {
      if(entry.name === recordName) {
        const { date, last7DaysSales, inventoryOnHand } = entry;
        targetValues.push({ x: date, y: pivotBy === 'last7DaysSales' ? last7DaysSales : inventoryOnHand });
      }
    }
    targetData.push({ id: recordName, data: targetValues });
  }

  return targetData;
};

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function AreaChart({ itemDetails, workloadClient }: Props) {
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
    queryKey: ['RetailSales7Days', showBy, storeFilter, categoryFilter, productFilter],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `retail_BarChart("${showBy}", "${storeFilter}", "${categoryFilter}", "${productFilter}")`, kqlDatabase) : skipToken,
    placeholderData: [],
  });

  type TooltipValues = {
    label: any;
    value: any;
  };

  // Lookup the Units Sold and Inventory on Hand for tooltips
  function getTooltipValues(date: string, name: any): TooltipValues[] {
    for (const entry of data) {
      if (entry.date === date && entry.name === name) {
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
    }
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
        <ResponsiveLine
          data={chartData}
          margin={{ top: 10, right: 20, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          colors={{ scheme: 'set3' }}
          axisTop={null} 
          axisRight={null}
          axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legendPosition: 'middle',
              legendOffset: 32,
              truncateTickAt: 0,
              format: (value) => moment(value).format('MM/DD/YYYY')
          }}
          axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legendPosition: 'middle',
              legendOffset: -40,
              truncateTickAt: 0
          }}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          enableCrosshair={false}
          useMesh={true}
          tooltip={
            (activeLine: any) => 
              <GraphTooltip
                indicatorColor={activeLine.point.borderColor}
                title={activeLine.point.serieId}
                subTitle={showBy === 'StoreName' ? 'Store' : 'Product'}
                values={getTooltipValues(activeLine.point.data.x, activeLine.point.serieId)}
              />
          }
        />
      }
    </Box>
  )
};