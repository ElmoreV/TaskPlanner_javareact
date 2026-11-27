import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import App from "../App";
import TaskGraphView from "../TaskViews/TaskGraphView";

const makeTask = (id, name, extra = {}) => ({
  id,
  name,
  subTaskIds: [],
  topics: [],
  unfolded: false,
  finishStatus: 0,
  ...extra,
});
const makeData = () => ({
  topics: [],
  tasks: [
    makeTask(0, "Root", { subTaskIds: [1, 2] }),
    makeTask(1, "Parent", { subTaskIds: [2] }),
    makeTask(
      2,
      "Shared child with a very long title that should be truncated",
      { completed: true }
    ),
    makeTask(3, "Isolated", { finishStatus: 2 }),
    makeTask(4, "Impossible task", { finishStatus: 3 }),
  ],
});
let viewportWidth;
let resizeCallback;
let observe;
let disconnect;
const originalResizeObserver = global.ResizeObserver;
const originalPointerEvent = window.PointerEvent;

beforeEach(() => {
  viewportWidth = 1000;
  observe = jest.fn();
  disconnect = jest.fn();
  global.ResizeObserver = jest.fn().mockImplementation((callback) => {
    resizeCallback = callback;
    return { observe, disconnect };
  });
  jest
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(() => ({
      width: viewportWidth,
      height: 500,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: viewportWidth,
      bottom: 500,
    }));
  // jsdom does not implement PointerEvent; retain mouse coordinates and pointer ID.
  window.PointerEvent = class extends MouseEvent {
    constructor(type, init) {
      super(type, init);
      this.pointerId = init.pointerId;
    }
  };
});

afterEach(() => {
  jest.restoreAllMocks();
  global.ResizeObserver = originalResizeObserver;
  window.PointerEvent = originalPointerEvent;
});

const canvas = () => screen.getByRole("group", { name: "Task graph canvas" });
// Geometry checks need the scene transform and SVG paths, which have no roles.
// eslint-disable-next-line testing-library/no-node-access
const scene = () => canvas().firstElementChild;
// eslint-disable-next-line testing-library/no-node-access
const edges = () => [...canvas().querySelectorAll("path[data-source]")];

test("the new selector opens the graph and returns to the existing views", () => {
  render(<App />);
  expect(
    screen.queryByRole("region", { name: "Task graph" })
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Task graph", exact: true })
  );
  expect(screen.getByRole("region", { name: "Task graph" })).toBeVisible();
  expect(within(canvas()).getAllByRole("button")).toHaveLength(4);
  fireEvent.click(
    screen.getByRole("heading", { name: "All tasks", exact: true })
  );
  expect(
    screen.queryByRole("region", { name: "Task graph" })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("region", { name: "All tasks" })).toBeVisible();
  fireEvent.click(
    screen.getByRole("heading", { name: "2. Categorize", exact: true })
  );
  expect(
    screen.queryByRole("region", { name: "All tasks" })
  ).not.toBeInTheDocument();
});

test("all tasks render once regardless of folding, tags, or completion", () => {
  render(<TaskGraphView appData={makeData()} />);
  expect(within(canvas()).getAllByRole("button")).toHaveLength(5);
  expect(edges()).toHaveLength(3);
  const shared = within(canvas()).getByRole("button", {
    name: /Shared child.*Completed/,
  });
  expect(shared).toHaveClass("completed");
  expect(shared).toHaveAttribute(
    "title",
    "Shared child with a very long title that should be truncated — Completed"
  );
  expect(shared.textContent).toBe(
    "Shared child with a very long title that should be truncated"
  );
  expect(within(shared).getByText(/Shared child/)).toHaveClass("title");
  expect(
    within(canvas()).getByRole("button", { name: "Isolated — Irrelevant" })
  ).toHaveClass("irrelevant");
  expect(
    within(canvas()).getByRole("button", {
      name: "Impossible task — Impossible",
    })
  ).toHaveClass("impossible");
  expect(
    within(canvas()).getByRole("button", { name: "Root — Unfinished" })
  ).toHaveClass("unfinished");
  expect(
    within(
      screen.getByRole("list", { name: "Task status legend" })
    ).getAllByRole("listitem")
  ).toHaveLength(4);
});

