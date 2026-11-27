import React, { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import AllTasksList from "../TaskViews/AllTasksList";
import TaskContainer from "../Tasks/TaskContainer.tsx";
import Task from "../Tasks/Task.tsx";
import { getSelectableTags } from "../Tasks/TaskTagHelpers";
import { setTaskTopicV1Pure } from "../ADG/ModifyFuncGeneratorsV1Idempotent.ts";
import App from "../App";
import { FinishedState } from "../Structure/TaskInterfaces.tsx";
import { View } from "../Structure/View";

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
    {
      id: 10,
      name: "Activiteiten",
      subtopics: [{ id: 11, name: "Kopen", subtopics: [] }],
    },
    { id: 12, name: "Grappig", subtopics: [] },
    {
      id: 13,
      name: "Werk",
      subtopics: [{ id: 14, name: "Kopen", subtopics: [] }],
    },
  ],
  tasks: [
    makeTask(1, "Parent A", { subTaskIds: [2, 4] }),
    makeTask(2, "Shared child", { topics: [12], topicViewIndices: [7] }),
    makeTask(3, "Parent B", { subTaskIds: [2] }),
    makeTask(4, "Finished child", { completed: true, finishStatus: 1 }),
  ],
});
const Harness = ({ initialData = makeData(), fancy = true }) => {
  const [appData, setAppData] = useState(initialData);
  const [filterSettings, setFilterSettings] = useState(undefined);
  return (
    <AllTasksList
      appData={appData}
      setAppData={setAppData}
      fancy={fancy}
      filterSettings={filterSettings}
      setFilterSettings={setFilterSettings}
    />
  );
};
// Preserve the old unfinished-only workflow through the unified status choices.
const toggleFinishedStatuses = () => {
  const summary = screen.getByText("Status", { selector: "summary" });
  if (!summary.parentElement.open) fireEvent.click(summary);
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Finished", exact: true })
  );
};
const structureSelect = () => {
  const summary = screen.getByText("Task filters", { selector: "summary" });
  if (!summary.parentElement.open) fireEvent.click(summary);
  return screen.getByRole("combobox", { name: "Task relation" });
};
const topRows = () =>
  Array.from(
    screen.getByRole("region", { name: "All tasks" }).querySelector("ul")
      .children
  );

test("the existing view selector opens All tasks and returns to Categorize", () => {
  render(<App />);
  expect(screen.queryByRole("region", { name: "All tasks" })).toBeNull();
  fireEvent.click(
    screen.getByRole("heading", { name: "All tasks", exact: true })
  );
  expect(screen.getByRole("region", { name: "All tasks" })).toBeVisible();
  expect(
    screen.getAllByRole("button", { name: "+Tag" }).length
  ).toBeGreaterThan(0);
  fireEvent.click(
    screen.getByRole("heading", { name: "2. Categorize", exact: true })
  );
  expect(screen.queryByRole("region", { name: "All tasks" })).toBeNull();
});

test("every task has one top-level row, plus nested copies and all parent context", () => {
  render(<Harness />);
  expect(topRows()).toHaveLength(4);
  expect(screen.getAllByText("Shared child", { exact: true })).toHaveLength(3);
  expect(screen.getAllByText("Parent A, Parent B")).toHaveLength(3);
  expect(screen.getAllByText("Finished child", { exact: true })).toHaveLength(
    2
  );
  fireEvent.click(
    within(topRows()[0]).getAllByRole("button", { name: "v", exact: true })[0]
  );
  expect(topRows()).toHaveLength(4);
  expect(screen.getAllByText("Shared child", { exact: true })).toHaveLength(2);
  expect(within(topRows()[1]).getByText("Shared child")).toBeVisible();
});

