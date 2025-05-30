// Libraries
import React, { useEffect, useRef, useState } from 'react';

// Interfaces
import { IPageProps } from 'interfaces';
import { AfterNavigateAwayData, WorkloadClientAPI } from "@ms-fabric/workload-client";

// Components
import { Chat } from './Chat';
import { AgentInteractions } from './AgentInteractions';
import { ChatInput } from './ChatInput';
import { Box, Group, Loader, ScrollArea, SegmentedControl, Stack, Text } from '@mantine/core';
import { AgentsSplashScreen } from './AgentsSplashScreen';

// Hooks
import { useCopilot } from 'hooks/useCopilot';
import { useShallow } from 'zustand/react/shallow';
import { useWebSocketContext } from 'providers/WebSocketProvider';

// Styles
import classes from './Copilot.module.css';


const useCopilotSelector = (state: any) => ({
  isThinking: state.isThinking,
  isConnected: state.isConnected,
  connectionStatus: state.connectionStatus,
  chatResponses: state.chatResponses,
  copilotActivities: state.copilotActivities,
});

interface Props extends IPageProps {
  workloadClient: WorkloadClientAPI;
  sendPortfolioId: boolean;
  showAgentInteractions: boolean;
  sampleQuestions: string[];
  copilotName: string;
};

export function Copilot({ workloadClient, sendPortfolioId, showAgentInteractions, sampleQuestions, copilotName }: Props) {
  const [ view, setView ] = useState('chat');
  const viewport = useRef<HTMLDivElement>(null);
  const { isThinking, isConnected, connectionStatus, chatResponses, copilotActivities } = useCopilot(useShallow(useCopilotSelector));
  const { disconnect, reconnect } = useWebSocketContext();
  
  async function callNavigationAfterNavigateAway() {
    const callback: (event: AfterNavigateAwayData) => Promise<unknown> =
      async (event: AfterNavigateAwayData): Promise<unknown> => {
        if (event.nextUrl.includes('/workloads/Org.WorkloadSample/')) {
          reconnect();
        } else {
          disconnect();
        }
        return;
      }
  
    await workloadClient.navigation.onAfterNavigateAway(callback);
  }
  
  useEffect(() => {
    callNavigationAfterNavigateAway();
  }, []);
  
  const scrollToBottom = () => {
    viewport.current?.scrollTo({ top: viewport.current!.scrollHeight - 100, behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (chatResponses.length > 1)
      scrollToBottom();
  }, [chatResponses, isThinking]);

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <div>
          <Text className={classes.copilotTitleName}>{copilotName}</Text>
            {
              (!isConnected && connectionStatus) ? 
                <Group gap="xs">
                  {(connectionStatus === 'Connecting...' || connectionStatus === 'Disconnecting...') &&
                    <Loader type="dots" color="#117865" size="xs" />
                  }
                  <Text className={classes.copilotSubtitle}>{connectionStatus}</Text>
                </Group>
              : 
                <Text className={classes.copilotSubtitle}>Chat</Text>
            }
        </div>
        {showAgentInteractions &&
          <Group justify="flex-end">
            <SegmentedControl
              radius="xs"
              size="xs"
              color="#117865"
              value={view}
              onChange={setView}
              data={[
                { value: 'chat', label: 'Chat' },
                { value: 'agents', label: 'Agent Interactions' },
              ]}
            />
          </Group>
        }
      </Group>
      <Box style={{ width: '100%', height: '100%' }} mx="xs" px={0} my="xs">
        <div>
          <div className={classes.copilotContainer}>
            <div className={classes.copilotChatContainer}>
              <Stack className={classes.copilotChat} gap={0}>
                <ScrollArea viewportRef={viewport} h="600px" classNames={{ viewport: classes.copilotScrollAreaViewport }}>
                  {
                    view === 'chat' ? <Chat copilotName={copilotName} sampleQuestions={sampleQuestions} />
                    : copilotActivities.length > 0 ? <AgentInteractions /> 
                    : <AgentsSplashScreen copilotName={copilotName} />
                  }
                </ScrollArea>
              </Stack>
            </div>
          </div>
          <ChatInput />
        </div>
      </Box>
    </Box>
  );
};