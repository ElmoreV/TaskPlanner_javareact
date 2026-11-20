import React, { useEffect, useRef, useState } from "react";
import { getEffectiveTagVisibility } from "./taskFilter";
import type {
  FilterBarProps,
  FilterChoice,
  TaskMatchCriteria,
  TagMatchCriteria,
  TaskFilterStatus,
  TaskContextMode,
  TaskStructure,
  DueInterval,
  TagID,
TagVisibilityMode,
} from "./FilterTypes";

const statusLabels: Record<TaskFilterStatus, string> = {
  unfinished: "Unfinished",
  completed: "Completed",
  irrelevant: "Irrelevant",
  impossible: "Impossible",
  transitivelyIrrelevant: "Automatically irrelevant",
};
const statusGroups: { label: string; statuses: TaskFilterStatus[] }[] = [
  { label: "Unfinished", statuses: ["unfinished", "transitivelyIrrelevant"] },
  { label: "Finished", statuses: ["irrelevant", "impossible", "completed"] },
];
const intervals: Record<DueInterval, string> = {
  "30min": "30 minutes",
  "2hrs": "2 hours",
  "8hrs": "8 hours",
  "1day": "1 day",
  "4day": "4 days",
  "1week": "1 week",
  "2week": "2 weeks",
  "4week": "4 weeks",
  "1month": "1 month",
};

