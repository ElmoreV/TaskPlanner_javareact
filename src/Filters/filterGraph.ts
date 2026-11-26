//filterGraph.ts
import { FinishedState } from "../Structure/TaskInterfaces";
import { FilterTask, TaskFilterStatus, TaskContextMode } from "./FilterTypes";
import type { TaskID, TagID } from "../Structure/IDs";

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


export const getTransitiveDueTimes = (
  tasksById: ReadonlyMap<TaskID, FilterTask>,
  taskLinks: GraphLinks<TaskID>
): Map<TaskID, number> => {
  const dueTimes = new Map<TaskID, number>();
  const remainingSubtaskCounts = new Map<TaskID, number>();
  const readyTaskIds: TaskID[] = [];

  // for each task:
  // - validate task.dueTime
  // - set to Infinity if weird 
  // - marks tasks without subtasks for starting propagation.
  for (const [id, task] of tasksById) {
    // Parse strings/numbers as dates; null and undefined mean no deadline.
    const timestamp = task.dueTime == null
      ? Infinity
      : task.dueTime instanceof Date
        ? task.dueTime.getTime()
        : new Date(task.dueTime).getTime();
    // Ignore invalid dates; Infinity means no valid deadline was found.
    dueTimes.set(id, Number.isFinite(timestamp) ? timestamp : Infinity);
    // Graph links omit missing task references.
    const subtaskCount = taskLinks.children.get(id)!.length;
    remainingSubtaskCounts.set(id, subtaskCount);
    // if the task has no subtasks, it is immediately ready
    if (subtaskCount === 0) readyTaskIds.push(id);
  }

  // Propagate the due times of the tasks without subtasks upwards
  // the readyTasksIds.length can change during the loop!
  for (let index = 0; index < readyTaskIds.length; index++) {
    // go through the ready tasks
    const id = readyTaskIds[index];
    const dueTime = dueTimes.get(id)!;
    // for each supertask of the ready task
    for (const supertaskId of taskLinks.parents.get(id)!) {
      // propagate the dueTime
      dueTimes.set(supertaskId, Math.min(
        dueTimes.get(supertaskId)!, dueTime!
      ));
      // do remSubtaskCnt[superTaskId]-- 
      const remaining = remainingSubtaskCounts.get(supertaskId)! - 1;
      remainingSubtaskCounts.set(supertaskId, remaining);
      if (remaining === 0) readyTaskIds.push(supertaskId);
    }
  }

  if (readyTaskIds.length !== tasksById.size)
    throw new Error("Cannot calculate effective due time: task relationships contain a cycle.");
  return dueTimes;
};
