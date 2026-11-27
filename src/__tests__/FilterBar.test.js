import React, { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";
import AppV2 from "../AppV2";
import TaskList from "../TaskViews/TaskList";
import PlannedList from "../TaskViews/PlannedList";
import AllTasksList from "../TaskViews/AllTasksList";
import TaskGraphView from "../TaskViews/TaskGraphView";
import { TaskListV2 } from "../TaskViews/TaskListV2.tsx";
import FilterBar from "../Filters/FilterBar";
import { useTaskFilter } from "../Filters/useTaskFilter";
import { View } from "../Structure/View";
import { filterTasks } from "../Filters/taskFilter";
import { createFilterSettings } from "../Filters/filterSettings";
import { adaptV1FilterData } from "../Filters/filterData";

const openGroup = (title) => {
  const summary = screen.getByText(title, { selector: "summary" });
  if (!summary.parentElement.open) fireEvent.click(summary);
};

jest.mock("../Tasks/TaskContainer.tsx", () => ({ task }) => (
  <span>{task.name}</span>
));
jest.mock("../Tasks/PlannedTask.jsx", () => ({ taskName }) => (
  <span>{taskName}</span>
));
jest.mock("../Topics/TopicContainer.tsx", () => ({ topic }) => (
  <span>{topic.name}</span>
));
jest.mock("../Tasks/TaskContainerV2.tsx", () => ({ taskId, appData }) => (
  <span>{appData.taskMap[taskId].name}</span>
));
jest.mock("../Tags/TagContainerV2.tsx", () => ({ tagId, appData }) => (
  <span>{appData.tagMap[tagId].name}</span>
));

const task = (id, name, extra = {}) => ({
  id,
  name,
  topics: [],
  topicViewIndices: [],
  subTaskIds: [],
  finishStatus: 0,
  thisWeek: false,
  weekOrderIndex: 0,
  unfolded: true,
  ...extra,
});
const data = {
  topics: [
    {
      id: 10,
      name: "Work",
      subtopics: [{ id: 11, name: "Projects", subtopics: [] }],
      unfolded: true,
    },
  ],
  tasks: [task(1, "Invoice", { topics: [11] }), task(2, "Groceries")],
};

function Results({
  view = View.VIEW_TAG_ALL_TASKS,
  initialData = data,
  initialSettings,
}) {
  const [filterSettings, setFilterSettings] = useState(initialSettings);
  const taskFilter = useTaskFilter(
    initialData,
    view,
    filterSettings,
    setFilterSettings
  );
  return (
    <>
      <FilterBar taskFilter={taskFilter} />
      <output data-testid="visible-tasks">
        {initialData.tasks
          .filter(taskFilter.isTaskVisible)
          .map(({ id }) => id)
          .join(",")}
      </output>
      <output data-testid="visible-tags">
        {taskFilter.selectableTags
          .filter(taskFilter.isTagVisible)
          .map(({ id }) => id)
          .join(",")}
      </output>
    </>
  );
}

function FilterableView({ Component, ...props }) {
  const [filterSettings, setFilterSettings] = useState(undefined);
  return (
    <Component
      {...props}
      filterSettings={filterSettings}
      setFilterSettings={setFilterSettings}
    />
  );
}

test("real view switches preserve independent filters, and reset restores view defaults", () => {
  const { unmount } = render(<App />);
  fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
    target: { value: "repair" },
  });
  fireEvent.click(screen.getByRole("heading", { name: "4. Prioritize" }));
  expect(screen.getByPlaceholderText("Search tasks")).toHaveValue("");
  expect(
    screen.queryByRole("combobox", { name: "Planned" })
  ).not.toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
    target: { value: "write" },
  });
  fireEvent.click(screen.getByRole("heading", { name: "2. Categorize" }));
  expect(screen.getByPlaceholderText("Search tasks")).toHaveValue("repair");
  openGroup("Task filters");
  expect(screen.getByRole("combobox", { name: "Planned" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getByPlaceholderText("Search tasks")).toHaveValue("");
  openGroup("Status");
  expect(
    screen.getByRole("checkbox", { name: "Unfinished", exact: true })
  ).toBePartiallyChecked();
  expect(
    screen.getByRole("checkbox", {
      name: "Automatically irrelevant",
      exact: true,
    })
  ).not.toBeChecked();
  expect(
    screen.getByRole("checkbox", { name: "Completed", exact: true })
  ).not.toBeChecked();
  fireEvent.click(screen.getByRole("heading", { name: "4. Prioritize" }));
  expect(screen.getByPlaceholderText("Search tasks")).toHaveValue("write");
  unmount();
  render(<App />);
  expect(screen.getByPlaceholderText("Search tasks")).toHaveValue("");
});

