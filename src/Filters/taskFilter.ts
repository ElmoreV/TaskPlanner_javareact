//taskFilter.ts
import { convertDueDateNameToSeconds, isTaskDueIn } from "../Timing";
import { collectReachableIds, createGraphLinks, getDisplayTaskIds, getTaskFilterStatuses, getTransitiveDueTime, GraphLinks } from "./filterGraph";
import { createFilterSettings, getEffectiveTagVisibility } from "./filterSettings";
import type { TaskID, TagID } from "../Structure/IDs";
import type {
  FilterData,
  FilterResult,
  FilterSettings,
  FilterTag,
  SelectableFilterTag,
  FilterTask,
    TaskMatchCriteria,
  TagMatchCriteria,
} from "./FilterTypes";


const TASK_FLAG_FILTERS = ["repeated", "planned", "scheduled"] as const;

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

  // converts all known tags to the full-path format
  const selectableTags = getSelectableTags(tags, tagsById, tagLinks);

  // ////////////
  // //// Tag matching
  // ////////////

  //   tagScopes = [
  //   Set {1, 2}, // Selected tag A and its subtags
  //   Set {3, 4}, // Selected tag B and its subtags
  //   Set {5, 6}, // Path-query matches
  // ];
  const tagScopes = getTagScopes(
    tagQuery,
    tagLinks,
    selectableTags
  )
  // Matched tag ids will be {1,2,3,4,5,6} deduplicated
  const matchedTagIds = new Set<TagID>(
    tagScopes.flatMap((scope) => [...scope])
  );

  ////////////
  //// Task matching
  ////////////
  const filterStatusesByTaskId = getTaskFilterStatuses(tasks, taskLinks);

  const deadlineFilterWindowSeconds =
    taskQuery.deadline.kind === "within"
      ? convertDueDateNameToSeconds(taskQuery.deadline.interval)
      : undefined;



  const checkIfTaskMatches = (
    task: FilterTask,
    taskQuery: TaskMatchCriteria,
    taskLinks: GraphLinks<TaskID>,
    tasksById: Map<TaskID, FilterTask>,
    tagScopes: Set<TagID>[],
    tagMatchModeSetting: TagMatchCriteria["matchMode"]
  ): boolean => {
    const effectiveTagIds = getEffectiveTagIds(
      task,
      taskQuery.tagSource,
      taskLinks,
      tasksById
    );
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
    if (!taskMatchesTags(effectiveTagIds, tagScopes, tagMatchModeSetting)) return false;
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
  }

  const matchedTaskIds = new Set<TaskID>(
    tasks
      .filter((task) => { return checkIfTaskMatches(
        task, 
        taskQuery, 
        taskLinks, 
        tasksById, 
        tagScopes, 
        tagQuery.matchMode
      ) })
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


const getTagScopes = (
  tagQuery: TagMatchCriteria,
  tagLinks: GraphLinks<TagID>,
  selectableTags: readonly SelectableFilterTag[]
): Set<TagID>[] => {
  // Outputs:
  //   tagScopes = [
  //   Set {1, 2}, // Selected tag A and its subtags
  //   Set {3, 4}, // Selected tag B and its subtags
  //   Set {5, 6}, // Path-query matches
  // ];

  // tagScope: takes ids, and adds subtags to the list it if this is wished
  const tagScope = (ids: Iterable<TagID>): Set<TagID> =>
    tagQuery.includeSubtags
      ? collectReachableIds(ids, tagLinks.children)
      : new Set(ids);

  const pathQuery = tagQuery.pathQuery.trim().toLocaleLowerCase();
  const tagScopes: Set<TagID>[] = [
    ...tagQuery.selectedIds.map((id) => tagScope([id])),
    ...(pathQuery ? [tagScope(selectableTags.filter(
      (tag) =>
        tag.path.toLocaleLowerCase().includes(pathQuery))
      .map((tag) => tag.id)),] : []),];
  return tagScopes;
}



const getEffectiveTagIds = (task: FilterTask,
  tagSourceSetting: TaskMatchCriteria["tagSource"],
  taskLinks: GraphLinks<TaskID>,
  tasksById: Map<TaskID, FilterTask>

): Set<TagID> => {
  // Calculates which tags are relevant for each task
  // Example with tagSource=´and supertasks':
  // Input: task 225, Tag 2026, subtask of task 113 with Tag 2025
  // gives output: [id of tag 2026,id of tag 2025]
  const sources =
    tagSourceSetting === "taskAndSupertasks"
      ? collectReachableIds([task.id], taskLinks.parents)
      : [task.id];
  return new Set<TagID>(
    [...sources].flatMap((id) => tasksById.get(id)!.tagIds)
  );
};

const taskMatchesTags = (effectiveTagIds: ReadonlySet<TagID>,
  tagScopes: Set<TagID>[],
  tagMatchModeSetting: TagMatchCriteria["matchMode"]
): boolean => {
  // Check whether a tasks satisfies the active tag conditions.

  // No tag conditions means no tag restriction.
  if (tagScopes.length === 0) return true;

  const matchesScope = (scope: ReadonlySet<TagID>): boolean =>
    [...effectiveTagIds].some((id) => scope.has(id));

  return tagMatchModeSetting === "any"
    ? tagScopes.some(matchesScope)
    : tagScopes.every(matchesScope);
};

const getSelectableTags = (
  tags: readonly FilterTag[],
  tagsById: ReadonlyMap<TagID, FilterTag>,
  tagLinks: GraphLinks<TagID>
): SelectableFilterTag[] => {
  // Converts tags to their full hierarchical paths.
  // Example Input: {id: 3, name: "Frontend"} (meaning Work → Programming → Frontend )
  // gives output { id: 3, path: "Work/Programming/Frontend" }.
  const path = (id: TagID, visited = new Set<TagID>()): string => {
    // prevent recursion
    if (visited.has(id)) return "";
    visited.add(id);

    // Tags have 0 (root tag) or 1 (subtag) parents
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
