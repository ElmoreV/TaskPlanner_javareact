import {
  getTaskGraphStatus,
  layoutTaskGraph,
  NODE_HEIGHT,
  NODE_WIDTH,
} from "../TaskViews/taskGraphLayout.js";
import { FinishedState } from "../Structure/TaskInterfaces.tsx";

const task = (id, subTaskIds = []) => ({ id, name: `Task ${id}`, subTaskIds });

test.each([
  ["chain", [task(0, [1]), task(1, [2]), task(2)]],
  ["diamond", [task(0, [1, 2]), task(1, [3]), task(2, [3]), task(3)]],
  [
    "shared child at different depths",
    [task(0, [2]), task(1, [3]), task(2, [3]), task(3)],
  ],
  [
    "disconnected components and isolated tasks",
    [task(0, [1]), task(1), task(2, [3]), task(3), task(4)],
  ],
])("%s has one node per task and all parents to the left", (_name, tasks) => {
  const graph = layoutTaskGraph(tasks);
  expect(graph.hasCycle).toBe(false);
  expect(graph.nodes).toHaveLength(tasks.length);
  expect(new Set(graph.nodes.map((node) => node.id)).size).toBe(tasks.length);
  expect(graph.edges).toHaveLength(
    tasks.reduce((count, entry) => count + entry.subTaskIds.length, 0)
  );
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  graph.edges.forEach(({ source, target }) => {
    expect(nodes.get(source).x + NODE_WIDTH).toBeLessThan(nodes.get(target).x);
  });
  graph.nodes.forEach((node) => {
    expect(node.x).toBeGreaterThanOrEqual(0);
    expect(node.y).toBeGreaterThanOrEqual(0);
    expect(node.x + NODE_WIDTH).toBeLessThanOrEqual(graph.width);
    expect(node.y + NODE_HEIGHT).toBeLessThanOrEqual(graph.height);
    graph.nodes
      .filter((other) => other.id !== node.id)
      .forEach((other) => {
        const separated =
          Math.abs(node.x - other.x) >= NODE_WIDTH ||
          Math.abs(node.y - other.y) >= NODE_HEIGHT - 0.001;
        expect(separated).toBe(true);
      });
  });
});

test("children follow the vertical order of their parents with stable ID tie-breaking", () => {
  const tasks = [task(0, [4, 3]), task(1, [2]), task(2), task(3), task(4)];
  const graph = layoutTaskGraph(tasks);
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  expect(byId.get(3).y).toBeLessThan(byId.get(4).y);
  expect(byId.get(0).y).toBe((byId.get(3).y + byId.get(4).y) / 2);
  expect(byId.get(1).y).toBe(byId.get(2).y);
  expect(layoutTaskGraph([...tasks].reverse())).toEqual(graph);
});

test("many standalone tasks form a compact grid and do not stretch connected edges", () => {
  const chain = [task(0, [1]), task(1, [2]), task(2)];
  const standalone = Array.from({ length: 120 }, (_, index) => task(index + 3));
  const graph = layoutTaskGraph([...chain, ...standalone]);
  expect(graph.nodes).toHaveLength(123);
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  expect(byId.get(0).y).toBe(byId.get(1).y);
  expect(byId.get(1).y).toBe(byId.get(2).y);
  const gridNodes = graph.nodes.filter((node) => node.id >= 3);
  expect(new Set(gridNodes.map((node) => node.x)).size).toBeGreaterThan(4);
  expect(new Set(gridNodes.map((node) => node.y)).size).toBeLessThan(20);
  expect(graph.height).toBeLessThan(1600);
  expect(graph.groups.find((group) => group.id === "standalone").label).toBe(
    "Standalone tasks (120)"
  );
});

test("disconnected chains keep each parent aligned with its own child", () => {
  // The old global column layout centered all children against all roots,
  // producing tall diagonal connections when unrelated roots were present.
  const tasks = [
    task(0, [50]),
    task(1, [51]),
    task(2, [52]),
    task(3, [53]),
    task(50),
    task(51),
    task(52),
    task(53),
  ];
  const graph = layoutTaskGraph(tasks);
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  graph.edges.forEach(({ source, target }) => {
    expect(nodes.get(source).y).toBe(nodes.get(target).y);
  });
  graph.groups.forEach((group, index) => {
    graph.groups.slice(index + 1).forEach((other) => {
      expect(
        group.x + group.width <= other.x ||
          other.x + other.width <= group.x ||
          group.y + group.height <= other.y ||
          other.y + other.height <= group.y
      ).toBe(true);
    });
  });
});

test("branches center around local relatives instead of the full column height", () => {
  const graph = layoutTaskGraph([
    task(0, [1, 2]),
    task(1, [3, 4, 5, 6, 7]),
    task(2, [8]),
    task(3),
    task(4),
    task(5),
    task(6),
    task(7),
    task(8),
  ]);
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  expect(byId.get(2).y).toBeCloseTo(byId.get(8).y);
  expect(byId.get(1).y).toBeCloseTo((byId.get(3).y + byId.get(7).y) / 2);
  expect(byId.get(8).y).toBeGreaterThan(byId.get(7).y);
});

test("duplicate edges and missing references are ignored without changing inputs", () => {
  const tasks = [
    task(0, [1, 1, 99]),
    task(1),
    { id: 2, name: "No child list" },
  ];
  tasks.forEach((entry) => {
    if (entry.subTaskIds) Object.freeze(entry.subTaskIds);
    Object.freeze(entry);
  });
  Object.freeze(tasks);
  const graph = layoutTaskGraph(tasks);
  expect(graph.nodes).toHaveLength(3);
  expect(graph.edges).toEqual([{ source: 0, target: 1 }]);
  expect(tasks[0].subTaskIds).toEqual([1, 1, 99]);
  expect(tasks[0]).not.toHaveProperty("x");
});

test("empty graphs return empty bounds", () => {
  expect(layoutTaskGraph([])).toEqual({
    nodes: [],
    edges: [],
    groups: [],
    width: 0,
    height: 0,
    hasCycle: false,
  });
});

test.each([
  ["self-link", [task(0, [0])]],
  ["circular relationship", [task(0, [1]), task(1, [0])]],
  [
    "cycle in a disconnected component",
    [task(0, [1]), task(1), task(2, [3]), task(3, [2])],
  ],
])("%s stops layout safely", (_name, tasks) => {
  expect(layoutTaskGraph(tasks)).toEqual({
    nodes: [],
    edges: [],
    groups: [],
    width: 0,
    height: 0,
    hasCycle: true,
  });
});

test.each([
  [{ finishStatus: FinishedState.NotFinished }, "unfinished"],
  [{ finishStatus: FinishedState.Completed }, "completed"],
  [{ finishStatus: FinishedState.Irrelevant }, "irrelevant"],
  [{ finishStatus: FinishedState.Impossible }, "impossible"],
  [{ completed: true }, "completed"],
  [{ completed: true, finishStatus: FinishedState.Impossible }, "completed"],
  [{ thisWeek: true, scheduled: true, repeated: true }, "unfinished"],
])("status %j maps to %s", (entry, expected) => {
  expect(getTaskGraphStatus(entry)).toBe(expected);
});
