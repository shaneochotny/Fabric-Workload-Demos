// Libraries
import React from 'react';

// Components
import { Flex, Group, Stack, Text } from '@mantine/core';
import { CopilotThinkingIcon } from 'assets/Copilot/CopilotThinking';

// Hooks
import { useCopilot } from 'hooks/useCopilot';
import { useShallow } from 'zustand/react/shallow';

// Styles
import classes from './Copilot.module.css';


const useCopilotSelector = (state: any) => ({
  copilotActivities: state.copilotActivities,
});

export function AssistantThinking () {
  const { copilotActivities } = useCopilot(useShallow(useCopilotSelector));

  return (
    <Flex
      className={classes.copilotThinkingContainer}
      justify="flex-start"
      align="flex-start"
      direction="column"
      wrap="wrap"
    >
      <Stack w="100%">
        <Group justify="center">
          <CopilotThinkingIcon />
          <Text className={classes.copilotThinkingTitle}>
            {copilotActivities.length > 0 ? copilotActivities[copilotActivities.length - 1].agent_name + ' AGENT' : 'Copilot'}
          </Text>
        </Group>

        <Text className={classes.copilotThinkingMessage}>
          {copilotActivities.length > 0 && copilotActivities[copilotActivities.length - 1].content}
        </Text>
      </Stack>
    </Flex>
  );
};