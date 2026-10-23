/**
 * Mobility-Aware Dijkstra Routing Engine with Landmark Guidance
 * Adheres strictly to the Zero-Stairs Invariant Law:
 * - When avoidStairs === true, stair edges are 100% excluded.
 * - When lift is out of service, safely redirects to Ramp or returns NO_ACCESSIBLE_ROUTE.
 * - Resolves room coordinates for SVG map path rendering.
 */

export function calculateRoute(graph, startId, targetId, options = {}) {
  const {
    avoidStairs = true,
    liftsState = {},
    language = 'ta'
  } = options;

  if (!graph || !graph.nodes || !graph.edges) {
    return { success: false, code: 'INVALID_GRAPH', message: 'Graph is missing or incomplete' };
  }

  // Node ID alias dictionary for backwards compatibility
  const ALIASES = {
    'OPD_104': 'OPD_ROOM_5',
    'OPD_105': 'OPD_ROOM_6',
    'OPD_208': 'WARD_4',
    'LAB_F1': 'LAB_G'
  };

  const resolvedStartId = ALIASES[startId] && !graph.nodes.some(n => n.id === startId) ? ALIASES[startId] : startId;
  const resolvedTargetId = ALIASES[targetId] && !graph.nodes.some(n => n.id === targetId) ? ALIASES[targetId] : targetId;

  const nodeMap = new Map();
  graph.nodes.forEach(n => nodeMap.set(n.id, n));

  const startNode = nodeMap.get(resolvedStartId);
  const targetNode = nodeMap.get(resolvedTargetId);

  if (!startNode || !targetNode) {
    return { success: false, code: 'NODE_NOT_FOUND', message: `Start (${resolvedStartId}) or target (${resolvedTargetId}) not found in graph` };
  }

  // 1. Build filtered adjacency list
  const adj = new Map();
  graph.nodes.forEach(n => adj.set(n.id, []));

  // Determine lift statuses
  const isLiftOperational = (nodeId) => {
    if (nodeId.includes('LIFT_A') && liftsState['LIFT_A']?.status === 'OUT_OF_SERVICE') return false;
    if (nodeId.includes('LIFT_B') && liftsState['LIFT_B']?.status === 'OUT_OF_SERVICE') return false;
    return true;
  };

  graph.edges.forEach(edge => {
    // Constraint 1: Explicit Stair Exclusion
    if (avoidStairs && (edge.type === 'stairs' || edge.accessible === false)) {
      return; // Skip stair edge completely
    }

    // Constraint 2: Lift status check
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);

    if (fromNode?.type === 'lift' && !isLiftOperational(fromNode.id)) return;
    if (toNode?.type === 'lift' && !isLiftOperational(toNode.id)) return;

    // Add valid edge
    if (adj.has(edge.from)) {
      adj.get(edge.from).push({
        to: edge.to,
        distance: edge.distance,
        type: edge.type,
        accessible: edge.accessible !== false
      });
    }
  });

  // 2. Dijkstra's Shortest Path Algorithm
  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set();

  graph.nodes.forEach(node => {
    distances.set(node.id, Infinity);
    unvisited.add(node.id);
  });

  distances.set(resolvedStartId, 0);

  while (unvisited.size > 0) {
    let currentId = null;
    let smallestDist = Infinity;

    unvisited.forEach(id => {
      const dist = distances.get(id);
      if (dist < smallestDist) {
        smallestDist = dist;
        currentId = id;
      }
    });

    if (currentId === null || smallestDist === Infinity) {
      break; // Remaining nodes are unreachable
    }

    if (currentId === resolvedTargetId) {
      break; // Reached destination
    }

    unvisited.delete(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (unvisited.has(neighbor.to)) {
        const alt = distances.get(currentId) + neighbor.distance;
        if (alt < distances.get(neighbor.to)) {
          distances.set(neighbor.to, alt);
          previous.set(neighbor.to, { from: currentId, type: neighbor.type, distance: neighbor.distance });
        }
      }
    }
  }

  // 3. Safety Invariant Check
  if (distances.get(resolvedTargetId) === Infinity) {
    return {
      success: false,
      code: 'NO_ACCESSIBLE_ROUTE',
      message: 'No accessible route found without stairs. Elevated transit or ramp required.',
      fallback: {
        action: 'TRIGGER_HUMAN_HANDOFF',
        destinationId: 'HELP_DESK_G',
        helpdeskName: 'Ground Floor May I Help You Desk'
      }
    };
  }

  // 4. Reconstruct path
  const pathNodes = [];
  const pathSteps = [];
  let curr = resolvedTargetId;

  while (curr !== resolvedStartId) {
    const nodeObj = nodeMap.get(curr);
    pathNodes.unshift(nodeObj);
    const prevInfo = previous.get(curr);
    if (!prevInfo) break;
    pathSteps.unshift(prevInfo);
    curr = prevInfo.from;
  }
  pathNodes.unshift(nodeMap.get(resolvedStartId));

  // 5. Generate human-friendly step-by-step guidance with landmark cues
  const localizedInstructions = pathNodes.map((node, index) => {
    const isTarget = index === pathNodes.length - 1;
    const isStart = index === 0;

    let nodeName = node.name;
    let landmarkText = node.landmark || '';

    if (language === 'ta') {
      nodeName = node.name_ta || node.name;
      landmarkText = node.landmark_ta || node.landmark || '';
    } else if (language === 'hi') {
      nodeName = node.name_hi || node.name;
      landmarkText = node.landmark_hi || node.landmark || '';
    }

    let directionalCue = '';
    if (isStart) {
      directionalCue = language === 'ta' 
        ? 'தொடங்கும் இடம்: ' + nodeName 
        : language === 'hi'
        ? 'शुरुआत: ' + nodeName
        : 'Starting at: ' + nodeName;
    } else if (isTarget) {
      directionalCue = language === 'ta'
        ? 'இலக்கு அடைந்தது: ' + nodeName + ' (' + landmarkText + ')'
        : language === 'hi'
        ? 'गंतव्य पर पहुंचें: ' + nodeName + ' (' + landmarkText + ')'
        : 'Arrive at destination: ' + nodeName + ' (' + landmarkText + ')';
    } else if (node.type === 'lift') {
      directionalCue = language === 'ta'
        ? `லிஃப்ட் எடுத்து தளம் ${node.floor}-க்கு செல்லவும்`
        : language === 'hi'
        ? `लिफ्ट लेकर मंजिल ${node.floor} पर जाएं`
        : `Take the lift to Floor ${node.floor}`;
    } else if (node.type === 'ramp') {
      directionalCue = language === 'ta'
        ? `சாய்வுப் பாதை (Ramp) வழியாக தளம் ${node.floor}-க்கு செல்லவும்`
        : language === 'hi'
        ? `सुगम्य रैंप से मंजिल ${node.floor} की ओर बढ़ें`
        : `Walk along the accessible ramp towards Floor ${node.floor}`;
    } else {
      directionalCue = language === 'ta'
        ? `நேராக நடந்து ${nodeName} அடையவும்`
        : language === 'hi'
        ? `सीधे चलकर ${nodeName} पर पहुंचें`
        : `Walk straight towards ${nodeName}`;
    }

    return {
      stepIndex: index + 1,
      nodeId: node.id,
      floor: node.floor,
      x: node.x || 400,
      y: node.y || 250,
      nodeName,
      landmarkText,
      directionalCue,
      nodeType: node.type,
      isStart,
      isTarget
    };
  });

  return {
    success: true,
    code: 'ROUTE_CALCULATED',
    totalDistance: distances.get(resolvedTargetId),
    stepCount: pathNodes.length,
    pathNodeIds: pathNodes.map(n => n.id),
    targetFloor: targetNode.floor,
    instructions: localizedInstructions,
    avoidStairsUsed: avoidStairs
  };
}
