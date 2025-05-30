// Libraries
import React, { memo, useEffect } from 'react';
import dagre from '@dagrejs/dagre';

// Interfaces
import { ICopilotActivity, ICopilotInteractionsAgents, ICopilotInteractionsEdges } from 'interfaces';

// Components
import { Edge, Handle, Position, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';
import { Avatar, Box, Divider, Group, HoverCard, Image, Paper, Stack, Text } from '@mantine/core';

// Hooks
import { useCopilot } from 'hooks/useCopilot';
import { useShallow } from 'zustand/react/shallow';
//import { randomId } from '@mantine/hooks';

// Styles & Images
import { CopilotThinkingIcon } from 'assets/Copilot/CopilotThinking';
import '@xyflow/react/dist/style.css';


const useCopilotSelector = (state: any) => ({
  isThinking: state.isThinking,
  copilotActivities: state.copilotActivities,
});

const getNodeUX = (data: any, isThinking: boolean) => {
  const mappings = [
    {
      condition: () => data.label.includes('function_') && data.data_source.includes('Lakehouse'),
      result: { label: data.data_source, icon: '../../../assets/Copilot/FabricLakehouse.svg', type: 'Retrieval' },
    },
    {
      condition: () => data.label.includes('function_') && data.data_source.includes('Eventhouse'),
      result: { label: data.data_source, icon: '../../../assets/Copilot/FabricEventhouse.svg', type: 'Retrieval' },
    },
    {
      condition: () => data.label.includes('function_'),
      result: { label: 'Retrieval', icon: '../../../assets/Copilot/CopilotFunction.svg', type: 'Retrieval' },
    },
    {
      condition: () => data.label === 'Copilot' && isThinking,
      result: { label: 'Copilot', icon: '../../../assets/Copilot/CopilotLogo.svg', type: 'Agent' },
    },
    {
      condition: () => data.label === 'Copilot' && !isThinking,
      result: { label: 'Copilot', icon: '../../../assets/Copilot/CopilotLogo.svg', type: 'Agent' },
    },
    {
      condition: () => data.label === 'You',
      result: { label: 'You', icon: '../../../assets/Copilot/CopilotUser.svg', type: 'Agent' },
    },
    {
      condition: () => data.label === 'Planner',
      result: { label: 'Planner', icon: '../../../assets/Copilot/CopilotPlanner.svg', type: 'Agent' },
    },
    {
      condition: () => data.label === 'Manager',
      result: { label: 'Manager', icon: '../../../assets/Copilot/CopilotManager.svg', type: 'Agent' },
    },
    {
      condition: () => data.agent_type === 'AI Foundry Agent',
      result: { label: 'AI Foundry Agent', icon: '../../../assets/Copilot/AIFoundry.svg', type: 'Agent' },
    },
    {
      condition: () => data.agent_type === 'Fabric Data Agent',
      result: { label: 'Fabric Data Agent', icon: '../../../assets/Copilot/FabricDataAgent.svg', type: 'Agent' },
    },
  ];

  const match = mappings.find((mapping) => mapping.condition());
  return match ? match.result : { label: data.label, icon: '../../../assets/Copilot/CopilotAgent.svg', type: 'Agent' };
};

const agentNode = memo(({ data, isConnectable }: any) => {
  const { isThinking } = useCopilot(useShallow(useCopilotSelector));
  const nodeProperties = getNodeUX(data, isThinking);

  return (
    <>
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ visibility: 'hidden' }}
      />
      <HoverCard width={340} shadow="md" disabled={data.messages?.length === 0}>
        <HoverCard.Target>
          <Paper shadow="xs" h={128} w={128}>
            <Stack
              align="center"
              justify="center"
              gap="xs"
              h="100%"
            >
              {nodeProperties.label === 'Copilot' && isThinking ? (
                <CopilotThinkingIcon height={48} width={48} />
              ) : (
                <Image src={nodeProperties.icon} h={48} w={48} />
              )}
              <Text size="sm" ta="center" c="gray.7">{nodeProperties.label}</Text>
            </Stack>
          </Paper>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Stack
            align="center"
            justify="center"
            gap="sm"
            h="100%"
          >
            <Box w="100%">
              <Group>
                <Avatar
                  src={nodeProperties.icon}
                  size="sm"
                  radius="xl"
                />
                <div>
                  <Text size="sm">{nodeProperties.label}</Text>
                  <Text size="xs" c="dimmed">
                    {nodeProperties.type}
                  </Text>
                </div>
              </Group>
              {data.messages?.map((content: string, index: number) => (
                <Box w="100%" key={index}>
                  <Text pt="sm" size="xs" c="gray.7" style={{ overflowWrap: 'break-word' }}>
                    {content.length > 200 ? content.substring(0, 200) + '...' : content}
                  </Text>
                  {index < data.messages.length - 1 && <Divider w="100%" mt="sm" />}
                </Box>
              ))}
            </Box>
          </Stack>
        </HoverCard.Dropdown>
      </HoverCard>
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ visibility: 'hidden' }}
      />
    </>
  );
});

const nodeTypes = {
  agentNode: agentNode,
};

