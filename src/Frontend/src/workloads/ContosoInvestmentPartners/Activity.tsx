// Libraries
import React, { useState } from "react";
import moment from 'moment';

// Components
import { Box, Chip, Group, SegmentedControl, Stack, Text } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { CopilotInsightsButton } from 'components/Copilot/CopilotInsightsButton';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Interfaces
import { IKQLDatabase, IInvestmentActivity, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';
import { useUIStore, useShallow } from 'hooks/useContosoInvestmentPartners';

// Styles & Images
import classes from './Styles.module.css';
import { DismissRegular } from '@fluentui/react-icons';


const useUIStoreSelector = (state: any) => ({
  selectedInvestment: state.selectedInvestment,
  setSelectedInvestment: state.setSelectedInvestment,
});

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function Activity({ itemDetails, workloadClient }: Props) {
  const { selectedInvestment, setSelectedInvestment } = useUIStore(useShallow(useUIStoreSelector));
  const [view, setView] = useState('All');

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
  
  const { isFetching, data } = useQuery<IInvestmentActivity[]>({
    queryKey: ['ContosoInvestmentPartnersActivity', view, selectedInvestment],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `vw_TransactionHistory('${view}', '${selectedInvestment}')`, kqlDatabase) : skipToken,
  });

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fz="md" fw={500}>Investment Activity</Text>
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
            value={view}
            onChange={setView}
            data={[
              { value: 'All', label: 'All' },
              { value: 'Contribution', label: 'Contributions' },
              { value: 'Distribution', label: 'Distributions' },
            ]}
            disabled={isFetching}
          />
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
            accessor: 'transaction_date',
            title: 'Date',
            render: ({ transaction_date }) => (
              <Box key={transaction_date}>
                {moment(transaction_date).format("MMMM Do, YYYY")}
              </Box>
            ),
          },
          { 
            accessor: 'property_name',
            title: 'Investment',
            render: ({ investment_name }) => (
              <Box key={investment_name}>
                {investment_name}
                <Text fz="xs" c="dimmed">
                  {investment_name}
                </Text>
              </Box>
            ),
          },
          { 
            accessor: 'type',
            title: 'Activity',
          },
          { 
            accessor: 'description',
            title: 'Description',
          },
          { 
            accessor: 'amount',
            textAlign: 'right',
            render: ({ amount }) => (
              <Text fz="sm" key={amount}>
                {Intl.NumberFormat().format(amount)}
              </Text>
            ),
          },
        ]}
      />
    </Box>
  )
}