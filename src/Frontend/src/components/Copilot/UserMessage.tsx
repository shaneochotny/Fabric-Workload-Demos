// Libraries
import React from 'react';

// Components
import { Flex, Stack } from '@mantine/core';
import { Markdown } from './Markdown';

// Styles & Images
import classes from './Copilot.module.css';


interface Properties {
  content: string | undefined;
};

export function UserMessage ({ content }: Properties) {
  return (
    <Flex justify="flex-end" align="flex-end">
      <Stack gap={0} className={classes.copilotUserMessage}>
        <Markdown content={content} />
      </Stack>
    </Flex>
  );
};