test("AppV2 retains per-view edits and resets to the same Categorize defaults", () => {
  render(<AppV2 />);
  fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
    target: { value: "invoice" },
  });
  fireEvent.click(screen.getByRole("heading", { name: "4. Prioritize" }));
  expect(screen.queryByPlaceholderText("Search tasks")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("heading", { name: "2. Categorize" }));
  expect(screen.getByPlaceholderText("Search tasks")).toHaveValue("invoice");
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getByPlaceholderText("Search tasks")).toHaveValue("");
  openGroup("Status");
  expect(
    screen.getByRole("checkbox", { name: "Unfinished", exact: true })
  ).toBePartiallyChecked();
  expect(
    screen.getByRole("checkbox", { name: "Finished", exact: true })
  ).not.toBeChecked();
});

test("partial label search produces exact removable chips without changing the task data", () => {
  const before = JSON.stringify(data);
  render(<Results />);
  fireEvent.change(screen.getByPlaceholderText("Search tags"), {
    target: { value: "roj" },
  });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2$/);
  fireEvent.click(screen.getByRole("button", { name: "Work/Projects" }));
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent("1");
  expect(screen.getByPlaceholderText("Search tags")).toHaveValue("");
  fireEvent.click(screen.getByRole("button", { name: "Work/Projects ×" }));
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent("1,2");
  expect(JSON.stringify(data)).toBe(before);
});

test("tag matching defaults to every selected tag and can switch to any tag", () => {
  const initialData = {
    topics: [...data.topics, { id: 20, name: "Home", subtopics: [] }],
    tasks: [
      task(1, "Work only", { topics: [11] }),
      task(2, "Home only", { topics: [20] }),
      task(3, "Work and home", { topics: [11, 20] }),
      task(4, "No tags"),
    ],
  };
  const before = JSON.stringify(initialData);
  render(<Results initialData={initialData} />);
  for (const label of ["Work/Projects", "Home"]) {
    fireEvent.change(screen.getByPlaceholderText("Search tags"), {
      target: { value: label },
    });
    fireEvent.click(screen.getByRole("button", { name: label, exact: true }));
  }
  openGroup("Tag matching");
  const matchMode = screen.getByRole("combobox", { name: "Show tasks that match" });
  expect(matchMode).toHaveValue("every");
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^3$/);
  fireEvent.change(matchMode, { target: { value: "any" } });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2,3$/);
  fireEvent.change(matchMode, { target: { value: "every" } });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^3$/);
  fireEvent.change(matchMode, { target: { value: "any" } });
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  openGroup("Tag matching");
  expect(matchMode).toHaveValue("every");
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2,3,4$/);
  expect(JSON.stringify(initialData)).toBe(before);
});

test("Add view ignores unsupported tag, structure, context and presentation settings", () => {
  const initialData = {
    topics: [...data.topics, { id: 30, name: "Empty", subtopics: [] }],
    tasks: [
      task(1, "Invoice", { topics: [11], subTaskIds: [2] }),
      task(2, "Groceries"),
    ],
  };
  const initialSettings = createFilterSettings({
    match: {
      tasks: { tagged: "no", structure: "standalone" },
      tags: { selectedIds: [999], pathQuery: "absent" },
    },
    context: { tasks: "both", tags: { includeSubtags: true } },
    presentation: { tags: "all" },
  });
  render(
    <Results
      view={View.VIEW_ADD_TASKS}
      initialData={initialData}
      initialSettings={initialSettings}
    />
  );
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent("1,2");
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11$/);
  openGroup("Task filters");
  expect(
    screen.queryByRole("combobox", { name: "Task relation" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: "Has tags", exact: true })
  ).not.toBeInTheDocument();
  expect(screen.queryByPlaceholderText("Search tags")).not.toBeInTheDocument();
});

