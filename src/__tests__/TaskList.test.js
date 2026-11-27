import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TaskList from "../TaskViews/TaskList";
import { createFilterSettings } from "../Filters/filterSettings";

// Keep the view's traversal and real filtering, with simple task/topic rows.
jest.mock("../Tasks/TaskContainer.tsx", () => ({
  __esModule: true,
  default: ({ task, topic, superTask }) => (
    <span
      data-testid="task-row"
      data-task-id={task.id}
      data-topic-id={topic?.id}
      data-supertask-id={superTask?.id}
    >
      {task.name}
    </span>
  ),
}));
jest.mock("../Topics/TopicContainer.tsx", () => ({
  __esModule: true,
  default: ({ topic }) => <span>{topic.name}</span>,
}));

const makeTask = (id, name, extra = {}) => ({
  id,
  name,
  topics: [],
  topicViewIndices: [],
  subTaskIds: [],
  completed: false,
  finishStatus: 0,
  unfolded: true,
  ...extra,
});
const makeData = () => ({
  topics: [
    { id: 10, name: "Work", unfolded: true, subtopics: [] },
    { id: 20, name: "Folded topic", unfolded: false, subtopics: [] },
  ],
  tasks: [
    makeTask(2, "Shared child", { topics: [10], topicViewIndices: [1] }),
    makeTask(1, "Parent A", {
      topics: [10],
      topicViewIndices: [0],
      subTaskIds: [4, 999, 2, 5],
    }),
    makeTask(4, "First child"),
    makeTask(5, "Finished child", { completed: true, finishStatus: 1 }),
    makeTask(6, "Parent B", { subTaskIds: [2] }),
    makeTask(7, "Task in folded topic", {
      topics: [20],
      topicViewIndices: [0],
    }),
  ],
});
const view = (
  appData,
  filterSettings = createFilterSettings({
    match: { tasks: { statuses: ["unfinished"] } },
  })
) => (
  <TaskList
    appData={appData}
    setAppData={jest.fn()}
    setFilterSettings={jest.fn()}
    filterSettings={filterSettings}
  />
);
const childNames = (parentId) =>
  screen
    .getAllByTestId("task-row")
    .filter((row) => row.dataset.supertaskId === String(parentId))
    .map((row) => row.textContent);

beforeEach(() => {
  jest.spyOn(console, "debug").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test("subtasks follow relationship order, skipping missing and invisible tasks", () => {
  render(view(makeData()));
  expect(childNames(1)).toEqual(["First child", "Shared child"]);
  expect(screen.queryByText("Finished child")).not.toBeInTheDocument();
  expect(
    screen.getAllByTestId("task-row").map((row) => row.textContent)
  ).toEqual([
    "Parent B",
    "Shared child",
    "Parent A",
    "First child",
    "Shared child",
    "Shared child",
  ]);
});

test("shared subtasks keep each supertask occurrence and their own topic occurrence", () => {
  render(view(makeData()));
  const sharedRows = screen.getAllByText("Shared child");
  expect(sharedRows).toHaveLength(3);
  expect(
    sharedRows.map((row) => [row.dataset.supertaskId, row.dataset.topicId])
  ).toEqual([
    ["6", undefined],
    ["1", undefined],
    [undefined, "10"],
  ]);
});

test("changing visibility includes a previously hidden subtask in its original position", () => {
  const data = makeData();
  const { rerender } = render(view(data));
  rerender(view(data, createFilterSettings()));
  expect(childNames(1)).toEqual([
    "First child",
    "Shared child",
    "Finished child",
  ]);
});

test("task and topic folding preserve occurrences outside the folded branch", () => {
  const data = makeData();
  const { rerender } = render(view(data));
  expect(screen.queryByText("Task in folded topic")).not.toBeInTheDocument();
  rerender(
    view({
      ...data,
      tasks: data.tasks.map((task) =>
        task.id === 1 ? { ...task, unfolded: false } : task
      ),
    })
  );
  expect(childNames(1)).toEqual([]);
  expect(screen.queryByText("First child")).not.toBeInTheDocument();
  expect(screen.getAllByText("Shared child")).toHaveLength(2);

  rerender(
    view({
      ...data,
      topics: data.topics.map((topic) => ({ ...topic, unfolded: false })),
    })
  );
  expect(screen.queryByText("Parent A")).not.toBeInTheDocument();
  expect(screen.getAllByText("Shared child")).toHaveLength(1);
  expect(childNames(6)).toEqual(["Shared child"]);
});

test("replacing the tasks array updates task objects and resolves added or removed references", () => {
  const data = makeData();
  const { rerender } = render(view(data));
  const tasks = data.tasks.map((task) =>
    task.id === 2 ? { ...task, name: "Renamed child" } : task
  );
  tasks.push(makeTask(999, "Newly available child"));
  rerender(view({ ...data, tasks }));
  expect(childNames(1)).toEqual([
    "First child",
    "Newly available child",
    "Renamed child",
  ]);
  expect(screen.getAllByText("Renamed child")).toHaveLength(3);
  expect(screen.queryByText("Shared child")).not.toBeInTheDocument();

  rerender(view({ ...data, tasks: tasks.filter((task) => task.id !== 4) }));
  expect(childNames(1)).toEqual(["Newly available child", "Renamed child"]);
  expect(screen.queryByText("First child")).not.toBeInTheDocument();
});

test("deadline filtering follows edits and remounts without writing transitiveDueTime", () => {
  const storedDeadline = new Date("2099-01-01");
  const data = {
    topics: [],
    tasks: [
      makeTask(1, "Parent", { subTaskIds: [2], transitiveDueTime: storedDeadline }),
      makeTask(2, "Child", { dueTime: new Date(Date.now() + 60 * 1000) }),
    ],
  };
  const filterSettings = createFilterSettings({
    match: { tasks: { deadline: { kind: "within", interval: "30min" } } },
  });
  const { rerender, unmount } = render(view(data, filterSettings));
  expect(screen.getByText("Parent")).toBeInTheDocument();
  const later = {
    ...data,
    tasks: data.tasks.map((task) => task.id === 2
      ? { ...task, dueTime: new Date(Date.now() + 60 * 60 * 1000) } : task),
  };
  rerender(view(later, filterSettings));
  expect(screen.queryByText("Parent")).not.toBeInTheDocument();
  unmount();
  render(view(data, filterSettings));
  expect(screen.getByText("Parent")).toBeInTheDocument();
  expect(data.tasks[0].transitiveDueTime).toBe(storedDeadline);
  expect(data.tasks[1]).not.toHaveProperty("transitiveDueTime");
});
