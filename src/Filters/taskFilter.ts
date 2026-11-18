import { FinishedState } from "../Structure/TaskInterfaces";
import { convertDueDateNameToSeconds, isTaskDueIn } from "../Timing";
import type {
  FilterData,
  FilterResult,
  FilterSettings,
  FilterSettingsOverrides,
  FilterTag,
  FilterTask,
  TaskFilterStatus,
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

const words = (text: string): string[] =>
  text
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

const matchesWords = (name: string, query: string): boolean =>
  words(query).every((term) =>
    words(name).some((word) => word.startsWith(term))
  );

interface GraphLinks {
  children: Map<number, number[]>;
  parents: Map<number, number[]>;
}
function graphLinks(
  records: readonly Pick<FilterTask | FilterTag, "id" | "childIds">[]
): GraphLinks {
  const children = new Map<number, number[]>(records.map(({ id }) => [id, []]));
  const parents = new Map<number, number[]>(records.map(({ id }) => [id, []]));
  records.forEach((record) => {
    new Set(record.childIds || []).forEach((id) => {
      if (!parents.has(id)) return;
      children.get(record.id)!.push(id);
      parents.get(id)!.push(record.id);
    });
  });
  return { children, parents };
}

// Includes seeds; visiting each ID once handles shared paths and cycles.
function reachable(
  ids: Iterable<number>,
  links: ReadonlyMap<number, readonly number[]>
): Set<number> {
  const result = new Set(ids);
  result.forEach((id) =>
    (links.get(id) || []).forEach((next) => result.add(next))
  );
  return result;
}

function filterStatuses(
  tasks: readonly FilterTask[],
  links: GraphLinks
): Map<number, TaskFilterStatus> {
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const active = new Set(
    tasks
      .filter(
        (task) =>
          task.status === FinishedState.NotFinished &&
          !links.parents.get(task.id)!.length
      )
      .map((task) => task.id)
  );
  // Any uninterrupted unfinished parent path can rescue a shared child.
  active.forEach((id) => {
    links.children.get(id)!.forEach((childId) => {
      if (tasksById.get(childId)!.status === FinishedState.NotFinished)
        active.add(childId);
    });
  });
  return new Map(
    tasks.map((task) => {
      let status: TaskFilterStatus;
      switch (task.status) {
        case FinishedState.Completed:
          status = "completed";
          break;
        case FinishedState.Irrelevant:
          status = "irrelevant";
          break;
        case FinishedState.Impossible:
          status = "impossible";
          break;
        default:
          status = active.has(task.id)
            ? "unfinished"
            : "transitivelyIrrelevant";
      }
      return [task.id, status];
    })
  );
}

// No mutation of source data, assignments, persisted statuses or folding state.
export function filterTasks(
  { tasks, tags }: FilterData,
  settings: FilterSettings = createFilterSettings(),
  now: Date = new Date()
): FilterResult {
  const taskQuery = settings.match.tasks;
  const tagQuery = settings.match.tags;
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const tagsById = new Map(tags.map((tag) => [tag.id, tag]));
  const taskLinks = graphLinks(tasks);
  const tagLinks = graphLinks(tags);
  const statuses = filterStatuses(tasks, taskLinks);
  const path = (id: number, visited = new Set<number>()): string => {
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
  const tagScope = (ids: Iterable<number>): Set<number> =>
    tagQuery.includeSubtags ? reachable(ids, tagLinks.children) : new Set(ids);
  const selectedTags = tagScope(tagQuery.selectedIds);
  const pathQuery = tagQuery.pathQuery.trim().toLocaleLowerCase();
  const searchedTags = tagScope(
    selectableTags
      .filter((tag) => tag.path.toLocaleLowerCase().includes(pathQuery))
      .map((tag) => tag.id)
  );
  const hasSelectedTags = tagQuery.selectedIds.length > 0;
  const matchedTagIds = new Set(
    tags
      .filter(
        (tag) =>
          (hasSelectedTags || pathQuery.length > 0) &&
          (!hasSelectedTags || selectedTags.has(tag.id)) &&
          (!pathQuery || searchedTags.has(tag.id))
      )
      .map((tag) => tag.id)
  );
  const tagsOf = (task: FilterTask): Set<number> => {
    const sources =
      taskQuery.tagSource === "taskAndSupertasks"
        ? reachable([task.id], taskLinks.parents)
        : [task.id];
    return new Set(
      [...sources].flatMap((id) => tasksById.get(id)?.tagIds || [])
    );
  };
  const dueInSeconds =
    taskQuery.deadline.kind === "within"
      ? convertDueDateNameToSeconds(taskQuery.deadline.interval)
      : undefined;
  const matchedTaskIds = new Set(
    tasks
      .filter((task) => {
        const memberships = tagsOf(task);
        const parents = taskLinks.parents.get(task.id)!;
        const children = taskLinks.children.get(task.id)!;
        const deadline =
          taskQuery.deadline.kind === "any"
            ? Infinity
            : [...reachable([task.id], taskLinks.children)]
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

  const displayTaskIds = new Set(matchedTaskIds);
  if (
    settings.context.tasks === "ancestors" ||
    settings.context.tasks === "both"
  )
    reachable(matchedTaskIds, taskLinks.parents).forEach((id) =>
      displayTaskIds.add(id)
    );
  if (
    settings.context.tasks === "descendants" ||
    settings.context.tasks === "both"
  )
    reachable(matchedTaskIds, taskLinks.children).forEach((id) =>
      displayTaskIds.add(id)
    );
  const contextTaskIds = new Set(
    [...displayTaskIds].filter((id) => !matchedTaskIds.has(id))
  );

  const tagSeeds = new Set(matchedTagIds);
  tasks
    .filter((task) => displayTaskIds.has(task.id))
    .forEach((task) => {
      task.tagIds.forEach((id) => {
        if (tagsById.has(id)) tagSeeds.add(id);
      });
    });
  if (settings.context.tags.includeSubtags)
    reachable(matchedTagIds, tagLinks.children).forEach((id) =>
      tagSeeds.add(id)
    );
  const relatedTags = reachable(tagSeeds, tagLinks.parents);
  const contextTagIds = new Set(
    [...relatedTags].filter((id) => !matchedTagIds.has(id))
  );
  const displayTagIds =
    settings.presentation.tags === "all"
      ? new Set(tagsById.keys())
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
}
