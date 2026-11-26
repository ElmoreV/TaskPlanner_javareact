// TODO: review entire file, this is all a ticking time bomb


import { FinishedState } from "../Structure/TaskInterfaces.tsx";

export const NODE_WIDTH = 184;
export const NODE_HEIGHT = 48;
const COLUMN_GAP = 100;
const ROW_GAP = 32;
const PADDING = 48;
const GROUP_PADDING = 20;
const GROUP_GAP = 48;
const GRID_COLUMN_GAP = 32;

const average = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

// Project desired positions onto non-overlapping rows. Pooling collisions keeps
// siblings centered around their parent instead of pushing every sibling down.
function alignColumn(column, neighbors, nodesById) {
  const desired = new Map(
    column.map((node) => {
      const ids = neighbors.get(node.id);
      return [
        node.id,
        ids.length ? average(ids.map((id) => nodesById.get(id).y)) : node.y,
      ];
    })
  );
  column.sort((a, b) => desired.get(a.id) - desired.get(b.id) || a.id - b.id);
  const stride = NODE_HEIGHT + ROW_GAP;
  const blocks = [];
  column.forEach((node, row) => {
    blocks.push({ sum: desired.get(node.id) - row * stride, count: 1 });
    while (blocks.length > 1) {
      const right = blocks[blocks.length - 1];
      const left = blocks[blocks.length - 2];
      if (left.sum / left.count <= right.sum / right.count) break;
      blocks.splice(-2, 2, {
        sum: left.sum + right.sum,
        count: left.count + right.count,
      });
    }
  });
  let row = 0;
  blocks.forEach((block) => {
    const position = block.sum / block.count;
    for (let index = 0; index < block.count; index += 1) {
      column[row].y = position + row * stride;
      row += 1;
    }
  });
}

function layoutComponent(ids, tasksById, ranks, parents, children) {
  const columns = [];
  const nodesById = new Map();
  ids
    .sort((a, b) => a - b)
    .forEach((id) => {
      const rank = ranks.get(id);
      if (!columns[rank]) columns[rank] = [];
      const node = {
        id,
        task: tasksById.get(id),
        x: rank * (NODE_WIDTH + COLUMN_GAP),
        y: columns[rank].length * (NODE_HEIGHT + ROW_GAP),
      };
      columns[rank].push(node);
      nodesById.set(id, node);
    });

  // Both directions matter: children follow parents, then parents center on
  // their children. Work within one connected component so unrelated roots or
  // isolated tasks can never stretch its edges.
  for (let pass = 0; pass < 6; pass += 1) {
    for (let rank = 1; rank < columns.length; rank += 1) {
      alignColumn(columns[rank], parents, nodesById);
    }
    for (let rank = columns.length - 2; rank >= 0; rank -= 1) {
      alignColumn(columns[rank], children, nodesById);
    }
  }

  const nodes = columns.flat();
  const minimumY = nodes.reduce(
    (minimum, node) => Math.min(minimum, node.y),
    Infinity
  );
  nodes.forEach((node) => {
    node.y -= minimumY;
  });
  return {
    id: `connected-${ids[0]}`,
    nodes,
    width:
      columns.length * (NODE_WIDTH + COLUMN_GAP) -
      COLUMN_GAP +
      GROUP_PADDING * 2,
    height:
      nodes.reduce(
        (maximum, node) => Math.max(maximum, node.y + NODE_HEIGHT),
        0
      ) +
      GROUP_PADDING * 2,
    headerHeight: 0,
  };
}

export const TASK_GRAPH_STATUSES = {
  unfinished: "Unfinished",
  completed: "Completed",
  irrelevant: "Irrelevant",
  impossible: "Impossible",
};

export function getTaskGraphStatus(task) {
  if (task.completed || task.finishStatus === FinishedState.Completed) {
    return "completed";
  }
  if (task.finishStatus === FinishedState.Irrelevant) return "irrelevant";
  if (task.finishStatus === FinishedState.Impossible) return "impossible";
  return "unfinished";
}

