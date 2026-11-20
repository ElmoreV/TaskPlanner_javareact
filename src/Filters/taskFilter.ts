import { FinishedState } from "../Structure/TaskInterfaces";
import { convertDueDateNameToSeconds, isTaskDueIn } from "../Timing";
import type {
  FilterData,
  FilterResult,
  FilterSettings,
  FilterSettingsOverrides,
  FilterTag,
  SelectableFilterTag,
  FilterTask,
  TagID,
  TaskID,
  TaskFilterStatus,
  TaskMatchCriteria,
  TagMatchCriteria,
  TaskContextMode,
  TagVisibilityMode,
} from "./FilterTypes";

const ALL_STATUSES: readonly TaskFilterStatus[] = [
  "unfinished",
  "completed",
  "irrelevant",
  "impossible",
  "transitivelyIrrelevant",
];
const TASK_FLAG_FILTERS = ["repeated", "planned", "scheduled"] as const;

export const createFilterSettings = (
  overrides: FilterSettingsOverrides = {}
): FilterSettings => {
  return {
    match: {
      tasks: {
        text: "",
        statuses: [...ALL_STATUSES],
        repeated: "any",
        planned: "any",
        scheduled: "any",
        structure: "any",
        deadline: { kind: "any" },
        tagSource: "task",
        tagged: "any",
        ...overrides.match?.tasks,
      },
      tags: {
        selectedIds: [],
        pathQuery: "",
        includeSubtags: true,
        ...overrides.match?.tags,
      },
    },
    context: {
      tasks: overrides.context?.tasks ?? "none",
      tags: { includeSubtags: false, ...overrides.context?.tags },
    },
    presentation: { tags: "relevant", ...overrides.presentation },
  };
};
// Determine tag visibility when 'Show tags' in ´automatic´ mode
export const getEffectiveTagVisibility = (
  settings: FilterSettings
): Exclude<TagVisibilityMode, "automatic"> => {
  if (settings.presentation.tags !== "automatic")
    return settings.presentation.tags;
  const searching =
    settings.match.tasks.text.trim().length > 0 ||
    settings.match.tags.pathQuery.trim().length > 0 ||
    settings.match.tags.selectedIds.length > 0;
  return searching ? "relevant" : "all";
};

//Splits Blikje-Bier Kopennn! into
// blikje,bier,kopennn
const words = (text: string): string[] =>
  text
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u) // split on not unicode-letters-and-numbers
    .filter(Boolean);

// Every word in query should be the beginning of a word in the name
// so query = bli kop
// will match Blikje-Bier Kopennnn!
const matchesWords = (name: string, query: string): boolean =>
  words(query).every((term) =>
    words(name).some((word) => word.startsWith(term))
  );

interface GraphLinks<ID extends TaskID | TagID> {
  children: ReadonlyMap<ID, readonly ID[]>;
  parents: ReadonlyMap<ID, readonly ID[]>;
}
// Both maps contain every record ID; links to unknown IDs are ignored.
const createGraphLinks = <ID extends TaskID | TagID>(
  records: readonly { id: ID; childIds: readonly ID[] }[]
): GraphLinks<ID> => {
  const children = new Map<ID, ID[]>(records.map(({ id }) => [id, []]));
  const parents = new Map<ID, ID[]>(records.map(({ id }) => [id, []]));
  records.forEach((record) => {
    new Set(record.childIds).forEach((id) => {
      if (!parents.has(id)) return;
      children.get(record.id)!.push(id);
      parents.get(id)!.push(record.id);
    });
  });
  return { children, parents };
};

// Includes the starting IDs and every ID reachable through the supplied direction.
const collectReachableIds = <ID extends TaskID | TagID>(
  startingIds: Iterable<ID>,
  nextIdsById: ReadonlyMap<ID, readonly ID[]>
): Set<ID> => {
  const reachableIds = new Set(startingIds);
  const pendingIds = [...reachableIds];
  for (let index = 0; index < pendingIds.length; index++) {
    const currentId = pendingIds[index];
    for (const nextId of nextIdsById.get(currentId) ?? []) {
      if (reachableIds.has(nextId)) continue;
      reachableIds.add(nextId);
      pendingIds.push(nextId);
    }
  }
  return reachableIds;
};

