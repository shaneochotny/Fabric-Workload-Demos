// Libraries
import React from "react";

// Components
import { Box, Center, Chip, Group, Loader, SegmentedControl, Stack, Text } from '@mantine/core';
import { ResponsiveBar } from '@nivo/bar';
import { GraphTooltip } from 'components/GraphTooltip';
import { CopilotInsightsButton } from 'components/Copilot/CopilotInsightsButton';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Interfaces
import { IKQLDatabase, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';
import { useUIStore, useShallow } from 'hooks/useContosoInvestmentPartners';

// Styles & Images
import { DismissRegular } from "@fluentui/react-icons";


const useUIStoreSelector = (state: any) => ({
  dashboardTimespan: state.dashboardTimespan,
  setDashboardTimespan: state.setDashboardTimespan,
  selectedInvestment: state.selectedInvestment,
  setSelectedInvestment: state.setSelectedInvestment,
});

type SourceData = {
  transaction_month: string;
  transaction_date: string;
  investment_name: string;
  distributions: number;
};

type TargetData = {
  transaction_month: string;
  [investmentName: string]: number | string;
};

function pivotData(source: SourceData[]): TargetData[] {
  const resultMap = new Map<string, TargetData>();

  for (const entry of source) {
      const { transaction_month, investment_name, distributions } = entry;

      if (!resultMap.has(transaction_month)) {
          resultMap.set(transaction_month, { transaction_month });
      }

      resultMap.get(transaction_month)![investment_name] = distributions;
  }

  return Array.from(resultMap.values());
};

function getInvestmentNames(data: SourceData[]): string[] {
  return Array.from(new Set(data.map(entry => entry.investment_name)));
};

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function AreaChart({ itemDetails, workloadClient }: Props) {
  const { dashboardTimespan, setDashboardTimespan, selectedInvestment, setSelectedInvestment } = useUIStore(useShallow(useUIStoreSelector));

  const { isFetching: kqlDatabaseIsFetching, data: kqlDatabase } = useQuery<IKQLDatabase>({
    queryKey: ['KQLDatabase', itemDetails?.workspaceId],
    queryFn: itemDetails?.workspaceId ? () => GetKQLDatabase(workloadClient, itemDetails?.workspaceId, null, process.env.INVESTMENTPARTNERS_DEFAULT_DATABASE_NAME) : skipToken,
    placeholderData: {
      id: process.env.INVESTMENTPARTNERS_DEFAULT_DATABASE,
      displayName: process.env.INVESTMENTPARTNERS_DEFAULT_DATABASE_NAME,
      workspaceId: process.env.INVESTMENTPARTNERS_DEFAULT_WORKSPACE,
      properties: {
        parentEventhouseItemId: process.env.INVESTMENTPARTNERS_DEFAULT_EVENTHOUSE,
        queryServiceUri: process.env.INVESTMENTPARTNERS_DEFAULT_EVENTHOUSE_CONNECTION_STRING,
      }
    }
  });
  
  const { isFetching, data } = useQuery({
    queryKey: ['ContosoInvestmentPartnersChart', dashboardTimespan, selectedInvestment],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `vw_Distributions('${dashboardTimespan}', '${selectedInvestment}')`, kqlDatabase) : skipToken,
    placeholderData: [],
  });

  const investmentNames = data && data.length > 0 ? getInvestmentNames(data) : [];

  // We need to pivot the API JSON response to what Nivo needs
  const chartData = data && data.length > 0 ? pivotData(data) : [];

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fz="md" fw={500}>Distributions</Text>
          <Text fz="sm" c="dimmed">{selectedInvestment}</Text>
        </div>
        <Group justify="flex-end">
          {selectedInvestment !== 'Entire Portfolio' &&
            <Chip
              icon={<DismissRegular />}
              color="#117865"
              variant="filled"
              size="xs"
              defaultChecked
              onClick={() => setSelectedInvestment('Entire Portfolio')}
            >
              {selectedInvestment}
            </Chip>
          }
          <SegmentedControl
            radius="xs"
            size="xs"
            color="#117865"
            value={dashboardTimespan}
            onChange={setDashboardTimespan}
            data={[
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
                No Distributions
              </Text>
            </Stack>
          </Center>
        :
          <ResponsiveBar
            data={chartData}
            keys={investmentNames}
            indexBy="transaction_month"
            margin={{ top: 10, right: 20, bottom: 50, left: 60 }}
            padding={0.3}
            valueFormat=" >-$,"
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'set2' }}
            borderColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        1.6
                    ]
                ]
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
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
                legendOffset: -40,
                truncateTickAt: 0
            }}
            enableLabel={false}
            tooltip={
              ({id, value, color, data}) =>
                <GraphTooltip
                  indicatorColor={color}
                  title={id}
                  subTitle="Distribution"
                  values={[
                    {
                      label: data.transaction_month,
                      value: `${Number(value).toLocaleString(undefined, {
                        style: 'currency', 
                        currency: 'USD', 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 0
                      })}`
                    }
                  ]}
                />
            }
          />
        }
      </Box>
    </Box>
  )
}