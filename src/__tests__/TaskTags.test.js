import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TaskTags from "../Tags/TaskTags";

const selectableTags = [
  { id: 10, name: "Work", path: "Work", parentId: null },
  { id: 11, name: "Frontend", path: "Work/Frontend", parentId: 10 },
  { id: 20, name: "Personal", path: "Personal", parentId: null },
  { id: 21, name: "Frontend", path: "Personal/Frontend", parentId: 20 },
];
const tags = [{ id: 10, label: "Work", path: "Work" }];
const trigger = () => screen.getByRole("button", { name: "+Tag" });
const searchInput = () => screen.getByRole("searchbox");
const optionPaths = () =>
  screen
    .getAllByRole("checkbox")
    .map((input) => input.closest("label").querySelector("small").textContent);

afterEach(() => jest.restoreAllMocks());

test("search work is deferred while closed, browsing, or no longer editable", () => {
  const options = [...selectableTags];
  const filter = jest.spyOn(options, "filter");
  const normalize = jest.spyOn(String.prototype, "toLocaleLowerCase");
  const normalizedPaths = () =>
    normalize.mock.instances
      .map(String)
      .filter((value) => options.some((tag) => tag.path === value));
  const onTopicChange = jest.fn();
  const { rerender } = render(
    <TaskTags
      tags={tags}
      selectableTags={options}
      onTopicChange={onTopicChange}
    />
  );

  expect(screen.getByTitle("Work")).toBeVisible();
  expect(trigger()).toBeVisible();
  expect(filter).not.toHaveBeenCalled();
  expect(normalize).not.toHaveBeenCalled();

  fireEvent.click(trigger());
  expect(searchInput()).toHaveFocus();
  expect(optionPaths()).toEqual(["Work", "Personal"]);
  expect(normalizedPaths()).toEqual([]);
  fireEvent.change(searchInput(), { target: { value: "   " } });
  expect(optionPaths()).toEqual(["Work", "Personal"]);
  expect(normalizedPaths()).toEqual([]);

  fireEvent.change(searchInput(), { target: { value: "front" } });
  expect(normalizedPaths()).toEqual(options.map((tag) => tag.path));
  filter.mockClear();
  normalize.mockClear();
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  rerender(
    <TaskTags
      tags={tags}
      selectableTags={options}
      onTopicChange={onTopicChange}
    />
  );
  expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  expect(filter).not.toHaveBeenCalled();
  expect(normalize).not.toHaveBeenCalled();

  fireEvent.click(trigger());
  expect(searchInput()).toHaveValue("");
  expect(normalizedPaths()).toEqual([]);
  fireEvent.change(searchInput(), { target: { value: "front" } });
  filter.mockClear();
  normalize.mockClear();
  rerender(<TaskTags tags={tags} selectableTags={options} />);
  expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "+Tag" })
  ).not.toBeInTheDocument();
  expect(screen.getByTitle("Work")).toBeVisible();
  expect(filter).not.toHaveBeenCalled();
  expect(normalize).not.toHaveBeenCalled();
});

test("search keeps normalized substring matching, order, and current options", () => {
  const onTopicChange = jest.fn();
  const { rerender } = render(
    <TaskTags
      tags={tags}
      selectableTags={selectableTags}
      onTopicChange={onTopicChange}
    />
  );
  fireEvent.click(trigger());
  fireEvent.change(searchInput(), { target: { value: "  oNtEn  " } });
  expect(optionPaths()).toEqual(["Work/Frontend", "Personal/Frontend"]);

  const updatedOptions = [
    selectableTags[3],
    { id: 30, name: "Backend", path: "Work/Backend", parentId: 10 },
    { id: 31, name: "Content", path: "Content", parentId: null },
  ];
  rerender(
    <TaskTags
      tags={tags}
      selectableTags={updatedOptions}
      onTopicChange={onTopicChange}
    />
  );
  expect(searchInput()).toHaveValue("  oNtEn  ");
  expect(optionPaths()).toEqual(["Personal/Frontend", "Content"]);
  fireEvent.change(searchInput(), { target: { value: "missing" } });
  expect(screen.getByText("No matching tags.")).toBeVisible();
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});

test("clearing and reopening restore the hierarchy and retain expansion", () => {
  render(
    <TaskTags
      tags={tags}
      selectableTags={selectableTags}
      onTopicChange={jest.fn()}
    />
  );
  fireEvent.click(trigger());
  fireEvent.click(screen.getAllByRole("button", { name: "▸" })[0]);
  expect(optionPaths()).toEqual(["Work", "Work/Frontend", "Personal"]);
  fireEvent.change(searchInput(), { target: { value: "frontend" } });
  expect(optionPaths()).toEqual(["Work/Frontend", "Personal/Frontend"]);
  fireEvent.change(searchInput(), { target: { value: "" } });
  expect(optionPaths()).toEqual(["Work", "Work/Frontend", "Personal"]);
  fireEvent.change(searchInput(), { target: { value: "frontend" } });
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(trigger()).toHaveFocus();
  fireEvent.click(trigger());
  expect(searchInput()).toHaveValue("");
  expect(searchInput()).toHaveFocus();
  expect(optionPaths()).toEqual(["Work", "Work/Frontend", "Personal"]);
});

test.each(["Escape", "outside click", "blur"])(
  "%s closes a search and reopening resets it",
  (method) => {
    const onTopicChange = jest.fn();
    const { rerender } = render(
      <TaskTags
        tags={tags}
        selectableTags={selectableTags}
        onTopicChange={onTopicChange}
      />
    );
    fireEvent.click(trigger());
    fireEvent.change(searchInput(), { target: { value: "work" } });
    const selected = screen.getByRole("checkbox", { name: "Work Work" });
    expect(selected).toBeChecked();
    fireEvent.click(selected);
    expect(onTopicChange).toHaveBeenLastCalledWith(10, false);
    rerender(
      <TaskTags
        tags={[]}
        selectableTags={selectableTags}
        onTopicChange={onTopicChange}
      />
    );
    expect(selected).not.toBeChecked();
    fireEvent.keyDown(selected, { key: "Enter" });
    expect(onTopicChange).toHaveBeenLastCalledWith(10, true);
    expect(searchInput()).toHaveValue("work");

    if (method === "Escape") {
      fireEvent.keyDown(searchInput(), { key: "Escape" });
      expect(trigger()).toHaveFocus();
    } else if (method === "outside click") {
      fireEvent.mouseDown(document.body);
    } else {
      fireEvent.blur(searchInput(), { relatedTarget: document.body });
    }
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    fireEvent.click(trigger());
    expect(searchInput()).toHaveValue("");
    expect(searchInput()).toHaveFocus();
    expect(optionPaths()).toEqual(["Work", "Personal"]);
  }
);