test("parent context switches between direct parents and full paths on every copy", () => {
  const data = makeData();
  data.tasks.unshift(makeTask(5, "Grandparent", { subTaskIds: [1, 3] }));
  render(<Harness initialData={data} />);
  const copies = screen.getAllByText("Shared child", { exact: true });
  expect(screen.getAllByText("Parent A, Parent B")).toHaveLength(copies.length);
  const checkbox = screen.getByRole("checkbox", {
    name: "Show full parent paths",
  });
  expect(checkbox).not.toBeChecked();
  fireEvent.click(checkbox);
  expect(
    screen.getAllByText("Grandparent/Parent A, Grandparent/Parent B")
  ).toHaveLength(copies.length);
  expect(screen.queryByText(/^Parents?:/)).not.toBeInTheDocument();
  fireEvent.click(checkbox);
  expect(screen.getAllByText("Parent A, Parent B")).toHaveLength(copies.length);
  expect(
    screen.queryByText("Grandparent/Parent A, Grandparent/Parent B")
  ).toBeNull();
});

test("finished filter hides completed, irrelevant, impossible, and legacy completed tasks everywhere", () => {
  const data = makeData();
  data.tasks.push(
    makeTask(5, "Irrelevant child", { finishStatus: FinishedState.Irrelevant }),
    makeTask(6, "Impossible child", { finishStatus: FinishedState.Impossible }),
    makeTask(7, "Legacy completed child", { completed: true })
  );
  data.tasks[0].subTaskIds.push(5, 6, 7);
  const before = JSON.stringify(data);
  render(<Harness initialData={data} />);
  expect(topRows()).toHaveLength(7);
  toggleFinishedStatuses();
  expect(topRows()).toHaveLength(3);
  for (const name of [
    "Finished child",
    "Irrelevant child",
    "Impossible child",
    "Legacy completed child",
  ]) {
    expect(screen.queryByText(name, { exact: true })).not.toBeInTheDocument();
  }
  expect(screen.getAllByText("Shared child", { exact: true })).toHaveLength(3);
  toggleFinishedStatuses();
  expect(topRows()).toHaveLength(7);
  expect(screen.getAllByText("Impossible child", { exact: true })).toHaveLength(
    2
  );
  expect(JSON.stringify(data)).toBe(before);
});

test("unfinished subtasks retain their top-level row and ancestor context when a parent is hidden", () => {
  const data = {
    topics: [],
    tasks: [
      makeTask(1, "Grandparent", { completed: true, subTaskIds: [2] }),
      makeTask(2, "Archived parent", {
        finishStatus: FinishedState.Completed,
        subTaskIds: [3],
      }),
      makeTask(3, "Active child"),
    ],
  };
  render(<Harness initialData={data} />);
  toggleFinishedStatuses();
  expect(topRows()).toHaveLength(1);
  expect(screen.getByText("Active child")).toBeVisible();
  expect(screen.getByText("Archived parent")).toBeVisible();
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Show full parent paths" })
  );
  expect(screen.getByText("Grandparent/Archived parent")).toBeVisible();
});

test("toggling Transitively irrelevant removes and restores unfinished branches in AllTasks", () => {
  const data = {
    topics: [],
    tasks: [
      makeTask(1, "Finished project", {
        finishStatus: FinishedState.Completed,
        subTaskIds: [2],
      }),
      makeTask(2, "Inactive child", { subTaskIds: [3] }),
      makeTask(3, "Inactive grandchild"),
      makeTask(4, "Active project", { subTaskIds: [5] }),
      makeTask(5, "Active child"),
      makeTask(6, "Independent task"),
    ],
  };
  const before = JSON.stringify(data);
  render(<Harness initialData={data} />);
  toggleFinishedStatuses();
  expect(topRows()).toHaveLength(5);
  expect(
    screen.getAllByText("Inactive grandchild", { exact: true })
  ).toHaveLength(2);

  const transitiveStatus = screen.getByRole("checkbox", {
    name: "Automatically irrelevant",
    exact: true,
  });
  fireEvent.click(transitiveStatus);
  expect(transitiveStatus).not.toBeChecked();
  expect(topRows()).toHaveLength(3);
  expect(
    screen.queryByText("Inactive child", { exact: true })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText("Inactive grandchild", { exact: true })
  ).not.toBeInTheDocument();
  expect(screen.getAllByText("Active child", { exact: true })).toHaveLength(2);

  fireEvent.click(transitiveStatus);
  expect(topRows()).toHaveLength(5);
  expect(
    within(topRows()[0]).getAllByRole("button", { name: "v", exact: true })[0]
  ).toBeVisible();
  expect(
    screen.getAllByText("Inactive grandchild", { exact: true })
  ).toHaveLength(2);
  expect(JSON.stringify(data)).toBe(before);
});