test("search and ancestor context do not unfold tasks or tags", () => {
  const initial = {
    topics: [],
    tasks: [
      task(1, "Parent", { subTaskIds: [2], unfolded: false }),
      task(2, "Child"),
    ],
  };
  function Harness() {
    const [appData, setAppData] = useState(initial);
    const [filterSettings, setFilterSettings] = useState(undefined);
    return (
      <TaskList
        appData={appData}
        setAppData={setAppData}
        filterSettings={filterSettings}
        setFilterSettings={setFilterSettings}
      />
    );
  }
  render(<Harness />);
  fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
    target: { value: "child" },
  });
  openGroup("Display");
  fireEvent.change(screen.getByRole("combobox", { name: "Show tasks" }), {
    target: { value: "ancestors" },
  });
  expect(screen.getByText("Parent")).toBeVisible();
  expect(screen.queryByText("Child")).not.toBeInTheDocument();
  expect(initial.tasks[0].unfolded).toBe(false);
});

test("Planned retains its root membership and existing display of unplanned subtasks", () => {
  const initial = {
    topics: [],
    tasks: [
      task(1, "Planned root", {
        thisWeek: true,
        weekOrderIndex: 1,
        subTaskIds: [2],
      }),
      task(2, "Unplanned child"),
      task(3, "Unplanned root"),
    ],
  };
  function Harness() {
    const [appData, setAppData] = useState(initial);
    const [filterSettings, setFilterSettings] = useState(undefined);
    return (
      <PlannedList
        appData={appData}
        setAppData={setAppData}
        filterSettings={filterSettings}
        setFilterSettings={setFilterSettings}
      />
    );
  }
  render(<Harness />);
  expect(screen.getByText("Planned root")).toBeVisible();
  expect(screen.getByText("Unplanned child")).toBeVisible();
  expect(screen.queryByText("Unplanned root")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: "Planned" })
  ).not.toBeInTheDocument();
});

test.each([AllTasksList, TaskGraphView])(
  "%p consumes the shared filter without changing source tasks",
  (Component) => {
    const before = JSON.stringify(data);
    render(
      <FilterableView
        Component={Component}
        appData={data}
        setAppData={jest.fn()}
      />
    );
    expect(screen.getByText("Groceries")).toBeVisible();
    fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
      target: { value: "inv" },
    });
    expect(screen.getByText("Invoice")).toBeVisible();
    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
      target: { value: "unmatched" },
    });
    expect(screen.getByText("No matching tasks.")).toBeVisible();
    expect(JSON.stringify(data)).toBe(before);
  }
);

test("the tag-map view uses the same filter bar and ID matching", () => {
  const appData = {
    taskMap: Object.fromEntries(
      data.tasks.map((entry) => [
        entry.id,
        {
          ...entry,
          childTaskIds: [],
          parentTaskIds: [],
        },
      ])
    ),
    tagMap: {
      10: {
        id: 10,
        name: "Work",
        childTagIds: [11],
        parentTagIds: [],
        unfolded: true,
      },
      11: {
        id: 11,
        name: "Projects",
        childTagIds: [],
        parentTagIds: [10],
        unfolded: true,
      },
    },
    tagTasksMap: { 10: [], 11: [1] },
    plannedTaskIdList: [],
  };
  render(
    <FilterableView
      Component={TaskListV2}
      appData={appData}
      setAppData={jest.fn()}
    />
  );
  fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
    target: { value: "gro" },
  });
  expect(screen.getByText("Groceries")).toBeVisible();
  expect(screen.queryByText("Invoice")).not.toBeInTheDocument();
});

