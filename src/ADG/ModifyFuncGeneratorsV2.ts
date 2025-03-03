import { Tag, TagMap, TagTasksMap } from "../Converters/V2_types.js";

const getFreeTagIdV2 = (tagMap: TagMap): number => {
  let maxId = 1;
  for (const tagId in tagMap) {
    if (Number(tagId) > maxId) {
      maxId = Number(tagId);
    }
  }
  return maxId + 1;
}

const createEmptyTagV2 = (tagMap: TagMap): Tag => {
  return {
    id: getFreeTagIdV2(tagMap),
    name: `New Tag ${getFreeTagIdV2(tagMap)}`,
    unfolded: true,
    childTagIds: [],
    parentTagIds: [],
  }
}

const addChildTagV2 = (tagMap: TagMap, tagTasksMap: TagTasksMap,tagId: number): {newTagMap: TagMap, newTagTasksMap: TagTasksMap} => {
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
  }
  const newTagTasksMap = {
    ...tagTasksMap,
    [newTag.id]: [],
  }
  return {newTagMap, newTagTasksMap};
}

export {addChildTagV2};
// export {deleteTagV2};
// export {addTaskInTagV2};
// export {duplicateTaskV2};
// export {moveTasksV2};