test("the app preserves ordinary unfinished rows while toggling imported transitively irrelevant tasks", () => {
  const data = {
    topics: [],
    tasks: [
      makeTask(1, "Imported finished project", {
        finishStatus: FinishedState.Completed,
        subTaskIds: [2],
      }),
      makeTask(2, "Imported inactive child", { subTaskIds: [3, 7] }),
      makeTask(3, "Imported inactive grandchild"),
      makeTask(4, "Imported active project", { subTaskIds: [5, 7] }),
      makeTask(5, "Imported active child"),
      makeTask(6, "Imported standalone"),
      makeTask(7, "Imported rescued child"),
    ],
  };
  const reader = jest.spyOn(window, "FileReader").mockImplementation(() => ({
    readAsText() {
      this.onload({ target: { result: JSON.stringify(data) } });
    },
  }));
  try {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Import \/ Export/ }));
    fireEvent.change(container.querySelector('input[type="file"]'), {
      target: {
        files: [
          new File([JSON.stringify(data)], "status-test.json", {
            type: "application/json",
          }),
        ],
      },
    });
    fireEvent.click(
      screen.getByRole("heading", { name: "All tasks", exact: true })
    );
    fireEvent.click(screen.getByText("Display", { selector: "summary" }));
    expect(screen.getByRole("combobox", { name: "Show tasks" })).toHaveValue(
      "none"
    );
    toggleFinishedStatuses();
    expect(topRows()).toHaveLength(6);
    const ordinaryRows = topRows().slice(2);
    const ordinaryTitles = [
      "Imported active project",
      "Imported active child",
      "Imported standalone",
      "Imported rescued child",
    ];

    const transitiveStatus = screen.getByRole("checkbox", {
      name: "Automatically irrelevant",
      exact: true,
    });
    fireEvent.click(transitiveStatus);
    expect(topRows()).toEqual(ordinaryRows);
    ordinaryTitles.forEach((title, index) => {
      expect(
        within(topRows()[index]).getAllByText(title, { exact: true })[0]
      ).toBeVisible();
    });
    expect(
      screen.queryByText("Imported inactive grandchild", { exact: true })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Unfinished", exact: true })
    ).toBePartiallyChecked();

    fireEvent.click(transitiveStatus);
    expect(topRows()).toHaveLength(6);
    expect(topRows().slice(2)).toEqual(ordinaryRows);
    expect(
      screen.getAllByText("Imported inactive grandchild", { exact: true })
    ).toHaveLength(2);
  } finally {
    reader.mockRestore();
  }
});

test("the finished filter handles a list with no remaining matches", () => {
  render(
    <Harness
      initialData={{
        topics: [],
        tasks: [makeTask(1, "Done", { completed: true })],
      }}
    />
  );
  toggleFinishedStatuses();
  expect(screen.getByText("No matching tasks.")).toBeVisible();
});