test("status groups toggle their subtypes and the unfinished remainder stays implicit", () => {
  const initialData = {
    topics: [],
    tasks: [
      task(1, "Finished", { finishStatus: 1, subTaskIds: [2] }),
      task(2, "Excluded branch", { subTaskIds: [3] }),
      task(3, "Rescued"),
      task(4, "Independent", { subTaskIds: [3] }),
      task(5, "Irrelevant task", { finishStatus: 2 }),
      task(6, "Impossible task", { finishStatus: 3 }),
    ],
  };
  render(<Results initialData={initialData} />);
  openGroup("Status");
  expect(
    screen
      .getByText("Status", { selector: "summary" })
      .parentElement.querySelectorAll('input[type="checkbox"]')
  ).toHaveLength(6);
  expect(screen.queryByText("Hide finished tasks")).not.toBeInTheDocument();
  expect(
    screen.queryByText("Hide transitively irrelevant tasks")
  ).not.toBeInTheDocument();
  const unfinishedGroup = screen.getByRole("checkbox", {
    name: "Unfinished",
    exact: true,
  });
  const finishedGroup = screen.getByRole("checkbox", {
    name: "Finished",
    exact: true,
  });
  const transitiveSubtype = screen.getByRole("checkbox", {
    name: "Automatically irrelevant",
    exact: true,
  });
  fireEvent.click(finishedGroup);
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^2,3,4$/);
  for (const name of ["Completed", "Irrelevant", "Impossible"])
    expect(
      screen.getByRole("checkbox", { name, exact: true })
    ).not.toBeChecked();
  fireEvent.click(transitiveSubtype);
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent("3,4");
  expect(unfinishedGroup).toBePartiallyChecked();
  fireEvent.click(unfinishedGroup);
  expect(unfinishedGroup).toBeChecked();
  expect(transitiveSubtype).toBeChecked();
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^2,3,4$/);
  fireEvent.click(unfinishedGroup);
  expect(screen.getByTestId("visible-tasks")).toBeEmptyDOMElement();
  fireEvent.click(transitiveSubtype);
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent("2");
  expect(unfinishedGroup).toBePartiallyChecked();
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Completed", exact: true })
  );
  expect(finishedGroup).toBePartiallyChecked();
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2$/);
  fireEvent.click(finishedGroup);
  expect(finishedGroup).toBeChecked();
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2,5,6$/);
  fireEvent.click(finishedGroup);
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^2$/);
});

test("nested changes preserve neighboring settings and reset restores the full view profile", () => {
  render(<Results view={View.VIEW_ALL_TASKS} />);
  fireEvent.change(screen.getByPlaceholderText("Search tags"), {
    target: { value: "projects" },
  });
  fireEvent.keyDown(screen.getByPlaceholderText("Search tags"), {
    key: "Enter",
  });
  fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
    target: { value: "invoice" },
  });
  openGroup("Tag matching");
  expect(
    screen.getByRole("checkbox", { name: "Also match tags on supertasks" })
  ).toBeChecked();
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Also match tags on supertasks" })
  );
  fireEvent.change(screen.getByRole("combobox", { name: "Show tasks that match" }), {
    target: { value: "any" },
  });
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Include tasks with subtags" })
  );
  openGroup("Task filters");
  fireEvent.change(screen.getByRole("combobox", { name: "Repeats" }), {
    target: { value: "no" },
  });
  fireEvent.change(
    screen.getByRole("combobox", { name: "Has tags", exact: true }),
    {
      target: { value: "yes" },
    }
  );
  fireEvent.change(screen.getByRole("combobox", { name: "Deadline" }), {
    target: { value: "missing" },
  });
  openGroup("Display");
  fireEvent.change(screen.getByRole("combobox", { name: "Show tasks" }), {
    target: { value: "none" },
  });
  fireEvent.change(screen.getByRole("combobox", { name: "Show tags" }), {
    target: { value: "relevant" },
  });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent("1");
  expect(
    screen.getByRole("checkbox", { name: "Also match tags on supertasks" })
  ).not.toBeChecked();
  expect(screen.getByRole("combobox", { name: "Show tasks that match" })).toHaveValue(
    "any"
  );
  expect(
    screen.getByRole("combobox", { name: "Has tags", exact: true })
  ).toHaveValue("yes");
  expect(
    screen.getByRole("checkbox", { name: "Include tasks with subtags" })
  ).not.toBeChecked();
  expect(screen.getByRole("button", { name: "Work/Projects ×" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getByPlaceholderText("Search tasks")).toHaveValue("");
  expect(
    screen.queryByRole("button", { name: "Work/Projects ×" })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Also match tags on supertasks" })
  ).toBeChecked();
  expect(screen.getByRole("combobox", { name: "Show tasks that match" })).toHaveValue(
    "every"
  );
  expect(
    screen.getByRole("combobox", { name: "Has tags", exact: true })
  ).toHaveValue("any");
  expect(screen.getByRole("combobox", { name: "Repeats" })).toHaveValue("any");
  expect(screen.getByRole("combobox", { name: "Deadline" })).toHaveValue("any");
  expect(screen.getByRole("combobox", { name: "Show tasks" })).toHaveValue(
    "both"
  );
  expect(screen.getByRole("combobox", { name: "Show tags" })).toHaveValue(
    "automatic"
  );
  expect(
    screen.getByRole("checkbox", { name: "Include tasks with subtags" })
  ).toBeChecked();
});

