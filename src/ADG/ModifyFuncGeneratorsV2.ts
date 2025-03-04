import { Tag, TagMap, TagTasksMap } from "../Converters/V2_types.js";
import { getAllDescendantTagsV2 } from "../Tags/TagHelperV2.js";

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

const deleteTagV2 = (
  tagMap: TagMap,
  tagTasksMap: TagTasksMap,
  tagId: number
): { newTagMap: TagMap; newTagTasksMap: TagTasksMap } => {
  // (so they have a different link to the tag DAG)
  // Remove all tag ids to remove from the tagMap and tagTasksMap

  console.log(`Deleting tag ${tagId}`);
  const newTagMap = { ...tagMap };
  const newTagTasksMap = { ...tagTasksMap };
  // Find all child tags that will be removed
  const descendantTags = getAllDescendantTagsV2(tagMap, tagId);

  // Keep the child tags that have a parent tag outside of the descendants
  const descendantTagIds = descendantTags.map((tag) => tag.id);
  const freeDescendantTags = descendantTags.filter(
    (tag) =>
      tag.parentTagIds.length == 0 || // no parent tag, should not happen
      tag.parentTagIds.every((parentTagId) =>
        descendantTagIds.includes(parentTagId)
      )
  );
  return { newTagMap, newTagTasksMap };
};

export { addChildTagV2 };
// export {deleteTagV2};
// export {addTaskInTagV2};
// export {duplicateTaskV2};
// export {moveTasksV2};
