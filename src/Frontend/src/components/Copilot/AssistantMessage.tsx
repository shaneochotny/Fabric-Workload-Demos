// Libraries
import React from 'react';

// Interfaces
import { ICopilotMessage } from 'interfaces';

// Components
import { Avatar, Flex, Group, Image, Stack, Text } from '@mantine/core';
import { Markdown } from './Markdown';

// Styles & Images
import classes from './Copilot.module.css';


interface Properties {
  chatResponse: ICopilotMessage;
};

export function AssistantMessage({ chatResponse }: Properties) {
  return (
    <Flex
      className={classes.copilotMessageContainer}
      direction="column"
    >
      <Stack w="100%" gap={0} p="md">
        <Group justify="center">
        <Avatar size={38}><Image src="../../../assets/Copilot/CopilotLogo.svg" h={16} w={16} /></Avatar>
          <Text className={classes.copilotMessageTitle}>
            Copilot
          </Text>
        </Group>
        
        <Markdown content={chatResponse.reply} />
      </Stack>
    </Flex>
  );
};