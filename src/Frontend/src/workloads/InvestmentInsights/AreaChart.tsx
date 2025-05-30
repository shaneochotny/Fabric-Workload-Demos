// Libraries
import React from "react";
import moment from 'moment';

// Components
import { Box, Center, Chip, Group, Loader, SegmentedControl, Stack, Text } from '@mantine/core';
import { linearGradientDef } from '@nivo/core'
import { ResponsiveLine } from '@nivo/line';
import { GraphTooltip } from 'components/GraphTooltip';
import { CopilotInsightsButton } from 'components/Copilot';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Interfaces
import { IKQLDatabase, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';
import { useUIStore, useShallow } from 'hooks/useInvestmentInsights';

// Styles & Images
import { DismissRegular } from "@fluentui/react-icons";


const useUIStoreSelector = (state: any) => ({
  dashboardTimespan: state.dashboardTimespan,
  setDashboardTimespan: state.setDashboardTimespan,
  selectedHolding: state.selectedHolding,
  setSelectedHolding: state.setSelectedHolding,
});

const pivotData = (source: SourceData[]): TargetData[] => {
  // Step 1: Group data by ticker
  const groupedData: { [symbol: string]: { x: string; y: number }[] } = {};

  source.forEach(({ date, symbol, portfolio_value }) => {
      if (!groupedData[symbol]) {
          groupedData[symbol] = [];
      }
      groupedData[symbol].push({ x: date, y: portfolio_value });
  });

  // Step 2: Sort each ticker's data by date
  for (const symbol in groupedData) {
      groupedData[symbol].sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
  }

  // Step 3: Convert to target format
  const target: TargetData[] = Object.keys(groupedData).map(symbol => ({
      id: symbol,
      data: groupedData[symbol],
  }));

  return target;
};

type SourceData = {
  date: string;
  symbol: string;
  portfolio_value: number;
};

type TargetData = {
  id: string;
  data: { x: string; y: number }[];
};

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function AreaChart({ itemDetails, workloadClient }: Props) {
  const { dashboardTimespan, setDashboardTimespan, selectedHolding, setSelectedHolding } = useUIStore(useShallow(useUIStoreSelector));

  const { isFetching: kqlDatabaseIsFetching, data: kqlDatabase } = useQuery<IKQLDatabase>({
    queryKey: ['KQLDatabase', itemDetails?.workspaceId],
    queryFn: itemDetails?.workspaceId ? () => GetKQLDatabase(workloadClient, itemDetails?.workspaceId, null, process.env.INVESTMENTINSIGHTS_DEFAULT_DATABASE_NAME) : skipToken,
    placeholderData: {
      id: process.env.INVESTMENTINSIGHTS_DEFAULT_DATABASE,
      displayName: process.env.INVESTMENTINSIGHTS_DEFAULT_DATABASE_NAME,
      workspaceId: process.env.INVESTMENTINSIGHTS_DEFAULT_WORKSPACE,
      properties: {
        parentEventhouseItemId: process.env.INVESTMENTINSIGHTS_DEFAULT_EVENTHOUSE,
        queryServiceUri: process.env.INVESTMENTINSIGHTS_DEFAULT_EVENTHOUSE_CONNECTION_STRING,
      }
    }
  });

  const { isFetching, data } = useQuery({
    queryKey: ['Chart', itemDetails?.workspaceId, dashboardTimespan, selectedHolding],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `vw_PerformanceByDay(${1}, '${dashboardTimespan}', '${selectedHolding}')`, kqlDatabase) : skipToken,
  });

  // Find the minimum portfolio_value so we can scale the chart y-axis properly
  const minValue = data && data.length > 0 
    ? data.reduce((min: any, current: any) => 
        current.portfolio_value < min.portfolio_value ? current : min
      ).portfolio_value 
    : 0;

  // We need to pivot the API JSON response to what Nivo needs
  const chartData = data && data.length > 0 ? pivotData(data) : [];

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fz="md" fw={500}>Portfolio Performance</Text>
          <Text fz="sm" c="dimmed">{selectedHolding}</Text>
        </div>
        <Group justify="flex-end">
          {selectedHolding !== 'Entire Portfolio' &&
            <Chip
              icon={<DismissRegular />}
              color="#117865"
              variant="filled"
              size="xs"
              defaultChecked
              onClick={() => setSelectedHolding('Entire Portfolio')}
            >
              {selectedHolding}
            </Chip>
          }
          <SegmentedControl
            radius="xs"
            size="xs"
            color="#117865"
            value={dashboardTimespan}
            onChange={setDashboardTimespan}
            data={[
              { value: '1D', label: '1D' },
              { value: '1M', label: '1M' },
              { value: '6M', label: '6M' },
              { value: 'YTD', label: 'YTD' },
              { value: '1Y', label: '1Y' },
              { value: 'FULL', label: 'FULL' },
            ]}
            disabled={isFetching}
          />
          <Group justify="flex-end">
            <CopilotInsightsButton content="What would be some good insights regarding the portfolio performance?" />
          </Group>
        </Group>
      </Group>
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
              No Transactions
            </Text>
          </Stack>
        </Center>
        :
          <ResponsiveLine
            data={chartData}
            margin={{ top: 10, right: 20, bottom: 50, left: 60 }}
            yScale={{ type: 'linear', stacked: false, min: 'auto', max: 'auto' }}
            yFormat={value =>
              `${Number(value).toLocaleString(undefined, {
                style: 'currency', 
                currency: 'USD', 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2
              })}`
            }
            curve="monotoneX"
            xScale={{
              type: 'time',
              format: '%Y-%m-%dT%H:%M:%S',
              precision: dashboardTimespan === '1D' ? 'minute' :'day',
            }}
            xFormat="time:%Y-%m-%dT%H:%M:%S"
            axisTop={null}
            axisBottom={{
              format: dashboardTimespan === '1D' ? '%H:%M' : '%b %d',
              tickValues: dashboardTimespan === '1D' ? 'every 1 hours' : undefined,
              truncateTickAt: 0
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              format: '.2s',
              legendOffset: -40,
              legendPosition: 'middle'
            }}
            enableGridY={false}
            enableGridX={false}
            colors={{ scheme: 'tableau10' }}
            defs={[
              linearGradientDef('gradientA', [
                  { offset: 0, color: 'inherit' },
                  { offset: 100, color: 'inherit', opacity: 0 },
              ]),
            ]}
            fill={[{ match: '*', id: 'gradientA' }]}
            lineWidth={1}
            enablePoints={false}
            enableArea={true}
            areaBaselineValue={minValue}
            areaOpacity={0.1}
            enableTouchCrosshair={true}
            useMesh={true}
            tooltip={
              (activeLine: any) =>
                <GraphTooltip
                  indicatorColor={activeLine.point.color}
                  title={moment(activeLine.point.data.x).format("MMMM Do, YYYY")}
                  values={[{
                    label: activeLine.point.serieId,
                    value: `${Number(activeLine.point.data.y).toLocaleString(undefined, {
                      style: 'currency', 
                      currency: 'USD', 
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 0
                    })}`
                  }]}
                />
            }
          />
        }
      </Box>
    </Box>
  )
}