test("tagged and untagged choices use supertask tags only when requested", () => {
  const initialData = {
    topics: [...data.topics, { id: 20, name: "Home", subtopics: [] }],
    tasks: [
      task(1, "Work project", { topics: [10], subTaskIds: [2] }),
      task(2, "Subtask without its own tags"),
      task(3, "Standalone without tags"),
      task(4, "Home task", { topics: [20] }),
    ],
  };
  const before = JSON.stringify(initialData);
  render(<Results initialData={initialData} />);
  openGroup("Task filters");
  const tagChoice = screen.getByRole("combobox", {
    name: "Has tags",
    exact: true,
  });
  expect(tagChoice).toHaveValue("any");
  fireEvent.change(tagChoice, { target: { value: "no" } });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^2,3$/);

  openGroup("Tag matching");
  const supertaskTags = screen.getByRole("checkbox", {
    name: "Also match tags on supertasks",
  });
  fireEvent.click(supertaskTags);
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^3$/);

  openGroup("Task filters");
  fireEvent.change(tagChoice, { target: { value: "yes" } });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2,4$/);
  openGroup("Tag matching");
  fireEvent.click(supertaskTags);
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,4$/);

  openGroup("Task filters");
  fireEvent.change(tagChoice, { target: { value: "any" } });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2,3,4$/);
  expect(JSON.stringify(initialData)).toBe(before);
});

test("automatic follows searches and selected tags while task filters keep browsing mode", () => {
  const initialData = {
    topics: [
      ...data.topics,
      { id: 20, name: "Home", subtopics: [] },
      { id: 30, name: "Empty", subtopics: [] },
    ],
    tasks: [
      task(1, "Invoice", { topics: [11] }),
      task(2, "Groceries", { topics: [20] }),
    ],
  };
  render(<Results view={View.VIEW_ALL_TASKS} initialData={initialData} />);
  openGroup("Display");
  const showTags = screen.getByRole("combobox", { name: "Show tags" });
  const showSubtags = screen.getByRole("checkbox", {
    name: "Show subtags in results",
  });
  expect(showTags).toHaveValue("automatic");
  expect(Array.from(showTags.options, (option) => option.text)).toEqual([
    "Automatic",
    "All tags",
    "Relevant tags",
    "Tags with visible tasks",
  ]);
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11,20,30$/);
  expect(showSubtags).toBeDisabled();

  openGroup("Task filters");
  fireEvent.change(screen.getByRole("combobox", { name: "Planned" }), {
    target: { value: "yes" },
  });
  expect(screen.getByTestId("visible-tasks")).toBeEmptyDOMElement();
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11,20,30$/);
  fireEvent.change(screen.getByRole("combobox", { name: "Planned" }), {
    target: { value: "any" },
  });

  fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
    target: { value: "invoice" },
  });
  openGroup("Display");
  expect(showTags).toHaveValue("automatic");
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11$/);
  expect(showSubtags).toBeDisabled();
  fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
    target: { value: "" },
  });
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11,20,30$/);

  const tagInput = screen.getByPlaceholderText("Search tags");
  fireEvent.change(tagInput, { target: { value: "Projects" } });
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11$/);
  expect(showSubtags).toBeEnabled();
  fireEvent.keyDown(tagInput, { key: "Enter" });
  expect(tagInput).toHaveValue("");
  expect(showSubtags).toBeEnabled();
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11$/);
  fireEvent.click(screen.getByRole("button", { name: "Work/Projects ×" }));
  openGroup("Display");
  expect(showTags).toHaveValue("automatic");
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11,20,30$/);
  expect(showSubtags).toBeDisabled();
});

