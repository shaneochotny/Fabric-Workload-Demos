// Libraries
import React from "react";
import moment from 'moment';

// Components
import { Box, Container, Divider, Group, Skeleton, Text } from '@mantine/core';

// Interfaces
import { IClientDetails, IKQLDatabase, IPortfolioValue, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';


interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function ClientDetails({ itemDetails, workloadClient }: Props) {
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

  const { isFetching: clientDetailsIsFetching, data: clientDetails } = useQuery<IClientDetails[]>({
    queryKey: ['Client', itemDetails?.workspaceId, 1],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `vw_ClientDetails(${1})`, kqlDatabase) : skipToken,
  });

  const { data: portfolioValue } = useQuery<IPortfolioValue[]>({
    queryKey: ['ClientPortfolio', itemDetails?.workspaceId, 1],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `vw_PortfolioValue(${1})`, kqlDatabase) : skipToken,
    placeholderData: [{ current_value: 0 }],
    refetchInterval: 3000,
  });

  return (
    <Container size="xl" mb="sm" fluid>
      <Group wrap="nowrap" justify="space-between" gap="xs" align="top">
        <Box>
          {clientDetailsIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Text fz="md" fw={500}>{clientDetails[0].name}</Text>
          }
          <Text fz="sm" c="dimmed">Client</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
        <Box>
          {clientDetailsIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Text fz="md" fw={500}>{clientDetails[0].employer}</Text>
          }
          <Text fz="sm" c="dimmed">Employer</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
        <Box>
          {clientDetailsIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Text fz="md" fw={500}>{clientDetails[0].occupation}</Text>
          }
          <Text fz="sm" c="dimmed">Occupation</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
        <Box>
          {clientDetailsIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Text fz="md" fw={500}>{clientDetails[0].city + ', ' + clientDetails[0].state}</Text>
          }
          <Text fz="sm" c="dimmed">City/State</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
        <Box>
          {clientDetailsIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Text fz="md" fw={500}>{moment(clientDetails[0].client_since).format('MM/DD/YYYY')}</Text>
          }
          <Text fz="sm" c="dimmed">Client Since</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
        <Box>
          {clientDetailsIsFetching ?
            <>
              <Skeleton height={8} mt={2} width={100} radius="xl" />
              <Skeleton height={8} mt={6} mb={4} width={70} radius="xl" />
            </>
            :
            <Text fz="md" fw={500}>
              {(portfolioValue[0].current_value).toLocaleString(undefined, { 
                  style: 'currency', 
                  currency: 'USD', 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0
              })}
            </Text>
          }
          <Text fz="sm" c="dimmed">Portfolio Value</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
      </Group>
    </Container>
  )
}