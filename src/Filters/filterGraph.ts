//filterGraph.ts
import { FinishedState } from "../Structure/TaskInterfaces";
import { TaskID, TagID, FilterTask, TaskFilterStatus, TaskContextMode } from "./FilterTypes";

export interface GraphLinks<ID extends TaskID | TagID> {
  children: ReadonlyMap<ID, readonly ID[]>;
  parents: ReadonlyMap<ID, readonly ID[]>;
}
// Both maps contain every record ID; links to unknown IDs are ignored.
export const createGraphLinks = <ID extends TaskID | TagID>(
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

export const getTaskFilterStatuses = (
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
// Includes the starting IDs and every ID reachable through the supplied direction.
export const collectReachableIds = <ID extends TaskID | TagID>(
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


export const getDisplayTaskIds = (
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


export const getTransitiveDueTime = (
  id: TaskID,
  tasksById: ReadonlyMap<TaskID, FilterTask>,
  taskLinks: GraphLinks<TaskID>
): number => {
  // Earliest deadline timestamp in milliseconds, including this task and its subtasks.
  // Infinity means no valid deadline was found.
  return [...collectReachableIds([id], taskLinks.children)]
    .map((id) => tasksById.get(id)!.dueTime)
    .filter((date) => date !== undefined && date !== null)
    .map((date) =>
      date instanceof Date ? date.getTime() : new Date(date!).getTime()
    )
    .filter(Number.isFinite)
    .reduce((earliest, date) => Math.min(earliest, date), Infinity);
};