// Uses the complete normalized task graph, independently of filter settings.
export const getTransitivelyIrrelevantTaskIds = (
  tasks: readonly FilterTask[],
  taskLinks: GraphLinks<TaskID> = createGraphLinks<TaskID>(tasks)
): Set<TaskID> => {
  const tasksById = new Map<TaskID, FilterTask>(
    tasks.map((task) => [task.id, task])
  );
  // Start with unfinished tasks that have no supertasks.
  const relevantUnfinishedTaskIds = new Set<TaskID>(
    tasks
      .filter(
        (task) =>
          task.status === FinishedState.NotFinished &&
          taskLinks.parents.get(task.id)!.length === 0
      )
      .map((task) => task.id)
  );
  // Any uninterrupted unfinished parent path can rescue a shared child.
  const pendingTaskIds = [...relevantUnfinishedTaskIds];
  for (let index = 0; index < pendingTaskIds.length; index++) {
    const taskId = pendingTaskIds[index];
    for (const subtaskId of taskLinks.children.get(taskId)!) {
      if (
        tasksById.get(subtaskId)!.status === FinishedState.NotFinished &&
        !relevantUnfinishedTaskIds.has(subtaskId)
      ) {
        relevantUnfinishedTaskIds.add(subtaskId);
        pendingTaskIds.push(subtaskId);
      }
    }
  }
  const transitivelyIrrelevantTaskIds = new Set<TaskID>();
  for (const task of tasks) {
    if (
      task.status === FinishedState.NotFinished &&
      !relevantUnfinishedTaskIds.has(task.id)
    ) {
      transitivelyIrrelevantTaskIds.add(task.id);
    }
  }
  return transitivelyIrrelevantTaskIds;
};

const getTaskFilterStatuses = (
  tasks: readonly FilterTask[],
  taskLinks: GraphLinks<TaskID>
): Map<TaskID, TaskFilterStatus> => {
  const transitivelyIrrelevantTaskIds = getTransitivelyIrrelevantTaskIds(
    tasks,
    taskLinks
  );
  const filterStatusesByTaskId = new Map<TaskID, TaskFilterStatus>();

  for (const task of tasks) {
    switch (task.status) {
      case FinishedState.Completed:
        filterStatusesByTaskId.set(task.id, "completed");
        break;
      case FinishedState.Irrelevant:
        filterStatusesByTaskId.set(task.id, "irrelevant");
        break;
      case FinishedState.Impossible:
        filterStatusesByTaskId.set(task.id, "impossible");
        break;
      case FinishedState.NotFinished:
        if (transitivelyIrrelevantTaskIds.has(task.id)) {
          filterStatusesByTaskId.set(task.id, "transitivelyIrrelevant");
        } else {
          filterStatusesByTaskId.set(task.id, "unfinished");
        }
        break;
      default:
        // Preserve the previous handling of unknown imported status values.
        filterStatusesByTaskId.set(task.id, "transitivelyIrrelevant");
    }
  }

  return filterStatusesByTaskId;
};

