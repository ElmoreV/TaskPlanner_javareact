//filterData.ts
import { FinishedState } from "../Structure/TaskInterfaces";
import type { V1_Task, V1_Topic } from "../Structure/V1_types";
import type { Task, TaskMap, TagMap, TagTasksMap } from "../Structure/V2_types";
import type { TaskID, TagID } from "../Structure/IDs";
import type {
  FilterData,
  FilterTag,
  FilterTask,
  } from "./FilterTypes";

export interface V1FilterSource {
  tasks?: readonly V1_Task[];
  topics?: readonly V1_Topic[];
}
export interface V2FilterSource {
  taskMap: TaskMap;
  tagMap: TagMap;
  tagTasksMap: TagTasksMap;
  plannedTaskIdList?: readonly number[];
}
export type FilterSource = V1FilterSource | V2FilterSource;

// Only these adapters know how tasks, memberships and planning are stored.
// Storage IDs are plain numbers; establish their brands at this input boundary.
const getCommonTaskFields = (
  task: Task | V1_Task
): Omit<FilterTask, "childIds" | "tagIds" | "planned"> => {
  let status = FinishedState.NotFinished;
  // NotFinished is 0: a nonzero status wins over the legacy completed flag.
  if (task.finishStatus) {
    status = task.finishStatus;
  } else if ("completed" in task && task.completed) {
    status = FinishedState.Completed;
  }
  return {
    id: task.id as TaskID,
    name: task.name,
    status,
    repeated: task.repeated,
    scheduled: task.scheduled,
    dueTime: task.dueTime,
  };
};

export const adaptV1FilterData = ({
  tasks = [],
  topics = [],
}: V1FilterSource): FilterData => {
  const tags: FilterTag[] = [];
  const visit = (topic: V1_Topic): void => {
    if (tags.some((tag) => tag.id === topic.id)) return;
    tags.push({
      id: topic.id,
      name: topic.name,
      childIds: (topic.subtopics || []).map((tag) => tag.id),
    });
    (topic.subtopics || []).forEach(visit);
  };
  topics.forEach(visit);
  return {
    tags,
    tasks: tasks.map((task) => ({
      ...getCommonTaskFields(task),
      childIds: (task.subTaskIds || []) as TaskID[],
      tagIds: (task.topics || []) as TagID[],
      planned: !!task.thisWeek,
    })),
  };
};

export const adaptV2FilterData = ({
  taskMap,
  tagMap,
  tagTasksMap,
  plannedTaskIdList = [],
}: V2FilterSource): FilterData => {
  const memberships = new Map<TaskID, TagID[]>();
  Object.entries(tagTasksMap).forEach(([tagId, taskIds]) => {
(taskIds as TaskID[]).forEach((id) => {
      if (!memberships.has(id)) memberships.set(id, []);
      memberships.get(id)!.push(Number(tagId) as TagID);
    });
  });
  const planned = new Set<TaskID>(plannedTaskIdList as readonly TaskID[]);
  return {
    tags: Object.values(tagMap).map((tag) => ({
      id: tag.id as TagID,
      name: tag.name,
      childIds: tag.childTagIds as TagID[],
    })),
    tasks: Object.values(taskMap).map((task) => ({
      ...getCommonTaskFields(task),
      childIds: task.childTaskIds as TaskID[],
      tagIds: memberships.get(task.id as TaskID) || [],
      planned: planned.has(task.id as TaskID),
    })),
  };
};

export const adaptFilterData = (appData: FilterSource): FilterData =>
  "taskMap" in appData
    ? adaptV2FilterData(appData)
    : adaptV1FilterData(appData);
