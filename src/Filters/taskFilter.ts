import { FinishedState } from "../Structure/TaskInterfaces";
import { convertDueDateNameToSeconds, isTaskDueIn } from "../Timing";
import type {
  FilterData,
  FilterResult,
  FilterSettings,
  FilterSettingsOverrides,
  FilterTag,
  FilterTask,
TagID,
  TaskID,
  TaskFilterStatus,
  TaskMatchCriteria,
  TagMatchCriteria,
} from "./FilterTypes";

export const ALL_STATUSES: readonly TaskFilterStatus[] = [
  "unfinished",
  "completed",
  "irrelevant",
  "impossible",
  "transitivelyIrrelevant",
];
export const TASK_FLAG_FILTERS = ["repeated", "planned", "scheduled"] as const;

export function createFilterSettings(
  overrides: FilterSettingsOverrides = {}
): FilterSettings {
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
        untaggedOnly: false,
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
    presentation: { tags: "results", ...overrides.presentation },
  };
}

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
  children: Map<ID, ID[]>;
  parents: Map<ID, ID[]>;
}
const createGraphLinks = <ID extends TaskID | TagID>(
  records: readonly { id: ID; childIds: readonly ID[] }[]
): GraphLinks<ID> => {
  const children = new Map<ID, ID[]>(records.map(({ id }) => [id, []]));
  const parents = new Map<ID, ID[]>(records.map(({ id }) => [id, []]));
  records.forEach((record) => {
    new Set(record.childIds || []).forEach((id) => {
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

const filterStatuses = (
  tasks: readonly FilterTask[],
  taskLinks: GraphLinks<TaskID>
): Map<TaskID, TaskFilterStatus> => {
  const transitivelyIrrelevantTaskIds = getTransitivelyIrrelevantTaskIds(
    tasks,
    taskLinks
  );
  const statuses = new Map<TaskID, TaskFilterStatus>();

  for (const task of tasks) {
      switch (task.status) {
        case FinishedState.Completed:
        statuses.set(task.id, "completed");
          break;
        case FinishedState.Irrelevant:
        statuses.set(task.id, "irrelevant");
          break;
        case FinishedState.Impossible:
        statuses.set(task.id, "impossible");
        break;
      case FinishedState.NotFinished:
        if (transitivelyIrrelevantTaskIds.has(task.id)) {
          statuses.set(task.id, "transitivelyIrrelevant");
        } else {
          statuses.set(task.id, "unfinished");
        }
          break;
        default:
        // Preserve the previous handling of unknown imported status values.
        statuses.set(task.id, "transitivelyIrrelevant");
      }
}

  return statuses;
};

// No mutation of source data, assignments, persisted statuses or folding state.
export const filterTasks = (
  { tasks, tags }: FilterData,
  settings: FilterSettings = createFilterSettings(),
  now: Date = new Date()
): FilterResult => {
  const taskQuery: TaskMatchCriteria = settings.match.tasks;
  const tagQuery: TagMatchCriteria = settings.match.tags;
  const tasksById = new Map<TaskID, FilterTask>(
    tasks.map((task) => [task.id, task])
  );
  const tagsById = new Map<TagID, FilterTag>(tags.map((tag) => [tag.id, tag]));
  const taskLinks = createGraphLinks<TaskID>(tasks);
  const tagLinks = createGraphLinks<TagID>(tags);
  const statuses = filterStatuses(tasks, taskLinks);
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
  const selectableTags = tags.map((tag) => ({ ...tag, path: path(tag.id) }));
  const tagScope = (ids: Iterable<TagID>): Set<TagID> =>
    tagQuery.includeSubtags
      ? collectReachableIds(ids, tagLinks.children)
      : new Set(ids);
  const selectedTags = tagScope(tagQuery.selectedIds);
  const pathQuery = tagQuery.pathQuery.trim().toLocaleLowerCase();
  const searchedTags = tagScope(
    selectableTags
      .filter((tag) => tag.path.toLocaleLowerCase().includes(pathQuery))
      .map((tag) => tag.id)
  );
  const hasSelectedTags = tagQuery.selectedIds.length > 0;
  const matchedTagIds = new Set<TagID>(
    tags
      .filter(
        (tag) =>
          (hasSelectedTags || pathQuery.length > 0) &&
          (!hasSelectedTags || selectedTags.has(tag.id)) &&
          (!pathQuery || searchedTags.has(tag.id))
      )
      .map((tag) => tag.id)
  );
  const tagsOf = (task: FilterTask): Set<TagID> => {
    const sources =
      taskQuery.tagSource === "taskAndSupertasks"
        ? collectReachableIds([task.id], taskLinks.parents)
        : [task.id];
    return new Set<TagID>(
      [...sources].flatMap((id) => tasksById.get(id)?.tagIds || [])
    );
  };
  const dueInSeconds =
    taskQuery.deadline.kind === "within"
      ? convertDueDateNameToSeconds(taskQuery.deadline.interval)
      : undefined;
  const matchedTaskIds = new Set<TaskID>(
    tasks
      .filter((task) => {
        const memberships = tagsOf(task);
        const parents = taskLinks.parents.get(task.id)!;
        const children = taskLinks.children.get(task.id)!;
        const deadline =
          taskQuery.deadline.kind === "any"
            ? Infinity
            : [...collectReachableIds([task.id], taskLinks.children)]
                .map((id) => tasksById.get(id)!.dueTime)
                .filter((date) => date !== undefined && date !== null)
                .map((date) =>
                  date instanceof Date
                    ? date.getTime()
                    : new Date(date!).getTime()
                )
                .filter(Number.isFinite)
                .reduce((earliest, date) => Math.min(earliest, date), Infinity);
        return (
          taskQuery.statuses.includes(statuses.get(task.id)!) &&
          matchesWords(task.name, taskQuery.text) &&
          TASK_FLAG_FILTERS.every(
            (key) =>
              taskQuery[key] === "any" ||
              !!task[key] === (taskQuery[key] === "yes")
          ) &&
          (!hasSelectedTags ||
            [...memberships].some((id) => selectedTags.has(id))) &&
          (!pathQuery || [...memberships].some((id) => searchedTags.has(id))) &&
          (!taskQuery.untaggedOnly || memberships.size === 0) &&
          (taskQuery.deadline.kind !== "missing" || deadline === Infinity) &&
          (!dueInSeconds ||
            isTaskDueIn(
              { transitiveDueTime: deadline },
              new Date(now),
              dueInSeconds
            )) &&
          (!(
            taskQuery.structure === "noSupertasks" ||
            taskQuery.structure === "standalone"
          ) ||
            parents.length === 0) &&
          (!(
            taskQuery.structure === "noSubtasks" ||
            taskQuery.structure === "standalone"
          ) ||
            children.length === 0)
        );
      })
      .map((task) => task.id)
  );

  const displayTaskIds = new Set<TaskID>(matchedTaskIds);
  if (
    settings.context.tasks === "ancestors" ||
    settings.context.tasks === "both"
  )
    collectReachableIds(matchedTaskIds, taskLinks.parents).forEach((id) =>
      displayTaskIds.add(id)
    );
  if (
    settings.context.tasks === "descendants" ||
    settings.context.tasks === "both"
  )
    collectReachableIds(matchedTaskIds, taskLinks.children).forEach((id) =>
      displayTaskIds.add(id)
    );
  const contextTaskIds = new Set<TaskID>(
    [...displayTaskIds].filter((id) => !matchedTaskIds.has(id))
  );

  const tagSeeds = new Set<TagID>(matchedTagIds);
  tasks
    .filter((task) => displayTaskIds.has(task.id))
    .forEach((task) => {
      task.tagIds.forEach((id) => {
        if (tagsById.has(id)) tagSeeds.add(id);
      });
    });
  if (settings.context.tags.includeSubtags)
    collectReachableIds(matchedTagIds, tagLinks.children).forEach((id) =>
      tagSeeds.add(id)
    );
  const relatedTags = collectReachableIds(tagSeeds, tagLinks.parents);
  const contextTagIds = new Set<TagID>(
    [...relatedTags].filter((id) => !matchedTagIds.has(id))
  );
  const displayTagIds =
    settings.presentation.tags === "all"
      ? new Set<TagID>(tagsById.keys())
      : relatedTags;
  return {
    matchedTaskIds,
    matchedTagIds,
    contextTaskIds,
    contextTagIds,
    displayTaskIds,
    displayTagIds,
    selectableTags,
    isTaskVisible: (task) => displayTaskIds.has(task.id),
    isTagVisible: (tag) => displayTagIds.has(tag.id),
  };
};
