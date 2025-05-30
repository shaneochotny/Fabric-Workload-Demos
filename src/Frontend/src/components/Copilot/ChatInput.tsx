// Libraries
import React, { useState } from 'react';

// Interfaces
import { AccessToken } from '@ms-fabric/workload-client';

// Components
import { Container, Group, Textarea, Tooltip } from '@mantine/core';
import { Button } from '@fluentui/react-components';

// Hooks
import { workloadClient} from 'lib/workloadClient';
import { useWebSocketContext } from 'providers/WebSocketProvider';
import { useCopilot } from 'hooks/useCopilot';
import { useShallow } from 'zustand/react/shallow';

// Styles
import { ChatSparkleRegular, SendRegular } from '@fluentui/react-icons';
import classes from './Copilot.module.css';


const useCopilotSelector = (state: any) => ({
  isConnected: state.isConnected,
  chatResponses: state.chatResponses,
  clearChatResponses: state.clearChatResponses,
});

export function ChatInput () {
  const { isConnected, chatResponses, clearChatResponses } = useCopilot(useShallow(useCopilotSelector));
  const [ userMessage, setUserMessage ] = useState<string>('');
  const { sendMessage } = useWebSocketContext();
  
  async function callAuthAcquireAccessToken(): Promise<AccessToken> {
    return workloadClient.auth.acquireAccessToken({
      additionalScopesToConsent: null,
      claimsForConditionalAccessPolicy: null
    });
  };

  async function submitUserMessage() {
    let access_token = await callAuthAcquireAccessToken();
    sendMessage(userMessage, 1, access_token.token);
    setUserMessage('');
  };

  return (
    <Container w="100%">
      <Container fluid style={{ padding: 6 }}>
        <Group justify="flex-end" wrap="nowrap" className={classes.copilotUserInput}>
          <Tooltip label="New Chat">
            <Button
              icon={<ChatSparkleRegular />}
              appearance="primary"
              onClick={clearChatResponses}
              disabled={(isConnected && chatResponses.length > 1) ? false : true}
            />
          </Tooltip>
          <Textarea
            variant="unstyled"
            autosize
            maxRows={4}
            w="100%"
            value={userMessage}
            placeholder="Ask a question..."
            onChange={(event) => setUserMessage(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitUserMessage();
              }
            }}
            disabled={isConnected ? false : true}
          />
          <Tooltip label="Send Message">
            <Button
              icon={<SendRegular />}
              appearance="primary"
              onClick={() => submitUserMessage()}
              disabled={!isConnected || userMessage === '' ? true : false}
            />
          </Tooltip>
        </Group>
      </Container>
    </Container>
  );
};