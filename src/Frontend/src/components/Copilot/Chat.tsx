// Libraries
import React from 'react';

// Interfaces
import { ICopilotMessage } from 'interfaces';

// Components
import { AssistantMessage } from './AssistantMessage';
import { AssistantThinking } from './AssistantThinking';
import { SplashScreen } from './SplashScreen';
import { UserMessage } from './UserMessage';
import { AssistantError } from './AssistantError';

// Hooks
import { useCopilot } from 'hooks/useCopilot';
import { useShallow } from 'zustand/react/shallow';


const useCopilotSelector = (state: any) => ({
  isThinking: state.isThinking,
  chatResponses: state.chatResponses,
  errorMessage: state.errorMessage,
});

interface Properties {
  copilotName: string;
  sampleQuestions: string[];
};

export function Chat ({ copilotName, sampleQuestions }: Properties) {
  const { isThinking, chatResponses, errorMessage } = useCopilot(useShallow(useCopilotSelector));

  const displayChatResponses = chatResponses.map((chatResponse: ICopilotMessage, index: number) => {
    return (
      chatResponse.role === 'user' ? <UserMessage content={chatResponse.content} key={index} />
      : chatResponse.role === 'assistant' ? <AssistantMessage chatResponse={chatResponse} key={index} />
      : null
    )
  });

  if (chatResponses.length < 1) return <SplashScreen copilotName={copilotName} sampleQuestions={sampleQuestions} />;

  return (
    <>
      {displayChatResponses}
      {isThinking && <AssistantThinking />}
      {errorMessage && <AssistantError errorMessage={errorMessage} />}
    </>
  );
};