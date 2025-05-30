// Libraries
import React, { createContext, FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from "react-use-websocket";

// Interfaces
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/dist/lib/types';
import { ICopilotMessage } from 'interfaces';

// Hooks
import { useCopilot } from 'hooks/useCopilot';


export interface IProviderProps {
  endpoint: string;
  children: ReactNode;
};

export interface IWebsocketContext {
  readyState: ReadyState;
  sendJsonMessage: SendJsonMessage;
  getWebSocket: () => (WebSocketLike | null);
};

const WebSocketContext = createContext(null);

const WebSocketProvider: FC<IProviderProps> = ({ endpoint, children }) => {
  const didUnmount = useRef(false);
  const [connect, setConnect] = useState(true);
  const setIsConnected = useCopilot((state) => state.setIsConnected);
  const setConnectionStatus = useCopilot((state) => state.setConnectionStatus);
  const setIsThinking = useCopilot((state) => state.setIsThinking);
  const addChatResponses = useCopilot((state) => state.addChatResponses);
  const addCopilotActivities = useCopilot((state) => state.addCopilotActivities);
  const clearCopilotActivities = useCopilot((state) => state.clearCopilotActivities);
  const setErrorMessage = useCopilot((state) => state.setErrorMessage);
  
  const { readyState, sendJsonMessage, getWebSocket } = useWebSocket(endpoint, {
      share: false,
      retryOnError: true,
  
      reconnectAttempts: 10,
      reconnectInterval: attemptNumber => {
        console.log('Attempting to reconnect: ', attemptNumber);
         // Exponential backoff
        return Math.min(Math.pow(2, attemptNumber) * 1000, 10000);
      },
  
      heartbeat: {
        message: JSON.stringify({ message_type: 'ping', content: '' }),
        returnMessage: 'pong',
        timeout: 60000,
        interval: 10000,
      },
  
      onMessage(event) {
        try {
          if (event?.data && event?.data !== 'pong') {
            const message = JSON.parse(event.data);
            
            switch (message.message_type) {
              case "response":
                // Final response from Copilot
                let parsedResponse: ICopilotMessage = {
                  reply: message.content,
                  role: 'assistant',
                  sender_agent: message.sender_agent,
                }
                addChatResponses(parsedResponse);
                addCopilotActivities(message);
                setIsThinking(false);
                break;
              case "activity":
                // Activity messages from the agents
                addCopilotActivities(message);
                break;
              case "function":
                // Function call messages from the agents
                addCopilotActivities(message);
                break;
              case "error":
                setErrorMessage(message.content);
                setIsThinking(false);
                break;
            }
          }
        } catch (e) {
          console.error(e);
          setErrorMessage(e);
          setIsThinking(false);
        }
      },
  
      onReconnectStop: () => {
        console.log('Reconnection attempts have stopped');
        setConnect(false);
      },
      onOpen: () => {
        console.log('Websocket connection is open');
        setIsConnected(true);
      },
      onClose: event => {
        console.log('Websocket connection is closed: ', event);
        setIsConnected(false);
      },
      shouldReconnect: closeEvent => {
        if (didUnmount.current) {
          // Component is unmounted, don't reconnect
          setConnect(false);
          return false;
        }
        if (closeEvent.code === 1000) {
          // Normal closure, don't reconnect
          console.log('WebSocket closed normally.');
          setConnect(false);
          return false;
        }
        if (closeEvent.code === 1006) {
          // Unexpected disconnection, attempt to reconnect
          console.log('WebSocket closed abnormally. Reconnecting...');
          return true;
        }
        // Other closures, attempt to reconnect
        console.log('WebSocket closed abnormally. Reconnecting...');
        return true;
      },
    },
    connect
  );

  const reconnect = useCallback(() => setConnect(true), [setConnect]);

  const disconnect = () => {
    const socket = getWebSocket();
    if (socket) {
      socket.close(1000, "User initiated disconnect");
    }
  };
    
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting...',
    [ReadyState.OPEN]: 'Connected',
    [ReadyState.CLOSING]: 'Disconnecting...',
    [ReadyState.CLOSED]: 'Disconnected',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  useEffect(() => {
    setConnectionStatus(connectionStatus);
  }, [connectionStatus]);

  useEffect(() => {
    return () => {
      didUnmount.current = true;
    };
  }, []);

  const sendMessage = (message: string, client_id: number, token: string) => {
    const userMessage = {
      message_type: 'user_message',
      content: message,
      client_id: client_id,
      token: token,
    };

    setIsThinking(true);
    clearCopilotActivities();
    setErrorMessage(null);
    sendJsonMessage(userMessage);

    addChatResponses({
      role: 'user',
      client_id: client_id,
      content: message,
     });
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, disconnect, reconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

const useWebSocketContext = () => {
  const context = React.useContext(WebSocketContext);
  if (!context) {
    console.warn('useWebSocketContext must be used within a WebSocketProvider');
    return {} as IWebsocketContext;
  }
  return context;
};

export { WebSocketProvider, WebSocketContext, useWebSocketContext };