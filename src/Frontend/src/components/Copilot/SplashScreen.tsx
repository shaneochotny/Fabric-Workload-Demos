// Libraries
import React from 'react';

// Interfaces
import { AccessToken } from '@ms-fabric/workload-client';

// Components
import { Box, Card, Container, Flex, Image, Stack, Text } from '@mantine/core';
import { Markdown } from './Markdown';

// Hooks
import { workloadClient } from 'lib/workloadClient';
import { useWebSocketContext } from 'providers/WebSocketProvider';
import { useCopilot } from 'hooks/useCopilot';
import { useShallow } from 'zustand/react/shallow';

// Styles & Images
import classes from './Copilot.module.css';


const useCopilotSelector = (state: any) => ({
  isConnected: state.isConnected,
});

interface Props {
  copilotName: string;
  sampleQuestions: string[];
};

export function SplashScreen ({ copilotName, sampleQuestions }: Props) {
  const { isConnected } = useCopilot(useShallow(useCopilotSelector));
  const { sendMessage } = useWebSocketContext();

  async function callAuthAcquireAccessToken(): Promise<AccessToken> {
    return workloadClient.auth.acquireAccessToken({
      additionalScopesToConsent: null,
      claimsForConditionalAccessPolicy: null
    });
  };

  async function submitMessage(sampleQuestion: string) {
    if (!isConnected) return;
     let access_token = await callAuthAcquireAccessToken();
     sendMessage(sampleQuestion, 1, access_token.token);
  };

  const renderSampleQuestions = sampleQuestions.filter((q: any) => q !== '').map((question: string, index: number) => 
    <Card
      key={index}
      onClick={() => submitMessage(question)}
      className={classes.sampleQuestion}
    >
      <Markdown content={question} />
    </Card>
  );

  const SampleQuestionsContainer = () => (
    <Container className={classes.sampleQuestionsContainer} fluid>
      <Stack align="center" justify="center" gap="xs" mt="lg" mb="xl">
        <Box className="card">
          <Image src="../../../assets/Copilot/CopilotLogo.svg" h={100} w={100} />
        </Box>
        <Text className={classes.sampleQuestionsContainerTitle}>{copilotName}</Text>
      </Stack>
      <Flex
        gap="md"
        justify="center"
        align="flex-start"
        direction="row"
        wrap="wrap"
      >
        {renderSampleQuestions}
      </Flex>
    </Container>
  );

  return (
    <Container style={{ marginInline: 0 }}>
      <Flex
        gap="md"
        justify="center"
        align="center"
        direction="column"
        wrap="nowrap"
      >
        {sampleQuestions.filter((q: any) => q !== '').length > 0 && <SampleQuestionsContainer />}
      </Flex>
    </Container>
  );
};