test("selection highlights only direct connections and Escape clears it", () => {
  render(<TaskGraphView appData={makeData()} />);
  const shared = within(canvas()).getByRole("button", { name: /Shared child/ });
  fireEvent.click(shared);
  expect(shared).toHaveAttribute("aria-pressed", "true");
  expect(
    edges().filter((edge) => edge.dataset.highlighted === "true")
  ).toHaveLength(2);
  expect(
    within(canvas()).getByRole("button", { name: "Root — Unfinished" })
  ).toHaveAttribute("data-connected", "true");
  expect(
    within(canvas()).getByRole("button", { name: "Isolated — Irrelevant" })
  ).toHaveAttribute("data-connected", "false");
  expect(
    screen.getByText("Completed", {
      selector: "div[aria-live] span",
    })
  ).toBeVisible();
  expect(
    screen.getByText(
      "Shared child with a very long title that should be truncated",
      { selector: "strong" }
    )
  ).toBeVisible();
  fireEvent.keyDown(shared, { key: "Escape" });
  expect(shared).toHaveAttribute("aria-pressed", "false");
  expect(edges().every((edge) => edge.dataset.highlighted === "false")).toBe(
    true
  );
  expect(
    screen.getByText("Select a task to see its full title and status.")
  ).toBeVisible();
});

test("node buttons support tab navigation, Enter, and Space", async () => {
  render(<TaskGraphView appData={makeData()} />);
  act(() => canvas().focus());
  await userEvent.tab();
  const root = within(canvas()).getByRole("button", {
    name: "Root — Unfinished",
  });
  expect(root).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(root).toHaveAttribute("aria-pressed", "true");
  await userEvent.tab();
  const parent = within(canvas()).getByRole("button", {
    name: "Parent — Unfinished",
  });
  expect(parent).toHaveFocus();
  await userEvent.keyboard(" ");
  expect(parent).toHaveAttribute("aria-pressed", "true");
});

test("zoom, fit, resizing, and replacement data update the camera", () => {
  const { rerender, unmount } = render(<TaskGraphView appData={makeData()} />);
  const fittedTransform = scene().style.transform;
  expect(observe).toHaveBeenCalledWith(canvas());
  fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
  expect(scene().style.transform).not.toBe(fittedTransform);
  fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
  expect(scene().style.transform).toBe(fittedTransform);
  fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
  fireEvent.click(screen.getByRole("button", { name: "Fit graph" }));
  expect(scene().style.transform).toBe(fittedTransform);
  viewportWidth = 320;
  act(() => resizeCallback());
  expect(scene().style.transform).not.toBe(fittedTransform);
  fireEvent.click(
    within(canvas()).getByRole("button", { name: "Root — Unfinished" })
  );
  rerender(
    <TaskGraphView
      appData={{ topics: [], tasks: [makeTask(99, "Imported")] }}
    />
  );
  expect(within(canvas()).getAllByRole("button")).toHaveLength(1);
  expect(
    screen.getByText("Select a task to see its full title and status.")
  ).toBeVisible();
  expect(scene().style.transform).toContain("scale(1)");
  unmount();
  expect(disconnect).toHaveBeenCalled();
});

test("background dragging pans both nodes and edges; task clicks do not pan", () => {
  render(<TaskGraphView appData={makeData()} />);
  const viewport = canvas();
  viewport.setPointerCapture = jest.fn();
  viewport.hasPointerCapture = jest.fn(() => true);
  viewport.releasePointerCapture = jest.fn();
  const before = scene().style.transform;
  fireEvent.pointerDown(viewport, {
    pointerId: 1,
    button: 0,
    clientX: 100,
    clientY: 100,
  });
  expect(viewport.setPointerCapture).toHaveBeenCalledWith(1);
  expect(viewport).toHaveAttribute("data-panning", "true");
  fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 160, clientY: 140 });
  expect(scene().style.transform).not.toBe(before);
  const pannedTransform = scene().style.transform;
  fireEvent.pointerUp(viewport, { pointerId: 1 });
  expect(viewport.releasePointerCapture).toHaveBeenCalledWith(1);
  expect(viewport).toHaveAttribute("data-panning", "false");
  fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 300, clientY: 300 });
  expect(scene().style.transform).toBe(pannedTransform);
  fireEvent.pointerDown(
    within(viewport).getByRole("button", { name: "Root — Unfinished" }),
    { pointerId: 2, button: 0 }
  );
  expect(viewport.setPointerCapture).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Fit graph" }));
  expect(scene().style.transform).toBe(before);
});

test("empty and cyclic graphs explain why there is no canvas and disable controls", () => {
  const { rerender } = render(<TaskGraphView appData={{ tasks: [] }} />);
  expect(screen.getByText("No tasks yet.")).toBeVisible();
  expect(screen.getByRole("button", { name: "Fit graph" })).toBeDisabled();
  rerender(
    <TaskGraphView
      appData={{ tasks: [makeTask(1, "Cycle", { subTaskIds: [1] })] }}
    />
  );
  expect(screen.getByRole("alert")).toHaveTextContent("contain a cycle");
  expect(
    screen.queryByRole("group", { name: "Task graph canvas" })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Zoom in" })).toBeDisabled();
});
