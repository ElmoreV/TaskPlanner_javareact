// Type definitions for Tags and Tasks

import { AppDataV1, AppDataV2 } from "../../Structure/AppDataTypes.ts";
import { Version } from "../../Structure/Versions.ts";
import { FinishedState } from "../../Structure/TaskInterfaces.tsx";
import { V1_Task, V1_Topic } from "../../Structure/V1_types.ts";
import {
  TaskMap,
  TagMap,
  TagTasksMap,
  Task,
  Tag,
} from "../../Structure/V2_types.ts";
import { compareV1 } from "../../Structure/Comparison/compareV1.ts";

// Migration function
export const convert_v1_to_v2 = (
  tasksV1: V1_Task[],
  topicsV1: V1_Topic[]
): AppDataV2 => {
  // Flatten the topics into a list of Tags
  let newTagMap: TagMap = {};

  console.log(topicsV1);
  const traverseTopics = (
    topics: V1_Topic[],
    parentTagId: number | undefined
  ) => {
    // recursive function to traverse the topics
    topics.forEach((topic) => {
      newTagMap[topic.id] = {
        id: topic.id,
        name: topic.name,
        unfolded: topic.unfolded,
        childTagIds: [...topic.subtopics.map((t) => t.id)],
        parentTagIds: parentTagId ? [parentTagId] : [],
      };
      if (topic.subtopics.length > 0) {
        traverseTopics(topic.subtopics, topic.id);
      }
    });
  };
  traverseTopics(topicsV1, undefined);

  console.log(newTagMap);
  // Collects all flattened tasks,
  // this one is a doozy to convert.
  let newTaskMap: TaskMap = {};
  tasksV1.forEach((task) => {
    newTaskMap[task.id] = {
      id: task.id,
      name: task.name,
      finishStatus: task.finishStatus
        ? task.finishStatus
        : task.completed
          ? FinishedState.Completed
          : FinishedState.NotFinished,
      scheduled: task.scheduled,
      repeated: task.repeated,
      unfolded: task.unfolded,
      childTaskIds: [...task.subTaskIds],
      parentTaskIds: [],

      dueTime: task.dueTime,
      transitiveDueTime: task.transitiveDueTime,
      lastFinished: task.lastFinished,
    };
  });
  tasksV1.forEach((task) => {
    task.subTaskIds.forEach((subTaskId) => {
      newTaskMap[subTaskId].parentTaskIds.push(task.id);
    });
  });

  // Collects all topics/tags in the Task
  // data and create a map with Task ordering
  // as given in topicViewIndices.
  let newTagTasksMap: TagTasksMap = {};
  // First collect all tasks for a given topic (v1)/tag (v2)
  // Then order them.
  let inbetweenMap = {};

  // Store the relevant task in the right tag-'bucket'
  // and sort them
  tasksV1.forEach((task) => {
    if (task.topics.length > 0) {
      task.topics.forEach((topic, idx) => {
        if (inbetweenMap[topic]) {
          inbetweenMap[topic].push({
            id: [task.id],
            order: task.topicViewIndices[idx],
          });
        } else {
          inbetweenMap[topic] = [
            {
              id: [task.id],
              order: task.topicViewIndices[idx],
            },
          ];
        }
      });
    }
  });
  for (let tagId of Object.keys(inbetweenMap)) {
    inbetweenMap[tagId].sort((a, b) => a.order - b.order);
  }

  // Loop through all tags, either extract the ids, or create an empty list.
  for (let tagId of Object.keys(newTagMap)) {
    if (inbetweenMap[tagId]) {
      newTagTasksMap[tagId] = inbetweenMap[tagId].reduce(
        (acc: number[], curr) => {
          return acc.concat(curr.id);
        },
        []
      );
    } else {
      newTagTasksMap[tagId] = [];
    }
  }

  // Collect all tasks in thisWeek=True
  // and order them according to weekOrderIndex
  // How to handle collisions?
  const newPlannedTaskIds: number[] = tasksV1
    .filter((task) => task.thisWeek) //Only take tasks that are planned (thisWeek=true)
    .map((task) => ({
      taskId: task.id,
      order: task.weekOrderIndex,
    })) // retrieve id and order index in the weekly planned list
    .sort((a, b) => a.order - b.order) // sort by order
    .map((task) => task.taskId); // extract task id

  return {
    version: Version.V2,
    taskMap: newTaskMap,
    tagMap: newTagMap,
    tagTasksMap: newTagTasksMap, // notice naming matches the interface
    plannedTaskIdList: newPlannedTaskIds,
  };
};

