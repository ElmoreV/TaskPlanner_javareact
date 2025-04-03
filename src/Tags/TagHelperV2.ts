import { findTopicByTopicIdV1 } from "../ADG/FindItemsV1.ts";
import { V1_Task, V1_Topic } from "../Structure/V1_types.ts";
import { TaskMap, TagMap, TagTasksMap, Tag } from "../Structure/V2_types.ts";

const getFreeTaskIdV2 = (taskMap: TaskMap) => {
  return (
    1 +
    Object.keys(taskMap).reduce(
      (maxId, taskId) => Math.max(maxId, Number(taskId)),
      0
    )
  );
};

const getFreeTagIdV2 = (tagMap: TagMap): number => {
  let maxId = 1;
  for (const tagId in tagMap) {
    if (Number(tagId) > maxId) {
      maxId = Number(tagId);
    }
  }
  return maxId + 1;
};

const generateEmptyTagV2 = (tagMap: TagMap): Tag => {
  return {
    id: getFreeTagIdV2(tagMap),
    name: `New Tag ${getFreeTagIdV2(tagMap)}`,
    unfolded: true,
    childTagIds: [],
    parentTagIds: [],
  };
};

const disconnectChildTagsByIdV2 = (tagMap: TagMap, tagId: number) => {
  // Removes all connections to tagId from all (other) tags
  Object.values(tagMap).forEach((tag) => {
    tag.childTagIds = tag.childTagIds.filter(
      (childTagId) => childTagId !== tagId
    );
    tag.parentTagIds = tag.parentTagIds.filter(
      (parentTagId) => parentTagId !== tagId
    );
  });
};

const getAllDescendantTagsV2 = (tagMap: TagMap, tagId: number): Tag[] => {
  // Return all child tags, all grandchildren, etc.
  const tag = tagMap[tagId];
  if (tag === undefined) return [];
  return [
    tag,
    ...tag.childTagIds.flatMap((childTagId) =>
      getAllDescendantTagsV2(tagMap, childTagId)
    ),
  ];
};

const isTaskInAnyTagV2 = (tagTaskMap: TagTasksMap, taskId: number) => {
  Object.values(tagTaskMap).forEach((tagTasks) => {
    if (tagTasks.includes(taskId)) return true;
  });
  return false;
};

export { getFreeTaskIdV2 };
export { disconnectChildTagsByIdV2 };
export { generateEmptyTagV2 };

// export { getFreeTopicKeyV1 };
// export { isTaskInAnyTopicV1 };
// export { getTopicTree_by_name_V1 }
// export { getTopicPathByTopicIdV1 }
// export { filterTopicsByIdV1_r }

////////////////// Old stuff below //////////////////

// Just any array?
function isEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let map = new Map();
  for (let elem of a) {
    map.set(elem, (map.get(elem) || 0) + 1);
  }
  for (let elem of b) {
    if (!map.has(elem)) {
      return false;
    }
    map.set(elem, map.get(elem) - 1);
    if (map.get(elem) < 0) {
      return false;
    }
  }
  return true;
}

const get_all_subtopics_V1 = (topic: V1_Topic) => {
  return topic.subtopics
    .map((subtopic) => get_all_subtopics_V1(subtopic))
    .concat(topic);
};

const isTaskInAnyTopicV1 = (task: V1_Task, topics: V1_Topic[]) => {
  // check if the topic of the task in the
  // console.log("Before task.topics")
  // console.log(task.topics)
  task.topics = task.topics.filter((topicId) => {
    console.log(`Is topic ${topicId} in non-deleted topics ${topics}`);
    return findTopicByTopicIdV1(topics, topicId);
  });
  // console.log(`Resulting task.topics: ${task.topics}`)
  // console.log(task.topics)
  // console.log(task.topics.length)
  if (task.topics.length > 0) {
    return true;
  }
  return false;
};

const getLargestTopicKeyV1 = (topic: V1_Topic) => {
  let max_id = Math.max(
    topic.id,
    topic.subtopics.reduce(
      (max_key, topic) => Math.max(max_key, getLargestTopicKeyV1(topic)),
      0
    )
  );
  return max_id;
};
const getFreeTopicKeyV1 = (topics: V1_Topic[]) => {
  let max_id =
    1 +
    topics.reduce(
      (max_key, topic) => Math.max(max_key, getLargestTopicKeyV1(topic)),
      0
    );
  console.log(max_id);
  return max_id;
};

const getTopicTree_by_name_V1_r = (topic: V1_Topic, topic_name: string) => {
  let found_topic_id = false;
  let next_string = "";
  if (topic.name == topic_name) {
    next_string = topic.name;
    found_topic_id = true;
  } else {
    let strings = topic.subtopics
      .map((t) => getTopicTree_by_name_V1_r(t, topic_name))
      .filter((s) => s.length > 0);
    if (strings.length > 0) {
      next_string = topic.name + "/" + strings[0];
      found_topic_id = true;
    }
  }
  if (!found_topic_id) {
    return "";
  } else {
    return next_string;
  }
};
const getTopicTree_by_name_V1 = (topics: V1_Topic[], topic_name: string) => {
  let strings = topics
    .map((t) => getTopicTree_by_name_V1_r(t, topic_name))
    .filter((s) => s.length > 0);
  if (strings.length > 0) {
    return strings[0];
  } else {
    return "";
  }
};

const getTopicPathByTopicIdRecursive = (topic: V1_Topic, topicId: number) => {
  let foundTopicId = false;
  let nextString = "";
  if (topic.id == topicId) {
    nextString = topic.name;
    foundTopicId = true;
  } else {
    let strings = topic.subtopics
      .map((t) => getTopicPathByTopicIdRecursive(t, topicId))
      .filter((s) => s.length > 0);
    if (strings.length > 0) {
      nextString = topic.name + "/" + strings[0];
      foundTopicId = true;
    }
  }
  if (!foundTopicId) {
    return "";
  } else {
    return nextString;
  }
};

const getTopicPathByTopicIdV1 = (topics: V1_Topic[], topicId: number) => {
  let strings = topics
    .map((t) => getTopicPathByTopicIdRecursive(t, topicId))
    .filter((s) => s.length > 0);
  if (strings.length > 0) {
    return strings[0];
  } else {
    return "";
  }
};

export { getAllDescendantTagsV2 };

// const generateDefaultTask = (tasks,id,topic,completed,planned,repeated){
//     let newTask = {

//     }
// }

// export { getFreeTaskIdV2 };
// export { getFreeTopicKeyV1 };
// export { isTaskInAnyTopicV1 };
// export { getTopicTree_by_name_V1 }
// export { getTopicPathByTopicIdV1 }
// export { filterTopicsByIdV1_r }
