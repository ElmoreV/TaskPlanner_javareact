import { TagMap, TagTasksMap, TaskMap } from "../Converters/V2_types";

const findTagByTagIdV2 = (tagMap: TagMap, tagId: number) => {
  return tagMap[tagId];
  // return a Tag
};

const findParentTagsByTagIdV2 = (tagMap: TagMap, tagId: number) => {
  return tagMap[tagId].parentTagIds;
  // return an array of tagIds, not Tags
};

const findChildTagsByTagIdV2 = (tagMap: TagMap, tagId: number) => {
  return tagMap[tagId].childTagIds;
  // returns an array of tagIds, not Tags
};

const findTasksByTagIdV2 = (tagMap: TagMap, tagId: number) => {
  return tagMap[tagId].childTagIds;
  // returns an array of taskIds
};

const findTagsByTaskIdV2 = (tagTaskMap: TagTasksMap, taskId: number) => {
  return Object.keys(tagTaskMap)
    .filter((tagId) => tagTaskMap[tagId].includes(taskId))
    .map((tagId) => Number(tagId));
  // return an array of tagIds
};

const findTaskByTaskIdV2 = (taskMap: TaskMap, taskId: number) => {
  return taskMap[taskId];
  // return a Task
};

export { findTagByTagIdV2 };
export { findParentTagsByTagIdV2 };
export { findChildTagsByTagIdV2 };
export { findTasksByTagIdV2 };
export { findTagsByTaskIdV2 };
export { findTaskByTaskIdV2 };
