// Libraries
import React from "react";
import moment from 'moment';

// Components
import { Box, Container, Divider, Group, Skeleton, Text } from '@mantine/core';

// APIs
import { GetKQLDatabase, QueryKQLDatabase } from 'apis/Eventhouse';

// Interfaces
import { IKQLDatabase, ICIPClientDetails, IPortfolioStats, IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useQuery, skipToken } from '@tanstack/react-query';


interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function ClientDetails({ itemDetails, workloadClient }: Props) {

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
  
  const { isFetching: clientDetailsIsFetching, data: clientDetails } = useQuery<ICIPClientDetails[]>({
    queryKey: ['ContosoInvestmentPartnersClient', 282738],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `vw_ClientDetails()`, kqlDatabase) : skipToken,
  });
  
  const { data: portfolioValue } = useQuery<IPortfolioStats[]>({
    queryKey: ['ContosoInvestmentPartnersClientPortfolio', 282738],
    queryFn: !kqlDatabaseIsFetching ? () => QueryKQLDatabase(workloadClient, `vw_PortfolioStats()`, kqlDatabase) : skipToken,
    placeholderData: [{ investments: 0, commitment: 0, contributions: 0, distributions: 0 }],
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
          <Text fz="sm" c="dimmed">Customer Since</Text>
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
              {(portfolioValue[0].commitment).toLocaleString(undefined, { 
                  style: 'currency', 
                  currency: 'USD', 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0
              })}
            </Text>
          }
          <Text fz="sm" c="dimmed">Commitment</Text>
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
              {(portfolioValue[0].contributions).toLocaleString(undefined, { 
                  style: 'currency', 
                  currency: 'USD', 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0
              })}
            </Text>
          }
          <Text fz="sm" c="dimmed">Contributions</Text>
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
              {(portfolioValue[0].distributions).toLocaleString(undefined, { 
                  style: 'currency', 
                  currency: 'USD', 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0
              })}
            </Text>
          }
          <Text fz="sm" c="dimmed">Distributions</Text>
        </Box>
        <Divider size="xs" orientation="vertical" />
      </Group>
    </Container>
  )
}