// Rollback funtion
export const convert_v2_to_v1 = (
  tasksV2: TaskMap,
  tagsV2: TagMap,
  tagTasksV2: TagTasksMap,
  plannedTaskIdListV2: number[]
): AppDataV1 => {
  //////////////////// Generate topics //////////////////
  // Step 1: find root topics
  let rootTopics = Object.values(tagsV2)
    .filter((tag) => tag.parentTagIds.length === 0)
    .map((tag) => tag.id);
  console.log(rootTopics);
  // if the
  // Step 2: Populate topic tree
  const generateTopicTree = (tagId: number) => {
    let tag = tagsV2[tagId];
    let topic: V1_Topic = {
      id: tag.id,
      name: tag.name,
      unfolded: tag.unfolded,
      subtopics: [],
    };
    tag.childTagIds.forEach((childTagId: number) => {
      topic.subtopics.push(generateTopicTree(childTagId));
    });
    return topic;
  };

  let topicsV1: V1_Topic[] = rootTopics.map(generateTopicTree);

  //////////////////// Generate tasks //////////////////

  // Step 1: generate tasks from v2 tasks
  // Then add
  // 1a. and thisWeek
  // 1b. and weekOrderIndex
  // 2a. and topics
  // 2b. and topicViewIndices

  let tasksV1: V1_Task[] = Object.values(tasksV2).map((task) => {
    return {
      id: task.id,
      name: task.name,
      finishStatus: task.finishStatus,
      completed: task.finishStatus === FinishedState.Completed,
      scheduled: task.scheduled,
      repeated: task.repeated,
      unfolded: task.unfolded,
      subTaskIds: task.childTaskIds,
      // The values below need to be filled in
      thisWeek: false,
      weekOrderIndex: 0, // default, means "I don't know"
      topics: [],
      topicViewIndices: [],

      dueTime: task.dueTime,
      transitiveDueTime: task.transitiveDueTime,
      lastFinished: task.lastFinished,
    };
  });

  // get topics from tagTasks
  Object.entries(tagTasksV2).forEach((kv, _) => {
    const [tagId, taskIds] = kv;
    taskIds.forEach((taskId, idx) => {
      const task = tasksV1.find((task) => task.id === taskId);
      if (task) {
        task.topics.push(Number(tagId));
        task.topicViewIndices.push(idx + 1); // starts at 1
      }
    });
  });

  // get week stuffy stuff from plannedTaskIds
  plannedTaskIdListV2.forEach((taskId, idx) => {
    const task = tasksV1.find((task) => task.id === taskId);
    if (task) {
      task.thisWeek = true;
      task.weekOrderIndex = idx + 1; // starts at 1, 0 is default value
    }
  });

  return {
    version: Version.V1,
    topics: topicsV1,
    tasks: tasksV1,
  };
};

export const ensureRoundtripStability = (
  tasks: V1_Task[],
  topics: V1_Topic[]
) => {
  const {
    taskMap: newTaskMap,
    tagMap: newTagMap,
    tagTasksMap: newTagTasksMap,
    plannedTaskIdList: newPlannedTaskIds,
  } = convert_v1_to_v2(tasks, topics);
  console.log(newTaskMap);
  console.log(newTagMap);
  console.log(newTagTasksMap);
  console.log(newPlannedTaskIds);
  const res2 = convert_v2_to_v1(
    newTaskMap,
    newTagMap,
    newTagTasksMap,
    newPlannedTaskIds
  );
  const { topics: topicsV1, tasks: tasksV1 } = res2;

  const areEqual = compareV1(tasks, topics, tasksV1, topicsV1);
  if (areEqual === false) {
    console.error("Tasks and topics are different after comparison.");
  }
};
