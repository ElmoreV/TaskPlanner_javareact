import { Tag, TagMap, TagTasksMap, TaskMap } from "../Structure/V2_types.js";
import { getAllDescendantTagsV2 } from "../Tags/TagHelperV2.ts";
import { generateEmptyTaskV2 } from "./ModifyTaskTagAdgElementsV2.ts";

const getFreeTagIdV2 = (tagMap: TagMap): number => {
  let maxId = 1;
  for (const tagId in tagMap) {
    if (Number(tagId) > maxId) {
      maxId = Number(tagId);
    }
  }
  return maxId + 1;
};

const createEmptyTagV2 = (tagMap: TagMap): Tag => {
  return {
    id: getFreeTagIdV2(tagMap),
    name: `New Tag ${getFreeTagIdV2(tagMap)}`,
    unfolded: true,
    childTagIds: [],
    parentTagIds: [],
  };
};

const addChildTagV2 = (
  tagMap: TagMap,
  tagTasksMap: TagTasksMap,
  tagId: number
): { newTagMap: TagMap; newTagTasksMap: TagTasksMap } => {
  console.log(`Creating new ChildTag to tag ${tagId}`);
  const newTag = createEmptyTagV2(tagMap);
  newTag.parentTagIds.push(tagId);
  const newTagMap = {
    ...tagMap,
    [newTag.id]: newTag,
    [tagId]: {
      ...tagMap[tagId],
      childTagIds: [...tagMap[tagId].childTagIds, newTag.id],
    },
  };
  const newTagTasksMap = {
    ...tagTasksMap,
    [newTag.id]: [],
  };
  return { newTagMap, newTagTasksMap };
};

// const deleteTagV2 = (
//   tagMap: TagMap,
//   tagTasksMap: TagTasksMap,
//   tagId: number
// ): { newTagMap: TagMap; newTagTasksMap: TagTasksMap } => {
//   // (so they have a different link to the tag DAG)
//   // Remove all tag ids to remove from the tagMap and tagTasksMap

//   console.log(`Deleting tag ${tagId}`);
//   const newTagMap = { ...tagMap };
//   const newTagTasksMap = { ...tagTasksMap };
//   // Find all child tags that will be removed
//   const descendantTags = getAllDescendantTagsV2(tagMap, tagId);

//   // Keep the child tags that have a parent tag outside of the descendants
//   const descendantTagIds = descendantTags.map((tag) => tag.id);
//   const freeDescendantTags = descendantTags.filter(
//     (tag) =>
//       tag.parentTagIds.length == 0 || // no parent tag, should not happen
//       tag.parentTagIds.every((parentTagId) =>
//         descendantTagIds.includes(parentTagId)
//       )
//   );
//   return { newTagMap, newTagTasksMap };
// };

const createTaskInTagV2 = (
  tagTasksMap: TagTasksMap,
  tasksMap: TaskMap,
  tagId: number
): { newTagTasksMap: TagTasksMap; newTaskMap: TaskMap } => {
  console.log(`Creating new task in tag ${tagId}`);
  const newTask = generateEmptyTaskV2(tasksMap);
  const newTagTasksMap = {
    ...tagTasksMap,
    [tagId]: [newTask.id, ...tagTasksMap[tagId]],
  };
  const newTaskMap = { ...tasksMap, [newTask.id]: newTask };
  return { newTagTasksMap, newTaskMap };
};

const moveTagToTagV2 = (
  tagMap,
  sourceTagId,
  sourceParentTagId,
  targetParentTagId
) => {
  console.log(
    `Moving tag ${sourceTagId} from within ${sourceParentTagId} to within tag ${targetParentTagId}`
  );
  // TODO: check if sourceTag, targetParentTag exist
  // Cannot move a tag into one of its sub(sub)tags
  if (
    getAllDescendantTagsV2(tagMap, sourceTagId)
      .map((tag) => tag.id)
      .includes(targetParentTagId)
  ) {
    console.warn("Can't move a tag to a descendant; it'd create a cycle.");
    return tagMap;
  }

  // Get the sourceParentTagId
  if (sourceParentTagId === undefined) {
    if (tagMap[sourceTagId].parentTagIds.length === 1) {
      // Only allow this when the source tag only has one parent tag, otherwise it doesn't make sense.
      sourceParentTagId = tagMap[sourceTagId].parentTagIds[0];
    } else if (tagMap[sourceTagId].parentTagIds.length > 1) {
      console.error(
        `It is not known from which parent tag to move the tag ${sourceTagId}`
      );
      return tagMap;
    }
  }

  // Check if we actually move the tag to a new parent tag
  if (sourceParentTagId === targetParentTagId) {
    console.warn(
      "Will not explicitly move a tag to its own parent tag: this action already does nothing."
    );
    return tagMap;
  }
  const newTagMap = { ...tagMap };
  // Delete the tag out of its current spot
  if (sourceParentTagId !== undefined) {
    // sourceTag is not a root tag here
    newTagMap[sourceParentTagId].childTagIds = newTagMap[
      sourceParentTagId
    ].childTagIds.filter((childTagId) => childTagId !== sourceTagId);
  }
  newTagMap[sourceTagId].parentTagIds = newTagMap[
    sourceTagId
  ].parentTagIds.filter((parentTagId) => parentTagId !== sourceParentTagId);
  // Add the tag into the new tag
  newTagMap[targetParentTagId].childTagIds = [
    sourceTagId,
    ...newTagMap[targetParentTagId].childTagIds,
  ];
  newTagMap[sourceTagId].parentTagIds = [
    targetParentTagId,
    ...newTagMap[sourceTagId].parentTagIds,
  ];
  return newTagMap;
};

// Do I want this to be idempotent as well?
const moveTaskFromTagToTagV2 = (
  tagTasksMap: TagTasksMap,
  taskId: number,
  sourceTagId: number,
  targetTagId: number
) => {
  tagTasksMap[sourceTagId] = tagTasksMap[sourceTagId].filter(
    (taskId) => taskId !== taskId
  );
  tagTasksMap[targetTagId] = [taskId, ...tagTasksMap[targetTagId]];
  return tagTasksMap;
};

const moveTasksToTagV2 = (
  tagTasksMap: TagTasksMap,
  taskIds: number[],
  sourceTagIds: number[],
  sourceParentTaskIds: number[],
  targetTagId: number
  // targetViewIndex
): TagTasksMap => {
  console.info(`Moving tasks ${taskIds} to tag ${targetTagId}`);
  const newTagTasksMap = { ...tagTasksMap };
  taskIds.forEach((taskId, idx) => {
    // For each taskId, handle the move
    const sourceTagId = sourceTagIds[idx];
    const sourceParentTaskId = sourceParentTaskIds[idx];
    // Remove task from source tag
    // Add task to target tag
    if (sourceTagId) {
      newTagTasksMap[sourceTagId] = newTagTasksMap[sourceTagId].filter(
        (taskId) => taskId !== taskId
      );
      newTagTasksMap[targetTagId] = [taskId, ...newTagTasksMap[targetTagId]];
    } else if (sourceParentTaskId) {
      // Remove task from source parenttask
      // Add task to target tag
      // TODO: implement source parent task filtering
      newTagTasksMap[targetTagId] = [taskId, ...newTagTasksMap[targetTagId]];
    }
  });
  return newTagTasksMap;
};

export { addChildTagV2 };
export { createTaskInTagV2 };
// export {deleteTagV2};
// export {duplicateTaskV2};
export { moveTasksToTagV2 };
export { moveTagToTagV2 };