// No mutation of source data, assignments, persisted statuses or folding state.
export const filterTasks = (
  { tasks, tags }: FilterData,
  settings: FilterSettings = createFilterSettings(),
  now: Date = new Date()
): FilterResult => {
  // Filter index (shared)
  const tasksById = new Map<TaskID, FilterTask>(
    tasks.map((task) => [task.id, task])
  );
  const tagsById = new Map<TagID, FilterTag>(tags.map((tag) => [tag.id, tag]));
  const taskLinks = createGraphLinks<TaskID>(tasks);
  const tagLinks = createGraphLinks<TagID>(tags);

  // Matching queries
  const taskQuery: TaskMatchCriteria = settings.match.tasks;
  const tagQuery: TagMatchCriteria = settings.match.tags;

  const filterStatusesByTaskId = getTaskFilterStatuses(tasks, taskLinks);

  const selectableTags = getSelectableTags(tags, tagsById, tagLinks);
  const tagScope = (ids: Iterable<TagID>): Set<TagID> =>
    tagQuery.includeSubtags
      ? collectReachableIds(ids, tagLinks.children)
      : new Set(ids);
  const selectedTagScopeIds = tagScope(tagQuery.selectedIds);
  const pathQuery = tagQuery.pathQuery.trim().toLocaleLowerCase();
  const pathMatchTagIds = tagScope(
    selectableTags
      .filter((tag) => tag.path.toLocaleLowerCase().includes(pathQuery))
      .map((tag) => tag.id)
  );
  ////////////
  //// Tag matching
  ////////////
  const hasSelectedTags = tagQuery.selectedIds.length > 0;
  const matchedTagIds = new Set<TagID>(
    tags
      .filter(
        (tag) =>
          (hasSelectedTags || pathQuery.length > 0) &&
          (!hasSelectedTags || selectedTagScopeIds.has(tag.id)) &&
          (!pathQuery || pathMatchTagIds.has(tag.id))
      )
      .map((tag) => tag.id)
  );

  ////////////
  //// Task matching
  ////////////
  const getEffectiveTagIds = (task: FilterTask): Set<TagID> => {
    const sources =
      taskQuery.tagSource === "taskAndSupertasks"
        ? collectReachableIds([task.id], taskLinks.parents)
        : [task.id];
    return new Set<TagID>(
      [...sources].flatMap((id) => tasksById.get(id)!.tagIds)
    );
  };
  const deadlineFilterWindowSeconds =
    taskQuery.deadline.kind === "within"
      ? convertDueDateNameToSeconds(taskQuery.deadline.interval)
      : undefined;
  const matchedTaskIds = new Set<TaskID>(
    tasks
      .filter((task) => {
        const effectiveTagIds = getEffectiveTagIds(task);
        const supertaskIds = taskLinks.parents.get(task.id)!;
        const subtaskIds = taskLinks.children.get(task.id)!;
        const deadlineTimestamp =
          taskQuery.deadline.kind === "any"
            ? Infinity
            : getTransitiveDueTime(task.id, tasksById, taskLinks);
        if (!taskQuery.statuses.includes(filterStatusesByTaskId.get(task.id)!))
          return false;
        if (!matchesWords(task.name, taskQuery.text)) return false;
        if (
          !TASK_FLAG_FILTERS.every(
            (key) =>
              taskQuery[key] === "any" ||
              !!task[key] === (taskQuery[key] === "yes")
          )
        )
          return false;
        if (
          hasSelectedTags &&
          ![...effectiveTagIds].some((id) => selectedTagScopeIds.has(id))
        )
          return false;
        if (
          pathQuery &&
          ![...effectiveTagIds].some((id) => pathMatchTagIds.has(id))
        )
          return false;
        if (taskQuery.tagged === "yes" && effectiveTagIds.size === 0)
          return false;
        if (taskQuery.tagged === "no" && effectiveTagIds.size > 0) return false;
        if (
          taskQuery.deadline.kind === "missing" &&
          deadlineTimestamp !== Infinity
        )
          return false;
        if (
          deadlineFilterWindowSeconds &&
          !isTaskDueIn(
            { transitiveDueTime: deadlineTimestamp },
            new Date(now),
            deadlineFilterWindowSeconds
          )
        )
          return false;
        if (
          (taskQuery.structure === "noSupertasks" ||
            taskQuery.structure === "standalone") &&
          supertaskIds.length > 0
        )
          return false;
        if (
          (taskQuery.structure === "noSubtasks" ||
            taskQuery.structure === "standalone") &&
          subtaskIds.length > 0
        )
          return false;
        return true;
      })
      .map((task) => task.id)
  );

  //////////////////////
  //// Resolve visibility
  //////////////////////

  const displayTaskIds = getDisplayTaskIds(
    matchedTaskIds,
    taskLinks,
    settings.context.tasks
  );

  // Strict visibility excludes empty tag matches and subtag context.
  const tagVisibility = getEffectiveTagVisibility(settings);
  const tagSeeds = new Set<TagID>(
    tagVisibility === "withVisibleTasks" ? [] : matchedTagIds
  );
  tasks
    .filter((task) => displayTaskIds.has(task.id))
    .forEach((task) => {
      task.tagIds.forEach((id) => {
        if (tagsById.has(id)) tagSeeds.add(id);
      });
    });
  if (tagVisibility === "relevant" && settings.context.tags.includeSubtags)
    collectReachableIds(matchedTagIds, tagLinks.children).forEach((id) =>
      tagSeeds.add(id)
    );
  const resultTagIds = collectReachableIds(tagSeeds, tagLinks.parents);
  const displayTagIds =
    tagVisibility === "all"
      ? new Set<TagID>(tagsById.keys())
      : resultTagIds;
  return {
    selectableTags,
    isTaskVisible: (task) => displayTaskIds.has(task.id),
    isTagVisible: (tag) => displayTagIds.has(tag.id),
  };
};

const getDisplayTaskIds = (
  matchedTaskIds: ReadonlySet<TaskID>,
  taskLinks: GraphLinks<TaskID>,
  mode: TaskContextMode
): Set<TaskID> => {
  const ids = new Set(matchedTaskIds);

  if (mode === "ancestors" || mode === "both")
    collectReachableIds(matchedTaskIds, taskLinks.parents).forEach((id) =>
      ids.add(id)
    );

  if (mode === "descendants" || mode === "both")
    collectReachableIds(matchedTaskIds, taskLinks.children).forEach((id) =>
      ids.add(id)
    );

  return ids;
};

const getSelectableTags = (
  tags: readonly FilterTag[],
  tagsById: ReadonlyMap<TagID, FilterTag>,
  tagLinks: GraphLinks<TagID>
): SelectableFilterTag[] => {
  const path = (id: TagID, visited = new Set<TagID>()): string => {
    if (visited.has(id)) return "";
    visited.add(id);
    const parent = tagLinks.parents.get(id)?.[0];
    return [
      parent === undefined ? "" : path(parent, visited),
      tagsById.get(id)?.name,
    ]
      .filter(Boolean)
      .join("/");
  };
  return tags.map((tag) => ({ id: tag.id, path: path(tag.id) }));
};

// Earliest deadline timestamp in milliseconds, including this task and its subtasks.
// Infinity means no valid deadline was found.
const getTransitiveDueTime = (
  id: TaskID,
  tasksById: ReadonlyMap<TaskID, FilterTask>,
  taskLinks: GraphLinks<TaskID>
): number => {
  return [...collectReachableIds([id], taskLinks.children)]
    .map((id) => tasksById.get(id)!.dueTime)
    .filter((date) => date !== undefined && date !== null)
    .map((date) =>
      date instanceof Date ? date.getTime() : new Date(date!).getTime()
    )
    .filter(Number.isFinite)
    .reduce((earliest, date) => Math.min(earliest, date), Infinity);
};
