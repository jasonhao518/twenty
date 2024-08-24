import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
} from '@/workflow/types/WorkflowDiagram';
import { MarkerType } from '@xyflow/react';
import { v4 } from 'uuid';

export const generateWorkflowDiagram = ({
  trigger,
  steps,
}: {
  trigger: WorkflowTrigger;
  steps: Array<WorkflowStep>;
}): WorkflowDiagram => {
  const nodes: Array<WorkflowDiagramNode> = [];
  const edges: Array<WorkflowDiagramEdge> = [];

  // Helper function to generate nodes and edges recursively
  const processNode = (
    step: WorkflowStep,
    parentNodeId: string,
    xPos: number,
    yPos: number,
  ) => {
    const nodeId = v4();
    nodes.push({
      id: nodeId,
      data: {
        nodeType: 'action',
        label: step.name,
      },
      position: {
        x: xPos,
        y: yPos,
      },
    });

    // Create an edge from the parent node to this node
    edges.push({
      id: v4(),
      source: parentNodeId,
      target: nodeId,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    });

    // Recursively generate flow for the next action if it exists
    if (step.type !== 'CODE_ACTION') {
      // processNode(action.nextAction, nodeId, xPos + 150, yPos + 100);

      throw new Error('Other types as code actions are not supported yet.');
    }

    return nodeId;
  };

  // Start with the trigger node
  const triggerNodeId = v4();
  nodes.push({
    id: triggerNodeId,
    data: {
      nodeType: 'trigger',
      label: trigger.settings.eventName,
    },
    position: {
      x: 0,
      y: 0,
    },
  });

  let lastStepId = triggerNodeId;

  for (const step of steps) {
    lastStepId = processNode(step, lastStepId, 150, 100);
  }

  return {
    nodes,
    edges,
  };
};
