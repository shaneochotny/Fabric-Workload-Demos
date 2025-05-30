// Libraries
import React from "react";

// Components
import { Box, Group, Stack, Text } from '@mantine/core';
import { DataTable } from 'mantine-datatable';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Interfaces
import { IKQLDatabase, IRetailSalesDetails, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';
import { useUIStore, useShallow } from 'hooks/useRetailIQ';

// Styles
import classes from './Styles.module.css';


const useUIStoreSelector = (state: any) => ({
  storeFilter: state.storeFilter,
  categoryFilter: state.categoryFilter,
  productFilter: state.productFilter,
});

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function Details({ itemDetails, workloadClient }: Props) {
  const { storeFilter, categoryFilter, productFilter } = useUIStore(useShallow(useUIStoreSelector));

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
  
  const { isFetching, data } = useQuery<IRetailSalesDetails[]>({
    queryKey: ['RetailSalesDetails', storeFilter, categoryFilter, productFilter],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `retail_Details("${storeFilter}", "${categoryFilter}", "${productFilter}")`, kqlDatabase) : skipToken,
    placeholderData: [],
  });

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fz="md" fw={500}>Sales Details</Text>
          <Text fz="sm" c="dimmed">Last 7 Days</Text>
        </div>
      </Group>
      <DataTable
        highlightOnHover
        minHeight={300}
        height={300}
        records={data}
        fetching={isFetching && !data}
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
        columns={[,
          {
            accessor: 'storeName',
            title: 'Store',
          },
          { 
            accessor: 'productName',
            title: 'Product',
          },
          { 
            accessor: 'sku',
            title: 'SKU',
          },
          { 
            accessor: 'category',
            title: 'Category',
          },
          { 
            accessor: 'revenue',
            textAlign: 'right',
            render: ({ revenue }) => (
              <Text fz="sm" key={revenue}>
                {
                  revenue.toLocaleString(undefined, { 
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
            accessor: 'profit',
            textAlign: 'right',
            render: ({ profit }) => (
              <Text fz="sm" key={profit}>
                {
                  profit.toLocaleString(undefined, { 
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
            accessor: 'margin',
            textAlign: 'right',
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