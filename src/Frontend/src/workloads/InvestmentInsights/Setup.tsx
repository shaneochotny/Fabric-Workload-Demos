// Libraries
import React, { useState } from 'react';

// Components
import { Stack } from '@fluentui/react';
import { Button, Flex, Grid, Group, Image, Stepper, Text, TextInput, Title } from '@mantine/core';

// APIs
import { GetEventhouse, GetKQLDatabase } from 'apis/Eventhouse';
import { GetWorkloadSettingsLakehouse, CreateWorkloadSettingsLakehouse, CreateInvestmentInsightsEventhouse, ValidateInvestmentInsightsPolygonAPIKey, CreateInvestmentInsightsPipeline } from 'apis/Workload';

// Hooks
import { useQuery, useMutation, useQueryClient, skipToken } from '@tanstack/react-query';

// Interfaces
import { IEventhouse, IKQLDatabase, ILakehouse, IPageProps } from 'interfaces';
import {
  ItemPayload,
  WorkloadItem,
} from 'models/SampleWorkloadModel';

// Styles & Images
import classes from './Styles.module.css';

import { callErrorHandlingOpenDialog } from 'controller/SampleWorkloadController';


interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
}

export function Setup({ itemDetails, workloadClient }: Props) {
  const queryClient = useQueryClient();
  const [active, setActive] = useState(0);
  const nextStep = () => setActive((current) => (current < 5 ? current + 1 : current));
  const [isCreatingSettingsLakehouse, setIsCreatingSettingsLakehouse] = useState(false);
  const [isCreatingEventhouse, setIsCreatingEventhouse] = useState(false);
  const [isValidatingPolygonAPIKey, setIsValidatingPolygonAPIKey] = useState(false);
  const [isValidatedPolygonAPIKey, setIsValidatedPolygonAPIKey] = useState(false);
  const [isCreatingPipeline, setIsCreatingPipeline] = useState(false);
  const [polygonAPIKey, setPolygonAPIKey] = useState('');

  const { data: lakehouse } = useQuery<ILakehouse>({
    queryKey: ['SettingsLakehouse', itemDetails?.workspaceId],
    queryFn: itemDetails?.workspaceId ? () => GetWorkloadSettingsLakehouse(workloadClient, itemDetails?.workspaceId) : skipToken,
  });

  const { data: eventhouse } = useQuery<IEventhouse>({
    queryKey: ['Eventhouse', itemDetails?.workspaceId],
    queryFn: itemDetails?.workspaceId ? () => GetEventhouse(workloadClient, itemDetails?.workspaceId, null, process.env.INVESTMENTINSIGHTS_DEFAULT_DATABASE_NAME) : skipToken,
  });

  const { data: kqlDatabase } = useQuery<IKQLDatabase>({
    queryKey: ['KQLDatabase', itemDetails?.workspaceId],
    queryFn: itemDetails?.workspaceId ? () => GetKQLDatabase(workloadClient, itemDetails?.workspaceId, null, process.env.INVESTMENTINSIGHTS_DEFAULT_DATABASE_NAME) : skipToken,
  });
  
  const createSettingsLakehouse = useMutation({
    mutationFn: () => CreateWorkloadSettingsLakehouse(workloadClient, itemDetails?.workspaceId),
    onMutate: () => setIsCreatingSettingsLakehouse(true),
    onSettled: () => setIsCreatingSettingsLakehouse(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['SettingsLakehouse', itemDetails?.workspaceId] });
      nextStep();
    },
    onError: (error) => {
      callErrorHandlingOpenDialog(error.message, error.name, "400", error.stack, null, workloadClient);
    },
  });
  
  const createEventhouse = useMutation({
    mutationFn: () => CreateInvestmentInsightsEventhouse(workloadClient, itemDetails?.workspaceId),
    onMutate: () => setIsCreatingEventhouse(true),
    onSettled: () => setIsCreatingEventhouse(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Eventhouse', itemDetails?.workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['KQLDatabase', itemDetails?.workspaceId] });
      nextStep();
    },
    onError: (error) => callErrorHandlingOpenDialog(error.message, error.name, "400", error.stack, null, workloadClient),
  });
  
  const validatePolygonAPIKey = useMutation({
    mutationFn: () => ValidateInvestmentInsightsPolygonAPIKey(workloadClient, itemDetails?.workspaceId, polygonAPIKey),
    onMutate: () => setIsValidatingPolygonAPIKey(true),
    onSettled: () => setIsValidatingPolygonAPIKey(false),
    onSuccess: () => {
      setIsValidatedPolygonAPIKey(true);
      createPipeline.mutate();
    },
    onError: (error) => callErrorHandlingOpenDialog(error.message, error.name, "400", error.stack, null, workloadClient),
  });
  
  const createPipeline = useMutation({
    mutationFn: () => CreateInvestmentInsightsPipeline(workloadClient, itemDetails?.workspaceId, polygonAPIKey),
    onMutate: () => setIsCreatingPipeline(true),
    onSettled: () => setIsCreatingPipeline(false),
    onSuccess: () => {
      nextStep();
    },
    onError: (error) => callErrorHandlingOpenDialog(error.message, error.name, "400", error.stack, null, workloadClient),
  });

  async function createLakehouseItems() {
    if (!lakehouse?.id) {
      await createSettingsLakehouse.mutateAsync();
      return;
    } 

    nextStep();
  }

  async function createEventhouseItems() {
    if (!eventhouse?.id || !kqlDatabase?.id) {
      await createEventhouse.mutateAsync();
      return;
    } 

    nextStep();
  }

  async function validatePolygonAPIKeySubmit() {
    if (polygonAPIKey) {
      await validatePolygonAPIKey.mutateAsync();
    }

    if (polygonAPIKey && isValidatedPolygonAPIKey) {
      nextStep();
    }
  }

  return (
    <Stack className="editor">
      <Stack className="main">
        <Flex
          h="90vh"
          w="100%"
          mih={50}
          gap="md"
          justify="center"
          align="center"
          direction="column"
          wrap="wrap"
        >
              <Grid maw={900}>
                <Grid.Col span={9}>
                  <Title className={classes.title}>Investment Insights</Title>
                  <Text fw={500} fz="lg" mb={5}>
                    {active === 0 && "About"}
                    {active === 1 && "Create a Lakehouse for Saving Settings"}
                    {active === 2 && "Create an Eventhouse for Portfolio & Market Data"}
                    {active === 3 && "Create a Pipeline for Polygon.io API"}
                    {active === 4 && "Validate Polygon.io API key"}
                    {active === 5 && "Validate Copilot API key"}
                  </Text>

                  {active === 0 &&
                    <>
                      <Text fz="sm">
                        Investment Insights is a ficticious application for a financial advisor to review client portfolios.
                      </Text>
                    </>
                  }

                  {active === 1 &&
                    <>
                      <Text fz="sm">
                        Settings are stored in a <b>WorkloadSettings</b> Lakehouse to minimize dependencies for the application. Normally, these settings would be stored in a database.
                      </Text>
                      {(lakehouse && lakehouse.id) && <Text fz="sm" mt="sm">The WorkloadSettings Lakehouse has already been created. Click Next to continue.</Text>}
                    </>
                  }

                  {active === 2 &&
                    <>
                      <Text fz="sm">
                        Client portfolio and market data is stored in a <b>InvestmentInsights</b> Eventhouse.
                      </Text>
                      {(kqlDatabase && kqlDatabase.id) && <Text fz="sm" mt="sm">The InvestmentInsights Eventhouse has already been created. Click Next to continue.</Text>}
                    </>
                  }

                  {active === 3 &&
                    <>
                      <Text fz="sm">
                        A Pipeline is used to retrieve daily market data from Polygon.io. After you create a free account at <a href="https://polygon.io" target="_blank" rel="noreferrer">Polygon.io</a>, 
                        provide the API key below.
                      </Text>
                    </>
                  }
              </Grid.Col>
              <Grid.Col span={3}>
                <Image src="../../assets/InvestmentInsights.png" className={classes.image} />
              </Grid.Col>
              <Grid.Col span={12}>
                {active === 0 &&
                  <Group mt="xl" w="100%">
                    <Button variant="filled" color="#117865" onClick={nextStep}>Next</Button>
                  </Group>
                }

                {active === 1 &&
                  <Group mt="xl" w="100%">
                    <Button variant="filled" color="#117865" onClick={() => createLakehouseItems()} disabled={isCreatingSettingsLakehouse}>{!lakehouse?.id ? 'Create' : 'Next'}</Button>
                  </Group>
                }

                {active === 2 &&
                  <Group mt="xl" w="100%">
                    <Button variant="filled" color="#117865" onClick={() => createEventhouseItems()} disabled={isCreatingEventhouse}>{(!eventhouse?.id || !kqlDatabase?.id) ? 'Create' : 'Next'}</Button>
                  </Group>
                }

                {active === 3 &&
                  <Group mt="xl" w="100%">
                    <TextInput 
                      value={polygonAPIKey} 
                      onChange={(event) => setPolygonAPIKey(event.currentTarget.value)} 
                      w={300} 
                      placeholder="Polygon.io API Key (i.e. 3e3_cEf392iwBgZLLiixjUevTfhL_4qt)" 
                      disabled={isValidatedPolygonAPIKey || isValidatedPolygonAPIKey || isCreatingPipeline}
                    />
                    <Button variant="filled" color="#117865" onClick={() => validatePolygonAPIKeySubmit()} disabled={isValidatingPolygonAPIKey || isCreatingPipeline}>{!isValidatedPolygonAPIKey ? 'Create' : 'Next'}</Button>
                  </Group>
                }
              </Grid.Col>
              <Grid.Col span={12} mt="xl">
                <Stepper active={active} onStepClick={setActive} color="#117865" size="sm">
                  <Stepper.Step label="About" description="Investment Insights" />
                  <Stepper.Step label="Step 1" description="Create Lakehouse" loading={isCreatingSettingsLakehouse} />
                  <Stepper.Step label="Step 2" description="Create Eventhouse" loading={isCreatingEventhouse} />
                  <Stepper.Step label="Step 3" description="Create Pipeline" loading={isValidatingPolygonAPIKey || isCreatingPipeline} />
                  <Stepper.Step label="Step 4" description="Advisor Copilot" />
                </Stepper>
              </Grid.Col>
            </Grid>
        </Flex>
      </Stack>
    </Stack>
  )
}