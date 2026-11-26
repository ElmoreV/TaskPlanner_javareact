import { V1_Task, V1_Topic } from "../Structure/V1_types";
import type { TaskID } from "../Structure/IDs";

// Returns a cached FUNCTIOON
// Supply the complete task list so filtered and folded supertasks stay in paths.
export const createParentTaskPathLookupV1 = (
  tasks: readonly V1_Task[]
): ((taskId: TaskID, fullPaths: boolean) => string[]) => {
  const parentsById = new Map<TaskID, { id: TaskID; name: string }[]>();
  tasks.forEach((task) => {
    const parent = { id: task.id as TaskID, name: task.name };
    new Set(task.subTaskIds || []).forEach((id) => {
      const childId = id as TaskID;
      const parents = parentsById.get(childId) || [];
      parentsById.set(childId, [...parents, parent]);
    });
  });

  // Calculate full paths only when requested, reusing shared ancestors and
  // repeated task rows for as long as the caller retains this lookup.
  const cachedPaths = new Map<TaskID, string[]>();
  // Example: grandparent A -> parent B -> { id: 44, name: "I'm a leaf!" }.
  // getPaths(44) returns ["grandparent A/parent B"], excluding the leaf task's name.
  // A task without supertasks returns [].
  const getPaths = (
    taskId: TaskID,
    ancestors: readonly TaskID[] = []
  ): string[] => {
    const cached = cachedPaths.get(taskId);
    if (cached !== undefined) return cached;
    const branch = [...ancestors, taskId];
    const paths = (parentsById.get(taskId) || []).flatMap((parent) => {
      if (branch.includes(parent.id)) return [];
      const prefixes = getPaths(parent.id, branch);
      return prefixes.length>0
        ? prefixes.map((prefix) => `${prefix}/${parent.name}`)
        : [parent.name];
    });
    const uniquePaths = [...new Set(paths)];
    cachedPaths.set(taskId, uniquePaths);
    return uniquePaths;
  };

  return (taskId: TaskID, fullPaths: boolean): string[] =>
    fullPaths
      ? getPaths(taskId)
      : (parentsById.get(taskId) || []).map((parent) => parent.name);
};

const findTopicByTopicIdV1R = (topics: V1_Topic[], topic_key: number) => {
  // console.debug(topics);
  for (let topic of topics) {
    // console.debug(topic.id);
    if (topic.id === topic_key) {
      // console.debug('Fount it!');
      return topic;
    }
    let topic_res = findTopicByTopicIdV1R(topic.subtopics, topic_key);
    if (topic_res) {
      // console.debug('Bubble up');
      return topic_res;
    }
  }
  return null;
};

const findTopicByTopicIdV1 = (topics: V1_Topic[], topic_key: number) => {
  return findTopicByTopicIdV1R(topics, topic_key);
};

const findSupertopicByTopicIdV1_r = (
  topic: V1_Topic,
  subtopicId: number
): V1_Topic | null => {
  // For every subtopic, see if it matches the id
  // otherwise, search through the subtopics of the subtopic
  for (let subtopic of topic.subtopics) {
    console.debug(subtopic.id);
    if (subtopic.id === subtopicId) {
      console.info("Found subtopic id in a topic");
      return topic;
    }
    let topic_res = topic.subtopics
      .map((t) => findSupertopicByTopicIdV1_r(t, subtopicId))
      .filter((s) => s);
    console.debug(topic_res);
    if (topic_res.length > 0) {
      console.debug("Bubble up");
      return topic_res[0];
    }
  }
  return null;
};
const findSupertopicByTopicIdV1 = (topics: V1_Topic[], subtopic_id: number) => {
  // Assumptions: ids are unique
  // For all root topics,
  let topic_res = topics
    .map((topic) => findSupertopicByTopicIdV1_r(topic, subtopic_id))
    .filter((s) => s);
  console.debug(topic_res);
  if (topic_res) {
    return topic_res[0];
  }
  return null;
};

const findSubtopicsByTopicIdV1 = (topics: V1_Topic[], topicId: number) => {
  let topic = findTopicByTopicIdV1(topics, topicId);
  return topic.subtopics;
};

const findTasksByTopicIdV1 = (tasks: V1_Task[], topicId: number) => {
  return tasks.filter((t) => t.topics.includes(topicId));
};

const findTaskByTaskIdV1 = (tasks: V1_Task[], taskId: number) => {
  return tasks.find((t) => t.id == taskId);
};

const findTopicsByTaskIdV1 = (
  tasks: V1_Task[],
  topics: V1_Topic[],
  taskId: number
) => {
  let task = findTaskByTaskIdV1(tasks, taskId);
  topics = task.topics.map((topicId) => findTopicByTopicIdV1(topics, topicId));
  return topics;
};

export const isTaskInSubTaskTree: (
  tasks: V1_Task[],
  rootTaskId: number,
  taskIdToSearch: number
) => boolean = (tasks, rootTaskId, taskIdToSearch) => {
  if (rootTaskId === taskIdToSearch) {
    return true;
  }
  let rootTask = findTaskByTaskIdV1(tasks, rootTaskId);
  if (rootTask === undefined) {
    console.warn(
      `Searched for task with id ${rootTaskId} but could not find it.`
    );
    return false;
  }
  if (rootTask.subTaskIds === undefined) {
    console.warn(`the task ${rootTaskId} has no subTaskIds`);
    return false;
  } else if (rootTask.subTaskIds.includes(taskIdToSearch)) {
    return true;
  } else {
    return rootTask.subTaskIds
      .map((st) => isTaskInSubTaskTree(tasks, st, taskIdToSearch))
      .reduce((acc, curr) => (curr ? acc || curr : acc), false);
  }
};

export { findTopicByTopicIdV1 };
export { findTopicByTopicIdV1R };
export { findSupertopicByTopicIdV1 };
export { findSubtopicsByTopicIdV1 };
export { findTasksByTopicIdV1 };
export { findTaskByTaskIdV1 };
export { findTopicsByTaskIdV1 };