test("task-structure modes preserve the root, leaf and standalone workflows", () => {
  const data = makeData();
  data.tasks.push(makeTask(5, "Standalone", { subTaskIds: undefined }));
  const before = JSON.stringify(data);
  render(<Harness initialData={data} />);
  const structure = structureSelect();
  expect(structure).toHaveValue("any");
  fireEvent.change(structure, { target: { value: "noSupertasks" } });
  expect(topRows()).toHaveLength(3);
  expect(within(topRows()[0]).getByText("Parent A")).toBeVisible();
  expect(within(topRows()[1]).getByText("Parent B")).toBeVisible();
  expect(within(topRows()[2]).getByText("Standalone")).toBeVisible();
  expect(screen.queryByText("Shared child", { exact: true })).toBeNull();
  fireEvent.change(structure, { target: { value: "standalone" } });
  expect(topRows()).toHaveLength(1);
  expect(within(topRows()[0]).getByText("Standalone")).toBeVisible();
  fireEvent.change(structure, { target: { value: "noSubtasks" } });
  expect(topRows()).toHaveLength(3);
  expect(within(topRows()[0]).getByText("Shared child")).toBeVisible();
  toggleFinishedStatuses();
  expect(topRows()).toHaveLength(2);
  expect(screen.queryByText("Finished child", { exact: true })).toBeNull();
  fireEvent.change(structure, { target: { value: "any" } });
  expect(topRows()).toHaveLength(4);
  expect(screen.getAllByText("Shared child", { exact: true })).toHaveLength(3);
  expect(JSON.stringify(data)).toBe(before);
});

test("relationships use all tasks, even when related tasks are hidden or folded", () => {
  const data = {
    topics: [],
    tasks: [
      makeTask(1, "Finished parent", { completed: true, subTaskIds: [2] }),
      makeTask(2, "Active child"),
      makeTask(3, "Folded parent", { unfolded: false, subTaskIds: [4] }),
      makeTask(4, "Finished subtask", {
        finishStatus: FinishedState.Impossible,
      }),
    ],
  };
  render(<Harness initialData={data} />);
  toggleFinishedStatuses();
  const structure = structureSelect();
  fireEvent.change(structure, { target: { value: "noSupertasks" } });
  expect(topRows()).toHaveLength(1);
  expect(within(topRows()[0]).getByText("Folded parent")).toBeVisible();
  fireEvent.change(structure, { target: { value: "noSubtasks" } });
  expect(topRows()).toHaveLength(1);
  expect(within(topRows()[0]).getByText("Active child")).toBeVisible();
  fireEvent.change(structure, { target: { value: "standalone" } });
  expect(screen.getByText("No matching tasks.")).toBeVisible();
});

test("tagging from a nested copy synchronizes all copies and allows several tags", () => {
  render(<Harness />);
  const nestedChild = topRows()[0].querySelector("ul > li");
  fireEvent.click(within(nestedChild).getByRole("button", { name: "+Tag" }));
  const dialog = screen.getByPlaceholderText("Search tags…").parentElement;
  const search = within(dialog).getByRole("searchbox");
  expect(search).toHaveFocus();
  fireEvent.change(search, { target: { value: "kopen" } });
  expect(within(dialog).getAllByRole("checkbox")).toHaveLength(2);
  fireEvent.click(
    within(dialog).getByRole("checkbox", { name: /Activiteiten\/Kopen/ })
  );
  expect(screen.getAllByTitle("Activiteiten/Kopen")).toHaveLength(3);
  expect(screen.getAllByTitle("Grappig")).toHaveLength(3);
  expect(
    within(dialog).getByRole("checkbox", { name: /Activiteiten\/Kopen/ })
  ).toBeChecked();
  expect(topRows()).toHaveLength(4);
  fireEvent.click(
    within(dialog).getByRole("checkbox", { name: /Activiteiten\/Kopen/ })
  );
  expect(screen.queryAllByTitle("Activiteiten/Kopen")).toHaveLength(0);
  expect(screen.getAllByTitle("Grappig")).toHaveLength(3);
  fireEvent.keyDown(search, { key: "Escape" });
  expect(screen.queryByPlaceholderText("Search tags…")).not.toBeInTheDocument();
  expect(
    within(nestedChild).getByRole("button", { name: "+Tag" })
  ).toHaveFocus();
});

