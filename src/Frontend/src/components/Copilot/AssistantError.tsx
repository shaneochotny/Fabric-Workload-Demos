// Libraries
import React from 'react';

// Components
import { Divider, Flex, Stack, Text } from '@mantine/core';

// Styles
import classes from './Copilot.module.css';


interface Properties {
  errorMessage: string;
}

export function AssistantError ({ errorMessage }: Properties) {
  return (
    <Flex
      className={classes.copilotErrorContainer}
      justify="flex-start"
      align="flex-start"
      direction="column"
      wrap="wrap"
    >
      <Stack w="100%">
        <Divider label="ERROR" className={classes.copilotErrorTitle} />
        <Text className={classes.copilotErrorMessage}>
          {errorMessage}
        </Text>
      </Stack>
    </Flex>
  );
};