test("tag policies preserve subtag preferences while disabling ineffective context", () => {
  const initialData = {
    topics: [
      {
        id: 10,
        name: "Work",
        subtopics: [{ id: 11, name: "Empty", subtopics: [] }],
      },
      { id: 20, name: "Home", subtopics: [] },
      { id: 30, name: "Other", subtopics: [] },
    ],
    tasks: [
      task(1, "Send invoice", { topics: [10, 20] }),
      task(2, "Renovate office", { topics: [10] }),
    ],
  };
  render(<Results view={View.VIEW_ALL_TASKS} initialData={initialData} />);
  openGroup("Tag matching");
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Include tasks with subtags" })
  );
  fireEvent.change(screen.getByPlaceholderText("Search tags"), {
    target: { value: "Work" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Work", exact: true }));
  fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
    target: { value: "invoice" },
  });
  openGroup("Display");
  fireEvent.change(screen.getByRole("combobox", { name: "Show tags" }), {
    target: { value: "relevant" },
  });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1$/);
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,20$/);
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Show subtags in results" })
  );
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11,20$/);
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1$/);
  fireEvent.change(screen.getByRole("combobox", { name: "Show tags" }), {
    target: { value: "all" },
  });
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11,20,30$/);
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1$/);
  const showSubtags = screen.getByRole("checkbox", {
    name: "Show subtags in results",
  });
  expect(showSubtags).toBeChecked();
  expect(showSubtags).toBeDisabled();

  fireEvent.change(screen.getByRole("combobox", { name: "Show tags" }), {
    target: { value: "withVisibleTasks" },
  });
  expect(showSubtags).toBeDisabled();
  expect(showSubtags).toBeChecked();
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,20$/);
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1$/);

  fireEvent.change(screen.getByRole("combobox", { name: "Show tags" }), {
    target: { value: "relevant" },
  });
  expect(showSubtags).toBeEnabled();
  expect(showSubtags).toBeChecked();
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,11,20$/);
  fireEvent.click(screen.getByRole("button", { name: "Work ×" }));
  openGroup("Display");
  expect(showSubtags).toBeDisabled();
  expect(showSubtags).toBeChecked();
  expect(screen.getByRole("combobox", { name: "Show tags" })).toHaveValue(
    "relevant"
  );
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10,20$/);
});