test("browsing and keyboard selection keep the picker open; full paths affect all copies", () => {
  render(<Harness />);
  fireEvent.click(within(topRows()[1]).getByRole("button", { name: "+Tag" }));
  const dialog = screen.getByPlaceholderText("Search tags…").parentElement;
  expect(
    within(dialog).queryByRole("checkbox", { name: /Activiteiten\/Kopen/ })
  ).toBeNull();
  fireEvent.click(
    within(within(dialog).getAllByText("Activiteiten", { exact: true })[0].closest("li"))
      .getByRole("button", { name: "▸" })
  );
  const checkbox = within(dialog).getByRole("checkbox", {
    name: /Activiteiten\/Kopen/,
  });
  checkbox.focus();
  fireEvent.keyDown(checkbox, { key: "Enter" });
  expect(checkbox).toBeChecked();
  fireEvent.keyDown(checkbox, { key: "ArrowDown" });
  expect(
    within(dialog).getByRole("checkbox", { name: /Grappig/ })
  ).toHaveFocus();
  fireEvent.click(within(dialog).getByRole("button", { name: "Done" }));
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Show full tag paths" })
  );
  expect(
    screen.getAllByText("Activiteiten/Kopen", { exact: true })
  ).toHaveLength(3);
});

test.each([true, false])(
  "task rows only expose folding and tagging actions (fancy=%s)",
  (fancy) => {
    const { container } = render(<Harness fancy={fancy} />);
    const taskRows = screen
      .getByRole("region", { name: "All tasks" })
      .querySelector("ul");
    const buttons = within(taskRows).getAllByRole("button");
    expect(
      buttons.every((button) => ["v", ">", "+Tag"].includes(button.textContent))
    ).toBe(true);
    expect(container.querySelector('[draggable="true"]')).toBeNull();
    expect(screen.queryByText("+ Duplicate +")).not.toBeInTheDocument();
    expect(within(taskRows).queryByRole("combobox")).toBeNull();
    fireEvent.doubleClick(within(topRows()[1]).getByText("Shared child"));
    expect(screen.queryByRole("textbox")).toBeNull();
  }
);

test("Categorize task features retain the existing actions", () => {
  const task = makeTask(1, "Editable task");
  render(
    <TaskContainer
      view={View.VIEW_ALL_TASKS}
      task={task}
      fancy
      setAppData={jest.fn()}
      selectedTasks={[]}
      setSelectedTasks={jest.fn()}
    />
  );
  expect(
    screen.getByRole("button", { name: "Complete", exact: true })
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Add subtask" })).toBeVisible();
  fireEvent.doubleClick(screen.getByText("Editable task"));
  expect(screen.getByRole("textbox")).toHaveValue("Editable task");
});

test("the view selects actions independently of the app data updater", () => {
  const task = makeTask(1, "Parent", { subTaskIds: [2] });
  const setAppData = jest.fn();
  const { rerender } = render(
    <TaskContainer
      view={View.VIEW_ALL_TASKS}
      task={task}
      setAppData={setAppData}
      fancy
    />
  );
  expect(
    screen.getByRole("button", { name: "Complete", exact: true })
  ).toBeVisible();

  rerender(
    <TaskContainer
      view={View.VIEW_TAG_ALL_TASKS}
      task={task}
      setAppData={setAppData}
      fancy
    />
  );
  expect(
    screen.queryByRole("button", { name: "Complete", exact: true })
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "v", exact: true }));

  const previous = { tasks: [task], topics: [] };
  const next = setAppData.mock.calls[0][0](previous);
  expect(next.tasks[0].unfolded).toBe(false);
  expect(next.topics).toBe(previous.topics);
  expect(previous.tasks[0].unfolded).toBe(true);
});