const FilterBar = ({ taskFilter, children }: FilterBarProps): JSX.Element => {
  const {
    settings,
    features,
    setFilterSettingsWithDefaults,
    reset,
    selectableTags,
  } = taskFilter;
  const taskMatchCriteria: TaskMatchCriteria = settings.match.tasks;
  const tagMatchCriteria: TagMatchCriteria = settings.match.tags;
  const [tagPickerSearchText, setTagPickerSearchText] = useState("");
  const filterBarRef = useRef<HTMLDivElement>(null);
  const effectiveTagVisibility = getEffectiveTagVisibility(settings);
  const hasTagSearch =
    tagMatchCriteria.pathQuery.trim().length > 0 ||
    tagMatchCriteria.selectedIds.length > 0;
  const subtagContextDisabledReason =
    effectiveTagVisibility === "all"
      ? "All subtags are already shown."
      : effectiveTagVisibility === "withVisibleTasks"
        ? "Empty subtags are hidden."
        : !hasTagSearch
          ? "Search or select a tag to show its subtags."
          : "";
  useEffect(() => {
    const closePopupsOnOutsideClick = (event: MouseEvent): void => {
      const clickTarget = event.target;
      if (!(clickTarget instanceof Node)) return;
      filterBarRef.current
        ?.querySelectorAll<HTMLDetailsElement>("details[open]")
        .forEach((popup) => {
          if (!popup.contains(clickTarget)) popup.open = false;
        });
    };
    // Capture clicks even when task controls stop them from bubbling.
    document.addEventListener("click", closePopupsOnOutsideClick, true);
    return () =>
      document.removeEventListener("click", closePopupsOnOutsideClick, true);
  }, []);

  const patchTaskMatchCriteria = (changes: Partial<TaskMatchCriteria>): void =>
    setFilterSettingsWithDefaults((previous) => ({
      ...previous,
      match: {
        ...previous.match,
        tasks: { ...previous.match.tasks, ...changes },
      },
    }));
  const patchTagMatchCriteria = (changes: Partial<TagMatchCriteria>): void =>
    setFilterSettingsWithDefaults((previous) => ({
      ...previous,
      match: {
        ...previous.match,
        tags: { ...previous.match.tags, ...changes },
      },
    }));

  const tagSearchText = features.includes("tagPathSearch")
    ? tagMatchCriteria.pathQuery
    : tagPickerSearchText;
  const setTagSearchText = (text: string): void => {
    if (features.includes("tagPathSearch"))
      patchTagMatchCriteria({ pathQuery: text });
    else setTagPickerSearchText(text);
  };
  const normalizedTagSearch = tagSearchText.trim().toLocaleLowerCase();
  const tagSuggestions = selectableTags.filter(
    (selectableTag) =>
      !tagMatchCriteria.selectedIds.includes(selectableTag.id) &&
      selectableTag.path.toLocaleLowerCase().includes(normalizedTagSearch)
  );
  const selectTagForFilter = (tagId: TagID): void => {
    setFilterSettingsWithDefaults((previous) => ({
      ...previous,
      match: {
        ...previous.match,
        tags: {
          ...previous.match.tags,
          selectedIds: [...previous.match.tags.selectedIds, tagId],
          pathQuery: "",
        },
      },
    }));
    setTagPickerSearchText("");
  };
  const removeTagFromFilter = (tagId: TagID): void =>
    setFilterSettingsWithDefaults((previous) => ({
      ...previous,
      match: {
        ...previous.match,
        tags: {
          ...previous.match.tags,
          selectedIds: previous.match.tags.selectedIds.filter(
            (selectedTagId) => selectedTagId !== tagId
          ),
        },
      },
    }));

  const setStatusesChecked = (
    statuses: readonly TaskFilterStatus[],
    checked: boolean
  ): void =>
    setFilterSettingsWithDefaults((previous) => ({
      ...previous,
      match: {
        ...previous.match,
        tasks: {
          ...previous.match.tasks,
          statuses: checked
            ? [...new Set([...previous.match.tasks.statuses, ...statuses])]
            : previous.match.tasks.statuses.filter(
                (status) => !statuses.includes(status)
              ),
        },
      },
    }));

  return (
    <div className="task-list-header" ref={filterBarRef}>
      {features.includes("taskSearch") && (
        <input
          type="search"
          placeholder="Search tasks"
          value={taskMatchCriteria.text}
          onChange={(event) =>
            patchTaskMatchCriteria({ text: event.target.value })
          }
        />
      )}
      {(features.includes("tagSelection") ||
        features.includes("tagPathSearch")) && (
        <div className="filter-tag-picker">
          {tagMatchCriteria.selectedIds.map((selectedTagId) => {
            const selectedTag = selectableTags.find(
              (selectableTag) => selectableTag.id === selectedTagId
            );
            const selectedTagName =
              selectedTag?.path || "Unknown tag (" + selectedTagId + ")";
            return (
              <button
                type="button"
                key={selectedTagId}
                title={"Remove tag from search: " + selectedTagName}
                onClick={() => removeTagFromFilter(selectedTagId)}
              >
                {selectedTagName} ×
              </button>
            );
          })}
          <input
            type="search"
            placeholder="Search tags"
            value={tagSearchText}
            onChange={(event) => setTagSearchText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setTagSearchText("");
              if (
                event.key === "Enter" &&
                features.includes("tagSelection") &&
                tagSuggestions.length === 1
              ) {
                event.preventDefault();
                selectTagForFilter(tagSuggestions[0].id);
              }
            }}
          />
          {features.includes("tagSelection") && normalizedTagSearch && (
            <div className="filter-tag-suggestions">
              {tagSuggestions.length ? (
                tagSuggestions.map((selectableTag) => (
                  <button
                    type="button"
                    key={selectableTag.id}
                    onClick={() => selectTagForFilter(selectableTag.id)}
                  >
                    {selectableTag.path}
                  </button>
                ))
              ) : (
                <span>No tags found.</span>
              )}
            </div>
          )}
        </div>
      )}
      {features.includes("status") && (
        <details>
          <summary>Status</summary>
          <div className="filter-options">
            {statusGroups.map((group) => {
              const selectedCount = group.statuses.filter((status) =>
                taskMatchCriteria.statuses.includes(status)
              ).length;
              return (
                <div key={group.label}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCount === group.statuses.length}
                      ref={(input) => {
                        if (input)
                          input.indeterminate =
                            selectedCount > 0 &&
                            selectedCount < group.statuses.length;
                      }}
                      onChange={(event) =>
                        setStatusesChecked(group.statuses, event.target.checked)
                      }
                    />
                    {group.label}
                  </label>
                  <div className="filter-status-subgroups">
                    {group.statuses
                      // Ordinary unfinished tasks are represented by the group checkbox.
                      .filter((status) => status !== "unfinished")
                      .map((status) => (
                        <label key={status}>
                          <input
                            type="checkbox"
                            checked={taskMatchCriteria.statuses.includes(
                              status
                            )}
                            onChange={(event) =>
                              setStatusesChecked([status], event.target.checked)
                            }
                          />
                          {statusLabels[status]}
                        </label>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}
      {(features.includes("repeated") ||
        features.includes("planned") ||
        features.includes("scheduled") ||
        features.includes("deadline") ||
        features.includes("taskStructure") ||
        features.includes("tagMatching")) && (
        <details>
            <summary>Task filters</summary>
          <div className="filter-options">
            {features.includes("repeated") && (
              <label>
                Repeats
                <select
                  value={taskMatchCriteria.repeated}
                  onChange={(event) =>
                    patchTaskMatchCriteria({
                      repeated: event.target.value as FilterChoice,
                    })
                  }
                >
                  <option value="any">All tasks</option>
                  <option value="yes">Repeating only</option>
                  <option value="no">Non-repeating only</option>
                </select>
              </label>
            )}
            {features.includes("planned") && (
              <label>
                Planned
                <select
                  value={taskMatchCriteria.planned}
                  onChange={(event) =>
                    patchTaskMatchCriteria({
                      planned: event.target.value as FilterChoice,
                    })
                  }
                >
                  <option value="any">All tasks</option>
                  <option value="yes">Planned only</option>
                  <option value="no">Unplanned only</option>
                </select>
              </label>
            )}
            {features.includes("scheduled") && (
              <label>
                Scheduled
                <select
                  value={taskMatchCriteria.scheduled}
                  onChange={(event) =>
                    patchTaskMatchCriteria({
                      scheduled: event.target.value as FilterChoice,
                    })
                  }
                >
                  <option value="any">All tasks</option>
                  <option value="yes">Scheduled only</option>
                  <option value="no">Unscheduled only</option>
                </select>
              </label>
            )}
            {features.includes("tagMatching") && (
              <label>
                Has tags
                <select
                  value={taskMatchCriteria.tagged}
                  onChange={(event) =>
                    patchTaskMatchCriteria({
                      tagged: event.target.value as FilterChoice,
                    })
                  }
                >
                  <option value="any">All tasks</option>
                  <option value="yes">Tagged only</option>
                  <option value="no">Untagged only</option>
                </select>
              </label>
            )}
            {features.includes("deadline") && (
              <label>
                Deadline
                <select
                  value={
                    taskMatchCriteria.deadline.kind === "within"
                      ? taskMatchCriteria.deadline.interval
                      : taskMatchCriteria.deadline.kind
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    patchTaskMatchCriteria({
                      deadline:
                        value === "any" || value === "missing"
                          ? { kind: value }
                          : {
                              kind: "within",
                              interval: value as DueInterval,
                            },
                    });
                  }}
                >
                  <option value="any">Any deadline</option>
                  <option value="missing">No deadline</option>
                  {Object.entries(intervals).map(([value, label]) => (
                    <option key={value} value={value}>
                      Within {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {features.includes("taskStructure") && (
              <label>
                  Task relation
                <select
                  value={taskMatchCriteria.structure}
                  onChange={(event) =>
                    patchTaskMatchCriteria({
                      structure: event.target.value as TaskStructure,
                    })
                  }
                >
                  <option value="any">All tasks</option>
                  <option value="noSupertasks">Without supertasks</option>
                  <option value="noSubtasks">Without subtasks</option>
                  <option value="standalone">
                    Without supertasks or subtasks
                  </option>
                </select>
              </label>
            )}
          </div>
        </details>
      )}
      {features.includes("tagMatching") && (
        <details>
          <summary>Tag matching</summary>
          <div className="filter-options">
            <label title="When you select a tag, also include tasks with any of its subtags, at any level.">
              <input
                type="checkbox"
                checked={tagMatchCriteria.includeSubtags}
                onChange={(event) =>
                  patchTagMatchCriteria({
                    includeSubtags: event.target.checked,
                  })
                }
              />
              	Include tasks with subtags
            </label>
            <label  title="When searching for a tag, also find tasks whose supertasks have that tag..">
              <input
                type="checkbox"
                checked={taskMatchCriteria.tagSource === "taskAndSupertasks"}
                onChange={(event) =>
                  patchTaskMatchCriteria({
                    tagSource: event.target.checked
                      ? "taskAndSupertasks"
                      : "task",
                  })
                }
              />
              Also match tags on supertasks
            </label>
          </div>
        </details>
      )}
      {(features.includes("taskContext") ||
        features.includes("tagContext") ||
        features.includes("tagVisibility")) && (
        <details>
            <summary>Display</summary>
          <div className="filter-options">
            {features.includes("taskContext") && (
              <label>
                Show tasks
                <select
                  value={settings.context.tasks}
                  onChange={(event) => {
                    const mode = event.target.value as TaskContextMode;
                    setFilterSettingsWithDefaults((previous) => ({
                      ...previous,
                      context: { ...previous.context, tasks: mode },
                    }));
                  }}
                >
                  <option value="none">Results only</option>
                  <option value="ancestors">Results and all supertasks</option>
                  <option value="descendants">Results and all subtasks</option>
                  <option value="both">
                    Results, all supertasks and all subtasks
                  </option>
                </select>
              </label>
            )}
              {features.includes("tagVisibility") && (
                <label title={
                  settings.presentation.tags === "automatic"
                    ? effectiveTagVisibility === "all"
                      ? "Currently showing all tags while browsing."
                      : "Currently showing relevant tags while searching."
                    : undefined
                }>
                  Show tags
                  <select
                    value={settings.presentation.tags}
                    onChange={(event) => {
                      const mode = event.target.value as TagVisibilityMode;
                      setFilterSettingsWithDefaults((previous) => ({
                        ...previous,
                        presentation: { ...previous.presentation, tags: mode },
                      }));
                    }}
                  >
                    <option value="automatic">Automatic</option>
                    <option value="all">All tags</option>
                    <option value="relevant">Relevant tags</option>
                    <option value="withVisibleTasks">
                      Tags with visible tasks
                  </option>
                </select>
              </label>
            )}
            {features.includes("tagContext") && (
              <label title={
                    subtagContextDisabledReason ||
                    "Also display subtags of matching tags. This does not change which tasks match your search."}>
                <input
                  type="checkbox"
                  checked={settings.context.tags.includeSubtags}
                    disabled={
                      effectiveTagVisibility !== "relevant" || !hasTagSearch
                    }
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setFilterSettingsWithDefaults((previous) => ({
                      ...previous,
                      context: {
                        ...previous.context,
                        tags: { includeSubtags: checked },
                      },
                    }));
                  }}
                />
                Show subtags in results
              </label>
            )}
          </div>
        </details>
      )}
      <button
        type="button"
        onClick={() => {
          reset();
          setTagPickerSearchText("");
        }}
      >
        Clear filters
      </button>
      {children && <div className="filter-actions">{children}</div>}
    </div>
  );
};

export default FilterBar;
