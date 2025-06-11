// Libraries
import React from "react";

// Components
import { Box, Container, Divider, Group, Select, Skeleton, Text } from '@mantine/core';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Interfaces
import { IKQLDatabase, IRetailStores, IRetailCategories, IRetailProducts, IRetailRevenueStats, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';
import { useUIStore, useShallow } from 'hooks/useRetailIQ';

// Styles & Images
import classes from './Styles.module.css';


const useUIStoreSelector = (state: any) => ({
  storeFilter: state.storeFilter,
  setStoreFilter: state.setStoreFilter,
  categoryFilter: state.categoryFilter,
  setCategoryFilter: state.setCategoryFilter,
  productFilter: state.productFilter,
  setProductFilter: state.setProductFilter,
});

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function Statistics({ itemDetails, workloadClient }: Props) {
  const { storeFilter, setStoreFilter, categoryFilter, setCategoryFilter, productFilter, setProductFilter } = useUIStore(useShallow(useUIStoreSelector));

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
  
  const { isFetching: storesIsFetching, data: stores } = useQuery<IRetailStores[]>({
    queryKey: ['RetailStores'],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `retail_Stores()`, kqlDatabase) : skipToken,
    placeholderData: [],
  });
  
  const { isFetching: categoriesIsFetching, data: categories } = useQuery<IRetailCategories[]>({
    queryKey: ['RetailCategories', productFilter],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `retail_Categories("${productFilter}")`, kqlDatabase) : skipToken,
    placeholderData: [],
  });
  
  const { isFetching: productsIsFetching, data: products } = useQuery<IRetailProducts[]>({
    queryKey: ['RetailProducts', categoryFilter],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `retail_Products("${categoryFilter}")`, kqlDatabase) : skipToken,
    placeholderData: [],
  });
  
  const { isFetching: revenueStatsIsFetching, data: revenueStats } = useQuery<IRetailRevenueStats[]>({
    queryKey: ['RetailRevenueStats', storeFilter, categoryFilter, productFilter],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `retail_RevenueStats("${storeFilter}", "${categoryFilter}", "${productFilter}")`, kqlDatabase) : skipToken,
    placeholderData: [{ revenue: 0, profit: 0, unitsSold: 0, inventoryOnHand: 0 }],
  });

  /* const { isFetching: productsIsFetching, data: products } = useQuery<IRetailProducts[]>({
    queryKey: ['RetailProducts', categoryFilter],
    queryFn: () => QueryKQLDatabase(
      workloadClient, 
      `retail_Products("${categoryFilter}")`,
      {
        id: '43d71a70-46f6-419c-b8b8-8ab8725c67e6',
        displayName: 'Investments',
        workspaceId: 'b77c62ab-ec5e-45d4-bdf0-f5ec79e027fc',
        properties: {
          parentEventhouseItemId: '09df6651-0877-4dfa-89dc-4a58ea703958',
          queryServiceUri: 'https://trd-8vjgwrsxgxvfuazmus.z6.kusto.fabric.microsoft.com',
        },
      }
    ),
    placeholderData: [],
  }); */

  /* const { isFetching: revenueStatsIsFetching, data: revenueStats } = useQuery<IRetailRevenueStats[]>({
    queryKey: ['RetailRevenueStats', storeFilter, categoryFilter, productFilter],
    queryFn: () => QueryKQLDatabase(
      workloadClient, 
      `retail_RevenueStats("${storeFilter}", "${categoryFilter}", "${productFilter}")`,
      {
        id: '43d71a70-46f6-419c-b8b8-8ab8725c67e6',
        displayName: 'Investments',
        workspaceId: 'b77c62ab-ec5e-45d4-bdf0-f5ec79e027fc',
        properties: {
          parentEventhouseItemId: '09df6651-0877-4dfa-89dc-4a58ea703958',
          queryServiceUri: 'https://trd-8vjgwrsxgxvfuazmus.z6.kusto.fabric.microsoft.com',
        },
      }
    ),
    placeholderData: [{ revenue: 0, profit: 0, unitsSold: 0, inventoryOnHand: 0 }],
  }); */

  return (
    <Container size="xl" mb="sm" fluid>
      <Group wrap="nowrap" justify="space-between" gap="xs" align="top">
        <Box>
          {storesIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Select
              data={stores.map((store) => ({ value: store.storeName, label: store.storeName }))}
              defaultValue="All Stores"
              value={storeFilter}
              variant="unstyled"
              allowDeselect={false}
              onChange={setStoreFilter}
              className={classes.filterSelect}
            />
          }
          <Text fz="sm" c="dimmed">Stores</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
        <Box>
          {categoriesIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Select
              data={categories.map((category) => ({ value: category.category, label: category.category }))}
              defaultValue="All Categories"
              value={categoryFilter}
              variant="unstyled"
              allowDeselect={false}
              onChange={setCategoryFilter}
              className={classes.filterSelect}
            />
          }
          <Text fz="sm" c="dimmed">Product Categories</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
        <Box>
          {productsIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Select
              data={products.map((product) => ({ value: product.productName, label: product.productName }))}
              defaultValue="All Products"
              value={productFilter}
              variant="unstyled"
              allowDeselect={false}
              onChange={setProductFilter}
              className={classes.filterSelect}
            />
          }
          <Text fz="sm" c="dimmed">Products</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
        <Box>
          {revenueStatsIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Text className={classes.filterText}>
              {Intl.NumberFormat().format(revenueStats[0].unitsSold)}
            </Text>
          }
          <Text fz="sm" c="dimmed">Units Sold</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
        <Box>
          {revenueStatsIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Text className={classes.filterCurrency}>
            {
              revenueStats[0].revenue.toLocaleString(undefined, { 
                style: 'currency', 
                currency: 'USD', 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2
              })
            }</Text>
          }
          <Text fz="sm" c="dimmed">Revenue</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
        <Box>
          {revenueStatsIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Text className={classes.filterCurrency}>
              {
                revenueStats[0].profit.toLocaleString(undefined, { 
                  style: 'currency', 
                  currency: 'USD', 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2
                })
              }
            </Text>
          }
          <Text fz="sm" c="dimmed">Profit</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
      </Group>
    </Container>
  )
};