test("optional Task features require their callback rather than a mode flag", () => {
  const { container } = render(
    <Task
      id={1}
      name="Read only"
      completed={false}
      taskTopics={[]}
      hasSubTasks
    />
  );
  expect(screen.queryByRole("button")).toBeNull();
  expect(container.querySelector('[draggable="true"]')).toBeNull();
  fireEvent.doubleClick(screen.getByText("Read only"));
  expect(screen.queryByRole("textbox")).toBeNull();
});

test("topic assignment inserts at position one and removal restores ordering without mutation", () => {
  const data = makeData();
  data.tasks[0] = { ...data.tasks[0], topics: [11, 12], topicViewIndices: [1, 1] };
  data.tasks[1] = { ...data.tasks[1], topicViewIndices: [2] };
  data.tasks[2] = { ...data.tasks[2], topics: [11], topicViewIndices: [2] };
  const before = JSON.stringify(data.tasks);
  const updated = setTaskTopicV1Pure(data.topics, data.tasks, 2, 11, true);
  expect(updated.map((task) => task.id)).toEqual([1, 2, 3, 4]);
  expect(updated[1].topics).toEqual([12, 11]);
  expect(updated[1].topicViewIndices).toEqual([2, 1]);
  expect(updated[0].topicViewIndices).toEqual([2, 1]);
  expect(updated[2].topicViewIndices).toEqual([3]);
  expect(JSON.stringify(data.tasks)).toBe(before);
  const updatedBeforeRemoval = JSON.stringify(updated);
  const removed = setTaskTopicV1Pure(data.topics, updated, 2, 11, false);
  expect(removed).toEqual(data.tasks);
  expect(JSON.stringify(updated)).toBe(updatedBeforeRemoval);
  expect(updated[1].topics).toEqual([12, 11]);
});

test.each([
  [999, 11, true],
  [2, 999, true],
  [999, 11, false],
  [2, 999, false],
  [2, 12, true],
  [2, 11, false],
])(
  "topic assignment ignores missing records or unchanged membership (%s, %s, %s)",
  (taskId, topicId, assigned) => {
    const data = makeData();
    const before = JSON.stringify(data);
    expect(
      setTaskTopicV1Pure(data.topics, data.tasks, taskId, topicId, assigned)
    ).toBe(data.tasks);
    expect(JSON.stringify(data)).toBe(before);
  }
);

test("independent topic assignments compose and preserve unknown memberships", () => {
  const data = makeData();
  data.tasks[1] = {
    ...data.tasks[1],
    topics: [12, 999],
    topicViewIndices: [7, 4],
  };
  const first = setTaskTopicV1Pure(data.topics, data.tasks, 2, 11, true);
  const second = setTaskTopicV1Pure(data.topics, first, 2, 14, true);
  const third = setTaskTopicV1Pure(data.topics, second, 2, 11, false);
  expect(third[1].topics).toEqual([12, 999, 14]);
  expect(third[1].topicViewIndices).toEqual([7, 4, 1]);
  expect(second[1].topics).toEqual([12, 999, 11, 14]);
});

test("empty lists, empty tag options, and cyclic task references render safely", () => {
  const { unmount } = render(
    <Harness initialData={{ tasks: [], topics: [] }} />
  );
  expect(screen.getByText("No tasks yet.")).toBeVisible();
  unmount();
  const cycle = {
    topics: [],
    tasks: [
      makeTask(1, "Cycle A", { subTaskIds: [2] }),
      makeTask(2, "Cycle B", { subTaskIds: [1] }),
    ],
  };
  render(<Harness initialData={cycle} />);
  expect(topRows()).toHaveLength(2);
  fireEvent.click(screen.getAllByRole("button", { name: "+Tag" })[0]);
  expect(screen.getByText("No tags available.")).toBeVisible();
});

test("tag hierarchy paths distinguish matching names", () => {
  expect(
    getSelectableTags(makeData().topics)
      .filter((tag) => tag.name === "Kopen")
      .map((tag) => tag.path)
  ).toEqual(["Activiteiten/Kopen", "Werk/Kopen"]);
});