// V1 task IDs are numeric. Sorting our own array keeps layout independent of
// task-list ordering without changing the application's task objects.
export function layoutTaskGraph(tasks) {
  const orderedTasks = [...tasks].sort((a, b) => a.id - b.id);
  const tasksById = new Map(orderedTasks.map((task) => [task.id, task]));
  const children = new Map(orderedTasks.map((task) => [task.id, []]));
  const parents = new Map(orderedTasks.map((task) => [task.id, []]));
  const edges = [];

  orderedTasks.forEach((task) => {
    const childIds = [...new Set(task.subTaskIds || [])]
      .filter((id) => tasksById.has(id))
      .sort((a, b) => a - b);
    children.set(task.id, childIds);
    childIds.forEach((childId) => {
      parents.get(childId).push(task.id);
      edges.push({ source: task.id, target: childId });
    });
  });

  const remainingParents = new Map(
    orderedTasks.map((task) => [task.id, parents.get(task.id).length])
  );
  const ranks = new Map(orderedTasks.map((task) => [task.id, 0]));
  const queue = orderedTasks
    .filter((task) => remainingParents.get(task.id) === 0)
    .map((task) => task.id);

  // Kahn's traversal detects cycles and assigns each task the longest root path.
  // A shared child therefore sits strictly to the right of every parent.
  for (let index = 0; index < queue.length; index += 1) {
    const id = queue[index];
    children.get(id).forEach((childId) => {
      ranks.set(childId, Math.max(ranks.get(childId), ranks.get(id) + 1));
      const count = remainingParents.get(childId) - 1;
      remainingParents.set(childId, count);
      if (count === 0) queue.push(childId);
    });
  }

  if (queue.length !== orderedTasks.length) {
    return {
      nodes: [],
      edges: [],
      groups: [],
      width: 0,
      height: 0,
      hasCycle: true,
    };
  }
  if (!orderedTasks.length) {
    return {
      nodes: [],
      edges: [],
      groups: [],
      width: 0,
      height: 0,
      hasCycle: false,
    };
  }

  const visited = new Set();
  const standalone = [];
  const components = [];
  orderedTasks.forEach((task) => {
    if (visited.has(task.id)) return;
    if (!parents.get(task.id).length && !children.get(task.id).length) {
      standalone.push(task);
      visited.add(task.id);
      return;
    }
    const ids = [task.id];
    visited.add(task.id);
    for (let index = 0; index < ids.length; index += 1) {
      const id = ids[index];
      [...parents.get(id), ...children.get(id)].forEach((neighborId) => {
        if (visited.has(neighborId)) return;
        visited.add(neighborId);
        ids.push(neighborId);
      });
    }
    components.push(layoutComponent(ids, tasksById, ranks, parents, children));
  });

  // Pack independent graphs into shelves rather than stacking them in a single
  // root column. Aim for a landscape canvas; long chains can exceed this width.
  const area = components.reduce(
    (sum, component) =>
      sum + (component.width + GROUP_GAP) * (component.height + GROUP_GAP),
    standalone.length * (NODE_WIDTH + GRID_COLUMN_GAP) * (NODE_HEIGHT + ROW_GAP)
  );
  const targetWidth = Math.max(
    960,
    Math.sqrt(area * 1.8),
    ...components.map((component) => component.width)
  );

  if (standalone.length) {
    const columnCount = Math.min(
      standalone.length,
      Math.max(
        1,
        Math.floor(
          (targetWidth - GROUP_PADDING * 2 + GRID_COLUMN_GAP) /
            (NODE_WIDTH + GRID_COLUMN_GAP)
        )
      )
    );
    const headerHeight = 28;
    components.push({
      id: "standalone",
      label: `Standalone tasks (${standalone.length})`,
      headerHeight,
      width:
        columnCount * (NODE_WIDTH + GRID_COLUMN_GAP) -
        GRID_COLUMN_GAP +
        GROUP_PADDING * 2,
      height:
        Math.ceil(standalone.length / columnCount) * (NODE_HEIGHT + ROW_GAP) -
        ROW_GAP +
        GROUP_PADDING * 2 +
        headerHeight,
      nodes: standalone.map((task, index) => ({
        id: task.id,
        task,
        x: (index % columnCount) * (NODE_WIDTH + GRID_COLUMN_GAP),
        y: Math.floor(index / columnCount) * (NODE_HEIGHT + ROW_GAP),
      })),
    });
  }

  components.sort(
    (a, b) =>
      Number(a.id === "standalone") - Number(b.id === "standalone") ||
      b.height - a.height ||
      b.width - a.width ||
      a.nodes[0].id - b.nodes[0].id
  );
  const shelves = [];
  let packedHeight = 0;
  const groups = [];
  const nodes = [];
  components.forEach((component) => {
    let shelf = shelves.find(
      (entry) =>
        entry.height >= component.height &&
        entry.nextX + component.width <= targetWidth
    );
    if (!shelf) {
      shelf = { y: packedHeight, height: component.height, nextX: 0 };
      shelves.push(shelf);
      packedHeight += component.height + GROUP_GAP;
    }
    const x = PADDING + shelf.nextX;
    const y = PADDING + shelf.y;
    groups.push({
      id: component.id,
      label: component.label,
      x,
      y,
      width: component.width,
      height: component.height,
    });
    component.nodes.forEach((node) => {
      nodes.push({
        ...node,
        x: node.x + x + GROUP_PADDING,
        y: node.y + y + GROUP_PADDING + component.headerHeight,
      });
    });
    shelf.nextX += component.width + GROUP_GAP;
  });

  return {
    nodes,
    edges,
    groups,
    width:
      shelves.reduce(
        (maximum, shelf) => Math.max(maximum, shelf.nextX - GROUP_GAP),
        0
      ) +
      PADDING * 2,
    height: packedHeight - GROUP_GAP + PADDING * 2,
    hasCycle: false,
  };
}
