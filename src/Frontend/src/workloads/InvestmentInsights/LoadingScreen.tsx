// Libraries
import React from "react";

// Components
import { Stack } from "@fluentui/react";
import { Flex, Loader } from '@mantine/core';


export function LoadingScreen() {
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
          <Loader color="#117865" size="lg" />
        </Flex>
      </Stack>
    </Stack>
  )
}