test("unsupported stored settings are neutralized and empty groups are omitted", () => {
  const initialData = {
    topics: [...data.topics, { id: 30, name: "Empty", subtopics: [] }],
    tasks: [
      task(1, "Invoice", { topics: [10], subTaskIds: [2] }),
      task(2, "Groceries"),
    ],
  };
  const initialSettings = createFilterSettings({
    match: {
      tasks: { text: "Invoice", planned: "yes", structure: "standalone" },
      tags: { selectedIds: [10], includeSubtags: false, pathQuery: "absent" },
    },
    context: { tasks: "both", tags: { includeSubtags: true } },
    presentation: { tags: "all" },
  });
  render(
    <Results
      view={View.VIEW_PLANNED_TASKS}
      initialData={initialData}
      initialSettings={initialSettings}
    />
  );
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1$/);
  expect(screen.getByTestId("visible-tags")).toHaveTextContent(/^10$/);
  openGroup("Task filters");
  expect(
    screen.queryByRole("combobox", { name: "Planned" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: "Task relation" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText("Display", { selector: "summary" })
  ).not.toBeInTheDocument();
});

test.each([TaskList, TaskListV2])(
  "%p retains empty tag matches in Automatic and Relevant, and hides them in strict mode",
  (Component) => {
    const initialData =
      Component === TaskList
        ? {
            topics: [
              {
                id: 10,
                name: "Work",
                unfolded: true,
                subtopics: [
                  { id: 11, name: "Empty", unfolded: true, subtopics: [] },
                ],
              },
            ],
            tasks: [],
          }
        : {
            taskMap: {},
            tagMap: {
              10: {
                id: 10,
                name: "Work",
                childTagIds: [11],
                parentTagIds: [],
                unfolded: true,
              },
              11: {
                id: 11,
                name: "Empty",
                childTagIds: [],
                parentTagIds: [10],
                unfolded: true,
              },
            },
            tagTasksMap: { 10: [], 11: [] },
            plannedTaskIdList: [],
          };
    render(
      <FilterableView
        Component={Component}
        appData={initialData}
        setAppData={jest.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText("Search tags"), {
      target: { value: "Empty" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Work/Empty" }));
    fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
      target: { value: "invoice" },
    });
    openGroup("Display");
    const showTags = screen.getByRole("combobox", { name: "Show tags" });
    expect(showTags).toHaveValue("automatic");
    expect(screen.getByText("Work", { selector: "span" })).toBeVisible();
    expect(screen.getByText("Empty", { selector: "span" })).toBeVisible();
    fireEvent.change(showTags, {
      target: { value: "withVisibleTasks" },
    });
    expect(
      screen.queryByText("Work", { selector: "span" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Empty", { selector: "span" })
    ).not.toBeInTheDocument();
    fireEvent.change(showTags, {
      target: { value: "relevant" },
    });
    expect(screen.getByText("Work", { selector: "span" })).toBeVisible();
    expect(screen.getByText("Empty", { selector: "span" })).toBeVisible();
  }
);

test("batched status changes preserve ordinary unfinished tasks and the transitive selection", () => {
  const initialSettings = createFilterSettings();
  initialSettings.match.tasks.statuses = ["unfinished"];
  const initialData = {
    topics: [],
    tasks: [
      task(1, "Finished root", { finishStatus: 1, subTaskIds: [2] }),
      task(2, "Inactive child", { subTaskIds: [3] }),
      task(3, "Inactive descendant"),
      task(4, "Ordinary unfinished"),
    ],
  };
  render(
    <Results initialData={initialData} initialSettings={initialSettings} />
  );
  openGroup("Status");
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^4$/);

  act(() => {
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Automatically irrelevant",
        exact: true,
      })
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Completed", exact: true })
    );
  });
  expect(
    screen.getByRole("checkbox", { name: "Unfinished", exact: true })
  ).toBeChecked();
  expect(
    screen.getByRole("checkbox", {
      name: "Automatically irrelevant",
      exact: true,
    })
  ).toBeChecked();
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2,3,4$/);

  act(() => {
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Automatically irrelevant",
        exact: true,
      })
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Completed", exact: true })
    );
  });
  expect(
    screen.getByRole("checkbox", { name: "Unfinished", exact: true })
  ).toBePartiallyChecked();
  expect(
    screen.getByRole("checkbox", {
      name: "Automatically irrelevant",
      exact: true,
    })
  ).not.toBeChecked();
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^4$/);
});

test.each([false, true])(
  "queued checkbox updates preserve other statuses (initially selected: %s)",
  (initiallySelected) => {
    const initialSettings = createFilterSettings();
    const originalStatuses = initiallySelected
      ? ["unfinished", "transitivelyIrrelevant", "completed"]
      : ["unfinished"];
    initialSettings.match.tasks.statuses = originalStatuses;
    const initialData = adaptV1FilterData({
      topics: [],
      tasks: [
        task(1, "Finished parent", { finishStatus: 1, subTaskIds: [2] }),
        task(2, "Transitively irrelevant child"),
        task(3, "Ordinary unfinished"),
      ],
    });
    const updates = [];
    render(
      <FilterBar
        taskFilter={{
          ...filterTasks(initialData, initialSettings),
          settings: initialSettings,
          features: ["status"],
          selectableTags: [],
          setFilterSettingsWithDefaults: (update) => updates.push(update),
          reset: jest.fn(),
        }}
      />
    );
    openGroup("Status");
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Automatically irrelevant",
        exact: true,
      })
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Completed", exact: true })
    );

    const combined = updates.reduce(
      (previous, update) => update(previous),
      initialSettings
    );
    expect(new Set(combined.match.tasks.statuses)).toEqual(
      new Set(
        initiallySelected
          ? ["unfinished"]
          : ["unfinished", "transitivelyIrrelevant", "completed"]
      )
    );
    expect(
      initialData.tasks
        .filter(filterTasks(initialData, combined).isTaskVisible)
        .map(({ id }) => id)
    ).toEqual(initiallySelected ? [3] : [1, 2, 3]);
    expect(initialSettings.match.tasks.statuses).toEqual(originalStatuses);
  }
);

