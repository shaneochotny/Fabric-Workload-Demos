// Libraries
import React from "react";

// Components
import { Box, Group, Stack, Text } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { CopilotInsightsButton } from 'components/Copilot';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Interfaces
import { IHoldingsByType, IKQLDatabase, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';
import { useUIStore, useShallow } from 'hooks/useInvestmentInsights';

// Styles & Images
import { CaretDownFilled, CaretUpFilled } from '@fluentui/react-icons';
import classes from './Styles.module.css';


const useUIStoreSelector = (state: any) => ({
  setSelectedHolding: state.setSelectedHolding,
});

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function Allocations({ itemDetails, workloadClient }: Props) {
  const { setSelectedHolding } = useUIStore(useShallow(useUIStoreSelector));

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

  const { isFetching, data } = useQuery<IHoldingsByType[]>({
    queryKey: ['Holdings', itemDetails?.workspaceId],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `vw_HoldingsByType(${1})`, kqlDatabase) : skipToken,
    refetchInterval: 3000,
  });

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fz="md" fw={500}>Portfolio Allocations</Text>
          <Text fz="sm" c="dimmed">Performance and Total Allocation</Text>
        </div>
        <Group justify="flex-end">
          <CopilotInsightsButton content="What would be some good insights regarding the portfolio allocations?" />
        </Group>
      </Group>
      <DataTable
        highlightOnHover
        minHeight={300}
        height={300}
        records={data}
        fetching={isFetching && !data}
        onRowClick={({ record }) => {
          setSelectedHolding(record.symbol);
        }}
        classNames={{
          table: classes.dataTable,
        }}
        loaderType="oval"
        loaderSize="lg"
        loaderColor="#117865"
        emptyState={
          <Stack align="center" gap="xs">
            <Text c="dimmed" size="xs">
              No Portfolio
            </Text>
          </Stack>
        }
        columns={[,
          {
            accessor: 'name',
            width: '20%',
            render: ({ name, symbol }) => (
              <Box>
                {name}
                <Text fz="xs" c="dimmed">
                  {symbol}
                </Text>
              </Box>
            ),
          },
          { 
            accessor: 'current_price',
            title: 'Current Price',
            textAlign: 'right',
            width: '20%',
            render: ({ current_price, previous_close, todays_percent_change }) => (
              <Box>
                {
                  current_price.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                }
                <Group justify="flex-end" gap={2}>
                  {todays_percent_change === 0 ? 
                    <></>
                  : todays_percent_change > 0 ?
                    <CaretUpFilled color="teal" />
                  :
                    <CaretDownFilled color="red" />
                  }
                  <Text c={todays_percent_change === 0 ? 'dimmed' : todays_percent_change > 0 ? 'teal' : 'red'} fz="xs" pr="xs">
                    {
                      (todays_percent_change / 100).toLocaleString(undefined, { 
                        style: 'percent',
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })
                    }
                  </Text>
                  <Text c={todays_percent_change === 0 ? 'dimmed' : todays_percent_change > 0 ? 'teal' : 'red'} fz="xs">
                    (
                    {todays_percent_change > 0 ? '+' : null}
                    {
                      (current_price - previous_close).toLocaleString(undefined, { 
                        style: 'currency', 
                        currency: 'USD', 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2
                      })
                    }
                    )
                  </Text>
                </Group>
              </Box>
            )
          },
          { 
            accessor: 'todays_open_value',
            title: 'Today\'s Gain/Loss',
            textAlign: 'right',
            width: '20%',
            render: ({ todays_open_value, current_value, todays_growth_percent }) => (
              <Box>
                {todays_growth_percent > 0 ? '+' : null}
                {
                  (current_value - todays_open_value).toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                }
                <Group justify="flex-end" gap={2}>
                  {todays_growth_percent === 0 ?
                    <></>
                  : todays_growth_percent > 0 ?
                    <CaretUpFilled color="teal" />
                  :
                    <CaretDownFilled color="red" />
                  }
                  <Text c={todays_growth_percent === 0 ? 'dimmed' : todays_growth_percent > 0 ? 'teal' : 'red'} fz="xs">
                    {
                      (todays_growth_percent / 100).toLocaleString(undefined, { 
                        style: 'percent',
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })
                    }
                  </Text>
                </Group>
              </Box>
            )
          },
          { 
            accessor: 'current_value',
            title: 'Total Value',
            textAlign: 'right',
            width: '20%',
            render: ({ current_value, growth_percent, growth_value }) => (
              <Box>
                {
                  current_value.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                }
                <Group justify="flex-end" gap={2}>
                  {growth_percent > 0 ?
                    <CaretUpFilled color="teal" />
                  :
                    <CaretDownFilled color="red" />
                  }
                  <Text c={growth_percent > 0 ? 'teal' : 'red'} fz="xs" pr="xs">
                    {
                      (growth_percent / 100).toLocaleString(undefined, { 
                        style: 'percent',
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })
                    }
                  </Text>
                  <Text c={growth_percent > 0 ? 'teal' : 'red'} fz="xs">
                    (
                    {growth_value > 0 ? '+' : null}
                    {
                      growth_value.toLocaleString(undefined, { 
                        style: 'currency', 
                        currency: 'USD', 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2
                      })
                    }
                    )
                  </Text>
                </Group>
              </Box>
            )
          },
          { 
            accessor: 'percent_of_portfolio',
            title: 'Allocation',
            textAlign: 'right',
            width: '20%',
            render: ({ percent_of_portfolio, current_quantity }) => (
              <Box>
                {
                  (percent_of_portfolio / 100).toLocaleString(undefined, { 
                    style: 'percent', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })
                }
                <Text fz="xs" c="dimmed">
                  {Intl.NumberFormat().format(current_quantity)} Shares
                </Text>
              </Box>
            )
          },
        ]}
      />
    </Box>
  )
}