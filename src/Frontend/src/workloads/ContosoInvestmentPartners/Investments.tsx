// Libraries
import React from "react";
import moment from 'moment';

// Components
import { Box, Group, Stack, Text } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { CopilotInsightsButton } from 'components/Copilot/CopilotInsightsButton';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Interfaces
import { IKQLDatabase, IActiveInvestments, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';
import { useUIStore, useShallow } from 'hooks/useContosoInvestmentPartners';

// Styles & Images
import classes from './Styles.module.css';


const useUIStoreSelector = (state: any) => ({
  setSelectedInvestment: state.setSelectedInvestment,
});

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function Investments({ itemDetails, workloadClient }: Props) {
  const { setSelectedInvestment } = useUIStore(useShallow(useUIStoreSelector));

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
  
  const { isFetching, data } = useQuery<IActiveInvestments[]>({
    queryKey: ['ContosoInvestmentPartnersInvestments'],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `vw_ActiveInvestments()`, kqlDatabase) : skipToken,
  });

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fz="md" fw={500}>Active Investments</Text>
          <Text fz="sm" c="dimmed">Contributions and Distributions</Text>
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
          setSelectedInvestment(record.investment_name);
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
              No Investments
            </Text>
          </Stack>
        }
        columns={[,
          {
            accessor: 'investment_name',
            title: 'Investment Name',
            width: '20%',
            render: ({ investment_name, start_date }) => (
              <Box>
                {investment_name}
                <Text fz="xs" c="dimmed">
                  Opened: {moment(start_date).format("MMMM Do, YYYY")}
                </Text>
              </Box>
            ),
          },
          { 
            accessor: 'commitment',
            title: 'Commitment',
            textAlign: 'right',
            width: '20%',
            render: ({ commitment }) => (
              <Box>
                {
                  commitment.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                }
              </Box>
            )
          },
          { 
            accessor: 'contributions',
            title: 'Contributions',
            textAlign: 'right',
            width: '20%',
            render: ({ contributions }) => (
              <Box>
                {
                  contributions.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                }
              </Box>
            )
          },
          { 
            accessor: 'distributions',
            title: 'Distributions',
            textAlign: 'right',
            width: '20%',
            render: ({ distributions }) => (
              <Box>
                {
                  distributions.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  })
                }
              </Box>
            )
          },
        ]}
      />
    </Box>
  )
}