test("queued tag additions and removal use the latest selected IDs", () => {
  const initialSettings = createFilterSettings({
    match: { tags: { selectedIds: [10] } },
  });
  const initialData = adaptV1FilterData({
    ...data,
    topics: [...data.topics, { id: 20, name: "Home", subtopics: [] }],
  });
  const updates = [];
  render(
    <FilterBar
      taskFilter={{
        ...filterTasks(initialData, initialSettings),
        settings: initialSettings,
        features: ["tagSelection"],
        setFilterSettingsWithDefaults: (update) => updates.push(update),
        reset: jest.fn(),
      }}
    />
  );

  // Keep the rendered settings unchanged while collecting the queued edits.
  for (const [query, label] of [
    ["Projects", "Work/Projects"],
    ["Home", "Home"],
  ]) {
    fireEvent.change(screen.getByPlaceholderText("Search tags"), {
      target: { value: query },
    });
    fireEvent.click(screen.getByRole("button", { name: label, exact: true }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Work ×" }));

  const latestSettings = createFilterSettings({
    match: {
      tasks: { text: "newer search" },
      tags: {
        selectedIds: [10],
        includeSubtags: false,
        pathQuery: "newer path",
      },
    },
  });
  const afterAdditions = updates
    .slice(0, 2)
    .reduce((previous, update) => update(previous), latestSettings);
  expect(afterAdditions.match.tags.selectedIds).toEqual([10, 11, 20]);
  const afterRemoval = updates[2](afterAdditions);
  expect(afterRemoval.match.tags.selectedIds).toEqual([11, 20]);
  expect(afterRemoval.match.tasks.text).toBe("newer search");
  expect(afterRemoval.match.tags.includeSubtags).toBe(false);
  expect(afterRemoval.match.tags.pathQuery).toBe("");
  expect(initialSettings.match.tags.selectedIds).toEqual([10]);
  expect(latestSettings.match.tags.selectedIds).toEqual([10]);
});

test("one tag input filters paths, selects exact tags, clears and resets without duplicate labels", () => {
  const initialData = {
    topics: [...data.topics, { id: 20, name: "Home", subtopics: [] }],
    tasks: [
      task(1, "Invoice", { topics: [11] }),
      task(2, "Groceries", { topics: [20] }),
      task(3, "Uncategorized"),
    ],
  };
  const before = JSON.stringify(initialData);
  render(<Results view={View.VIEW_ALL_TASKS} initialData={initialData} />);
  const tagInput = screen.getByPlaceholderText("Search tags");
  expect(screen.getAllByRole("searchbox")).toHaveLength(2);
  expect(screen.queryByText("Search tasks")).not.toBeInTheDocument();
  expect(screen.queryByText("Search tags")).not.toBeInTheDocument();
  expect(screen.getAllByPlaceholderText("Search tags")).toHaveLength(1);

  fireEvent.change(tagInput, { target: { value: "o" } });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2$/);
  expect(
    screen.getByRole("button", { name: "Home", exact: true })
  ).toBeVisible();
  fireEvent.change(tagInput, { target: { value: "Projects" } });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1$/);
  fireEvent.keyDown(tagInput, { key: "Enter" });
  expect(tagInput).toHaveValue("");
  expect(screen.getByRole("button", { name: "Work/Projects ×" })).toBeVisible();
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1$/);
  fireEvent.click(screen.getByRole("button", { name: "Work/Projects ×" }));
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2,3$/);

  fireEvent.change(tagInput, { target: { value: "absent" } });
  expect(screen.getByTestId("visible-tasks")).toBeEmptyDOMElement();
  expect(screen.getByText("No tags found.")).toBeVisible();
  fireEvent.keyDown(tagInput, { key: "Escape" });
  expect(tagInput).toHaveValue("");
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2,3$/);
  fireEvent.change(tagInput, { target: { value: "Home" } });
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^2$/);
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(tagInput).toHaveValue("");
  expect(screen.getByTestId("visible-tasks")).toHaveTextContent(/^1,2,3$/);
  expect(JSON.stringify(initialData)).toBe(before);
});
