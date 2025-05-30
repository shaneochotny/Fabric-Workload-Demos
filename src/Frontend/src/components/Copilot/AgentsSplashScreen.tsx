// Libraries
import React from 'react';

// Components
import { Box, Container, Flex, Stack, Text } from '@mantine/core';
import { Image } from '@fluentui/react-components';

// Styles & Images
import classes from './Copilot.module.css';


interface Properties {
  copilotName: string;
}

export function AgentsSplashScreen ({ copilotName }: Properties) {
  return (
    <Container h="100%" style={{ marginInline: 0 }}>
      <Flex
        gap="md"
        justify="center"
        align="center"
        direction="column"
        wrap="nowrap"
        h="100%"
      >
        <Container className={classes.sampleQuestionsContainer} fluid>
          <Stack align="center" justify="center" gap="xs" mt="lg" mb="xl">
            <Box className="card">
              <Image src="../../../assets/Copilot/CopilotAgents.svg" height={180} width={180} />
            </Box>
            <Text className={classes.sampleQuestionsContainerTitle}>Agent Interactions</Text>
          </Stack>
          <Flex
            gap="md"
            justify="center"
            align="flex-start"
            direction="row"
            wrap="wrap"
          >
            <Text fz="sm" c="gray.7">
              {copilotName} uses an agentic multi-agent conversational design pattern. You can visualize how 
              the agents converse behind-the-scenes to understand the users question, determine what 
              data may need to be obtained, retrieve and analyze the data, and finally summarize and 
              provide an answer.
            </Text>
          </Flex>
        </Container>
      </Flex>
    </Container>
  );
};