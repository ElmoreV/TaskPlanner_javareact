// // import { findTopicByTopicIdV1 } from "../ADG/FindItemsV1.ts";

import { TagMap } from "../Converters/V2_types";

const tagToggleFoldV2 = (tagMap: TagMap, tagId: number): TagMap => {
  return {
    ...tagMap,
    [tagId]: {
      ...tagMap[tagId],
      unfolded: !tagMap[tagId].unfolded,
    },
  };
};

const setTagNameV2 = (
  tagMap: TagMap,
  tagId: number,
  newName: string
): TagMap => {
  return {
    ...tagMap,
    [tagId]: {
      ...tagMap[tagId],
      name: newName,
    },
  };
};

const unfoldAllDescendantsV2 = (tagMap: TagMap, rootTagId: number): TagMap => {
  console.log("Executing unfoldAllDescendantsV2");
  const unfold_r = (newTagMap, tagId) => {
    const tag = newTagMap[tagId];
    if (tag.childTagIds.length > 0) {
      tag.childTagIds.forEach((childTagId) => unfold_r(newTagMap, childTagId));
    }
    tag.unfolded = true;
  };
  const newTagMap = { ...tagMap };
  console.log(newTagMap);
  unfold_r(newTagMap, rootTagId);
  console.log(newTagMap);
  return newTagMap;
};

const foldAllDescendantsV2 = (tagMap: TagMap, rootTagId: number): TagMap => {
  console.log("Executing foldAllDescendantsV2");
  const fold_r = (newTagMap, tagId) => {
    const tag = newTagMap[tagId];
    if (tag.childTagIds.length > 0) {
      tag.childTagIds.forEach((childTagId) => fold_r(newTagMap, childTagId));
    }
    tag.unfolded = false;
  };
  const newTagMap = { ...tagMap };
  fold_r(newTagMap, rootTagId);
  return newTagMap;
};

export { tagToggleFoldV2 };
export { setTagNameV2 };
export { unfoldAllDescendantsV2 };
export { foldAllDescendantsV2 };
