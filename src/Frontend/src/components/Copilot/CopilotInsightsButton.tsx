// Libraries
import React from 'react';

// Interfaces
import { AccessToken } from '@ms-fabric/workload-client';

// Components
import { ActionIcon, Image, Tooltip } from '@mantine/core';

// Hooks
import { workloadClient} from 'lib/workloadClient';
import { useWebSocketContext } from 'providers/WebSocketProvider';


interface ICopilotInsightsButtonProps {
  content: string;
};

export function CopilotInsightsButton({ content }: ICopilotInsightsButtonProps) {
  const { sendMessage } = useWebSocketContext();
  
  async function callAuthAcquireAccessToken(): Promise<AccessToken> {
    return workloadClient.auth.acquireAccessToken({
      additionalScopesToConsent: null,
      claimsForConditionalAccessPolicy: null
    });
  };

  async function submitUserMessage() {
     let access_token = await callAuthAcquireAccessToken();
     sendMessage(content, 1, access_token.token);
  };

  return (
    <Tooltip label="Copilot Insights">
      <ActionIcon 
        variant="light" 
        color="rgba(150, 150, 150, 1)"
        size="lg"
        onClick={() => submitUserMessage()}
      >
        <Image src="../../../assets/Copilot/CopilotLogo.svg" h={18} w={18} />
      </ActionIcon>
    </Tooltip>
  )
};