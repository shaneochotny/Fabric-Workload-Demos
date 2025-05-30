/**
 * User & Copilot messages
 */
export interface ICopilotMessage {
  role?: string;
  content?: string;
  reply?: string;
  client_id?: number;
  sender_agent?: string;
};

/**
 * Activity messages sent while agents are performing tasks
 */
export interface ICopilotActivity {
  message_type: string;
  agent_name: string;
  content: string;
  sender_agent?: string;
  data_source?: string;
  agent_type?: string;
};

/**
 * An array of Copilot activities sorted by the agent name [key: string]. Used 
 * for displaying the Agent Interactions graph.
 */
export interface ICopilotInteractionsAgents {
  [key: string]: {
    source_agent?: string;
    messages: string[];
    agent_type?: string;
    data_source?: string;
  }
};

/**
 * An array of edge connections for Copilot activities. Used 
 * for displaying the Agent Interactions graph.
 */
export interface ICopilotInteractionsEdges {
  id: string;
  source: string;
  target: string;
};