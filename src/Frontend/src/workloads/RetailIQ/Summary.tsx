// Libraries
import React from "react";

// Components
import { Box, Group, SegmentedControl, Stack, Text } from '@mantine/core';
import { DataTable } from 'mantine-datatable';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Interfaces
import { IKQLDatabase, IRetailSalesSummary, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';
import { useUIStore, useShallow } from 'hooks/useRetailIQ';

// Styles & Images
import classes from './Styles.module.css';


const useUIStoreSelector = (state: any) => ({
  showBy: state.showBy,
  setShowBy: state.setShowBy,
  storeFilter: state.storeFilter,
  categoryFilter: state.categoryFilter,
  productFilter: state.productFilter,
});

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function Summary({ itemDetails, workloadClient }: Props) {
  const { showBy, setShowBy, storeFilter, categoryFilter, productFilter } = useUIStore(useShallow(useUIStoreSelector));

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
  
  const { isFetching, data: salesData } = useQuery<IRetailSalesSummary[]>({
    queryKey: ['RetailSalesSummary', showBy, storeFilter, categoryFilter, productFilter],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `retail_DetailsSummary("${showBy}", "${storeFilter}", "${categoryFilter}", "${productFilter}")`, kqlDatabase) : skipToken,
    placeholderData: [],
  });

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fz="md" fw={500}>Sales</Text>
          <Text fz="sm" c="dimmed">Last 7 Days</Text>
        </div>
        <Group justify="flex-end">
          <SegmentedControl
            radius="xs"
            size="xs"
            color="#117865"
            value={showBy}
            onChange={setShowBy}
            data={[
              { value: 'StoreName', label: 'Store' },
              { value: 'ProductName', label: 'Product' },
            ]}
          />
        </Group>
      </Group>
      <DataTable
        highlightOnHover
        minHeight={300}
        height={300}
        records={salesData}
        fetching={isFetching && !salesData}
        classNames={{
          table: classes.table,
        }}
        loaderType="oval"
        loaderSize="lg"
        loaderColor="#117865"
        emptyState={
          <Stack align="center" gap="xs">
            <Text c="dimmed" size="xs">
              No Sales
            </Text>
          </Stack>
        }
        columns={[
          {
            accessor: 'name',
            title: showBy === 'StoreName' ? 'Store' : 'Product',
            width: '20%',
            render: ({ name, storeLocation }) => (
              <Box>
                {name}
                {showBy === 'StoreName' &&
                  <Text fz="xs" c="dimmed">
                    {storeLocation}
                  </Text>
                }
              </Box>
            ),
          },
          { 
            accessor: 'revenue',
            title: 'Revenue',
            textAlign: 'right',
            render: ({ revenue }) => (
              <Box>
                {
                  revenue.toLocaleString(undefined, { 
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
            accessor: 'profit',
            title: 'Profit',
            textAlign: 'right',
            render: ({ profit }) => (
              <Box>
                {
                  profit.toLocaleString(undefined, { 
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
            accessor: 'margin',
            textAlign: 'right',
            hidden: showBy !== 'ProductName',
            render: ({ margin }) => (
              <Text fz="sm" key={margin}>
                {margin}%
              </Text>
            ),
          },
          { 
            accessor: 'unitsSold',
            title: 'Units Sold',
            textAlign: 'right',
            render: ({ unitsSold }) => (
              <Text fz="sm" key={unitsSold}>
                {Intl.NumberFormat().format(unitsSold)}
              </Text>
            ),
          },
          { 
            accessor: 'inventoryOnHand',
            title: 'Inventory on Hand',
            textAlign: 'right',
            render: ({ inventoryOnHand }) => (
              <Text fz="sm" key={inventoryOnHand}>
                {Intl.NumberFormat().format(inventoryOnHand)}
              </Text>
            ),
          },
        ]}
      />
    </Box>
  )
}