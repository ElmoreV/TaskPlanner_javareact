//filterData.ts
import { FinishedState } from "../Structure/TaskInterfaces";
import type { V1_Task, V1_Topic } from "../Structure/V1_types";
import type { Task, TaskMap, TagMap, TagTasksMap } from "../Structure/V2_types";
import type {
  FilterData,
  FilterTag,
  FilterTask,
  TagID,
  TaskID,
} from "./FilterTypes";

export interface V1FilterSource {
  tasks?: readonly V1_Task[];
  topics?: readonly V1_Topic[];
}
export interface V2FilterSource {
  taskMap: TaskMap;
  tagMap: TagMap;
  tagTasksMap: TagTasksMap;
  plannedTaskIdList?: readonly TaskID[];
}
export type FilterSource = V1FilterSource | V2FilterSource;

// Only these adapters know how tasks, memberships and planning are stored.
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
    id: task.id,
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
      childIds: task.subTaskIds || [],
      tagIds: task.topics || [],
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
    taskIds.forEach((id) => {
      if (!memberships.has(id)) memberships.set(id, []);
      memberships.get(id)!.push(Number(tagId));
    });
  });
  const planned = new Set<TaskID>(plannedTaskIdList);
  return {
    tags: Object.values(tagMap).map((tag) => ({
      id: tag.id,
      name: tag.name,
      childIds: tag.childTagIds,
    })),
    tasks: Object.values(taskMap).map((task) => ({
      ...getCommonTaskFields(task),
      childIds: task.childTaskIds,
      tagIds: memberships.get(task.id) || [],
      planned: planned.has(task.id),
    })),
  };
};

export const adaptFilterData = (appData: FilterSource): FilterData =>
  "taskMap" in appData
    ? adaptV2FilterData(appData)
    : adaptV1FilterData(appData);