const AgentFlow = () => {
  const { copilotActivities } = useCopilot(useShallow(useCopilotSelector));
  const proOptions = { hideAttribution: true };
  const { fitView } = useReactFlow();
  const initialNodes: any[] = [];
  const initialEdges: Edge[] = [];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const nodeWidth = 128;
  const nodeHeight = 128;

  // Use dagre to automatically layout the nodes
  const getLayoutedElements = (nodes: any, edges: Edge[]) => {
    dagreGraph.setGraph({ rankdir: 'TB' });
   
    nodes.forEach((node: any) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
   
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
   
    dagre.layout(dagreGraph);
   
    const newNodes = nodes.map((node: any) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const newNode = {
        ...node,
        type: 'agentNode',
        data: { 
          label: node.data.label,
          messages: node.data.messages,
          source_agent: node.data.source_agent,
          agent_type: node.data.agent_type,
          data_source: node.data.data_source,
        },
        targetPosition: 'top',
        sourcePosition: 'bottom',
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
   
      return newNode;
    });
   
    return { nodes: newNodes, edges };
  };

  // Compute the nodes and edges when copilotActivities changes
  useEffect(() => {
    // Crate an array of edge connections for Copilot activities
    const agentInteractions: ICopilotInteractionsEdges[] = copilotActivities.map((activity: ICopilotActivity) => ({
      id: `${activity.sender_agent}-${activity.agent_name}`,
      source: activity.sender_agent,
      target: activity.agent_name,
    }));
  
    // Remove duplicate edges
    let distinctEdges = agentInteractions.filter((agentInteraction, index, self) => 
      index === self.findIndex((aI) => aI.source === agentInteraction.source && aI.target === agentInteraction.target)
    );

    // Iterate over all the Agent Activity messages and create an array of Copilot activities 
    // sorted by the agent name [key: string]
    const distinctAgents: ICopilotInteractionsAgents = {};
    distinctAgents['Copilot'] = { messages: [] };
    for (let activity of copilotActivities) {
      // Add the current agent to the distinctAgents object if it doesn't exist
      if (!distinctAgents[activity.agent_name]) {
        distinctAgents[activity.agent_name] = {
          messages: [],
          agent_type: activity.agent_type,
        };
      }

      // Add the message to the agent's messages array
      distinctAgents[activity.agent_name].messages.push(activity.content);

      if (activity.message_type === 'response') {
        distinctAgents['You'] = {
          messages: []
        };

        distinctEdges.push({
          id: `${activity.agent_name}-You`,
          source: activity.agent_name,
          target: 'You',
        });
      }

      // Capture function calls as their own interaction nodes
      if (activity.message_type === 'function') {
        // Generate a node name of function_[agent_name]_[data_source] so that each of the agent's tools 
        // is a unique node in the graph, but multiple executions of the same tool don't create new nodes.
        // Instead, the output from multiple executions of the same tool will appear in the hover card.
        const functionName = 'function_' + activity.agent_name + '_' + activity.data_source;

        if (!distinctAgents[functionName]) {
          distinctAgents[functionName] = {
            messages: [],
            source_agent: activity.agent_name,
            agent_type: activity.agent_type,
            data_source: activity.data_source,
          };

          // Create the edges between the function call nodes and their parent agent nodes
          distinctEdges.push({
            id: `${activity.agent_name}-${functionName}`,
            source: activity.agent_name,
            target: functionName,
          });
        }

        // Add the message to the functions's messages array
        distinctAgents[functionName].messages.push(activity.content);
      }

      // Capture function calls as their own interaction nodes
      /*if (activity.message_type === 'function') {
        const functionName = 'function_' + randomId();
        console.log(activity);
        distinctAgents[functionName] = {
          source_agent: activity.agent_name,
          messages: [activity.content],
          agent_type: activity.agent_type,
          data_source: activity.data_source,
        };

        // Create the edges between the function call nodes and their parent agent nodes
        distinctEdges.push({
          id: `${activity.agent_name}-${functionName}`,
          source: activity.agent_name,
          target: functionName,
        });
      }*/
    };

    // Pivot the distinctAgents object into an array of nodes expected by React Flow
    const nodes: any[] = [];
    Object.entries(distinctAgents).forEach(([agentName, data]) => {
      nodes.push({
        id: agentName,
        data: { 
          label: agentName,
          messages: data.messages,
          source_agent: data.source_agent,
          agent_type: data.agent_type,
          data_source: data.data_source,
        }
      });
    });

    // Use dagre to automatically layout the nodes
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, distinctEdges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [copilotActivities]);

  // Fit the view when agent nodes are added
  useEffect(() => {
    setTimeout(() => {
      fitView({ duration: 800 });
    }, 5);
  }, [fitView, nodes]);

  return (
    <ReactFlow 
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      proOptions={proOptions}
      nodesDraggable={false}
      edgesFocusable={false}
      nodesConnectable={false}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      maxZoom={1.0}
      fitView
    />
  );
};

export function AgentInteractions () {
  return (
    <Box>
      <ReactFlowProvider>
        <AgentFlow /> 
      </ReactFlowProvider>
    </Box>
  );
};