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

export interface TopicFilterSource {
  tasks?: readonly V1_Task[];
  topics?: readonly V1_Topic[];
}
export interface TagFilterSource {
  taskMap: TaskMap;
  tagMap: TagMap;
  tagTasksMap: TagTasksMap;
  plannedTaskIdList?: readonly TaskID[];
}
export type FilterSource = TopicFilterSource | TagFilterSource;

// Only these adapters know how tasks, memberships and planning are stored.
const taskFields = (
  task: Task | V1_Task
): Omit<FilterTask, "childIds" | "tagIds" | "planned"> => ({
  ...task,
  status:
    task.finishStatus ||
    ("completed" in task && task.completed
      ? FinishedState.Completed
      : FinishedState.NotFinished),
});

export function fromTopics({
  tasks = [],
  topics = [],
}: TopicFilterSource): FilterData {
  const tags: FilterTag[] = [];
  const visit = (topic: V1_Topic): void => {
    if (tags.some((tag) => tag.id === topic.id)) return;
    tags.push({
      ...topic,
      childIds: (topic.subtopics || []).map((tag) => tag.id),
    });
    (topic.subtopics || []).forEach(visit);
  };
  topics.forEach(visit);
  return {
    tags,
    tasks: tasks.map((task) => ({
      ...taskFields(task),
      childIds: task.subTaskIds || [],
      tagIds: task.topics || [],
      planned: !!task.thisWeek,
    })),
  };
}

export function fromTags({
  taskMap,
  tagMap,
  tagTasksMap,
  plannedTaskIdList = [],
}: TagFilterSource): FilterData {
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
      ...tag,
      childIds: tag.childTagIds,
    })),
    tasks: Object.values(taskMap).map((task) => ({
      ...taskFields(task),
      childIds: task.childTaskIds,
      tagIds: memberships.get(task.id) || [],
      planned: planned.has(task.id),
    })),
  };
}

export const adaptFilterData = (appData: FilterSource): FilterData =>
  "taskMap" in appData ? fromTags(appData) : fromTopics(appData);
