// Libraries
import React from "react";

// Components
import { Box, Chip, Group, Stack, Text } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { CopilotInsightsButton } from 'components/Copilot';

// Interfaces
import { IActivity, IKQLDatabase, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';
import { useUIStore, useShallow } from 'hooks/useInvestmentInsights';

// Styles & Images
import classes from './Styles.module.css';
import { CaretDownFilled, CaretUpFilled, DismissRegular } from '@fluentui/react-icons';


const useUIStoreSelector = (state: any) => ({
  selectedHolding: state.selectedHolding,
  setSelectedHolding: state.setSelectedHolding,
});

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function Activity({ itemDetails, workloadClient }: Props) {
  const { selectedHolding, setSelectedHolding } = useUIStore(useShallow(useUIStoreSelector));

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

  const { isFetching, data } = useQuery<IActivity[]>({
    queryKey: ['Activity', itemDetails?.workspaceId, selectedHolding],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `vw_Activity(${1}, '${selectedHolding}')`, kqlDatabase) : skipToken,
    refetchInterval: 3000,
  });

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fz="md" fw={500}>Portfolio Activity</Text>
          <Text fz="sm" c="dimmed">Transactions: {selectedHolding}</Text>
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
          <Group justify="flex-end">
            <CopilotInsightsButton content="What would be some good insights regarding the portfolio activity?" />
          </Group>
        </Group>
      </Group>
      <DataTable
        highlightOnHover
        minHeight={300}
        height={300}
        records={data}
        fetching={isFetching && !data}
        classNames={{
          table: classes.dataTable,
        }}
        loaderType="oval"
        loaderSize="lg"
        loaderColor="#117865"
        emptyState={
          <Stack align="center" gap="xs">
            <Text c="dimmed" size="xs">
              No Transactions
            </Text>
          </Stack>
        }
        columns={[,
          {
            accessor: 'date',
          },
          { 
            accessor: 'company',
            render: ({ company, symbol }) => (
              <Box key={symbol}>
                {company}
                <Text fz="xs" c="dimmed">
                  {symbol}
                </Text>
              </Box>
            ),
          },
          { 
            accessor: 'transaction_type',
            title: 'Activity',
          },
          { 
            accessor: 'quantity',
            textAlign: 'right',
            render: ({ symbol, quantity }) => (
              <Text fz="sm" key={symbol + quantity}>
                {Intl.NumberFormat().format(quantity)}
              </Text>
            ),
          },
          { 
            accessor: 'current_price',
            title: 'Current Price',
            textAlign: 'right',
            render: ({ symbol, current_price }) => (
              <Text fz="sm" key={symbol + current_price}>
                {
                  current_price.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                }
              </Text>
            ),
          },
          { 
            accessor: 'buy_price',
            title: 'Cost Basis',
            textAlign: 'right',
            render: ({ symbol, buy_price }) => (
              <Text fz="sm" key={symbol + buy_price}>
                {
                  buy_price.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                }
              </Text>
            ),
          },
          { 
            accessor: 'total_basis',
            title: 'Total Cost Basis',
            textAlign: 'right',
            render: ({ symbol, total_basis }) => (
              <Text fz="sm" key={symbol + total_basis}>
                {
                  total_basis.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                }
              </Text>
            ),
          },
          { 
            accessor: 'amount',
            title: 'Amount',
            textAlign: 'right',
            render: ({ symbol, transaction_type, current_value, amount, percent_change, earnings }) => (
              <Box key={symbol + amount}>
                {transaction_type === 'Buy' ?
                  current_value.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                  :
                  amount.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                }
                <Group justify="flex-end" gap={2}>
                  {percent_change > 0 ?
                    <CaretUpFilled color="teal" />
                  :
                    <CaretDownFilled color="red" />
                  }
                  <Text c={percent_change > 0 ? 'teal' : 'red'} fz="xs" pr="xs">
                    {(percent_change / 100).toLocaleString(undefined, { 
                      style: 'percent',
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </Text>
                  <Text c={percent_change > 0 ? 'teal' : 'red'} fz="xs">
                    ({earnings > 0 ? '+' : null}
                    {
                      earnings.toLocaleString(undefined, { 
                        style: 'currency', 
                        currency: 'USD', 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2
                      })
                    })
                  </Text>
                </Group>
              </Box>
            )
          },
        ]}
      />
    </Box>
  )
}