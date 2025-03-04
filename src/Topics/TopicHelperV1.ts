import { findTopicByTopicIdV1 } from "../ADG/FindItemsV1.ts";
import { V1_Task, V1_Topic } from "../Converters/V1_types.ts";

const getFreeTaskIdV1 = (tasks: V1_Task[]) => {
  return 1 + tasks.reduce((max_id, task) => Math.max(max_id, task.id), 0);
};

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

const disconnectTopicsByIdV1_r = (topics: V1_Topic[], topicId: number) => {
  // Filter out any topic that is a subtopic of topicId, recursively
  // And return a new array of topics that has all (sub)topics with id==topic_id filtered out,
  // 1. enumerate all subtopics that do not match id, and filter their subtopics
  // 2. filter all subtopics that do match id
  // 3. return the topics object as is, just with all topics with id==topic_id filtered out,
  // and all subtopics (or subsubtopics) with id==topic_id filtered out
  console.log(topics);
  return topics
    .filter((topic) => topic.id !== topicId) // all topics that do not match id
    .map((topic) => {
      return {
        ...topic,
        subtopics: disconnectTopicsByIdV1_r(topic.subtopics, topicId),
      };
    });
};

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

// const generateDefaultTask = (tasks,id,topic,completed,planned,repeated){
//     let newTask = {

//     }
// }

export { getFreeTaskIdV1 };
export { getFreeTopicKeyV1 };
export { isTaskInAnyTopicV1 };
export { getTopicTree_by_name_V1 };
export { getTopicPathByTopicIdV1 };
export { disconnectTopicsByIdV1_r };
