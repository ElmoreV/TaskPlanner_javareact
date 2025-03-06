import structuredClone from "@ungap/structured-clone";
import { sanitizeWeekOrderIndex2 } from "../ADG/ModifyFuncGeneratorsV1.ts";
var hash = require("object-hash");

/*
    ///////////
    ////// Calculating hash
    ///////////////
    */
export const calculateTaskHash = (tasks) => {
  // Strip unimportant stuff
  // Topics: folded/unfolded
  // Otherwise everything is important?
  // The tasks need to be sorted on id
  let newTasks = structuredClone(tasks);
  newTasks = sanitizeWeekOrderIndex2(newTasks);
  let fixedTasks = newTasks
    .sort((a, b) => a.id > b.id)
    .map((task) => {
      return {
        name: task.name,
        id: task.id,
        topics: task.topics.sort(),
        completed: task.completed ? true : false,
        thisWeek: task.thisWeek ? true : false,
        repeated: task.repeated ? true : false,
        scheduled: task.scheduled ? true : false,
        weekOrderIndex:
          task.thisWeek && task.weekOrderIndex > 0 ? task.weekOrderIndex : 0,
      };
    });
  let taskHash = hash(fixedTasks);
  console.log(`Calculated hash of tasks: ${taskHash}`);
  // The topics need to be sorted on id
  return taskHash;
};

export const calculateTopicHash = (topics) => {
  // Strip unimportant stuff
  // Topics: folded/unfolded
  // Otherwise everything is important?
  // The tasks need to be sorted on id
  let newTopics = structuredClone(topics);
  const fixTopics = (topicList) => {
    let fixedTopicList = topicList
      .sort((a, b) => a.id > b.id)
      .map((topic) => {
        // return a new topic wihtout the unfolded
        return {
          name: topic.name,
          id: topic.id,
          subtopics: fixTopics(topic.subtopics),
        };
      });
    return fixedTopicList;
  };
  let topicHash = hash(fixTopics(newTopics));

  console.log(`Calculated hash of topics: ${topicHash}`);
  // The topics need to be sorted on id
  return topicHash;
};

export const calculateHash = (tasks, topics) => {
  return {
    taskHash: calculateTaskHash(tasks),
    topicHash: calculateTopicHash(topics),
  };
};

export const mutatedSince = (
  taskHash,
  topicHash,
  loadedTaskHash,
  loadedTopicHash,
  savedTaskHash,
  savedTopicHash
) => {
  let mutatedSinceLoad = false;
  let mutatedSinceSave = false;
  if (
    (loadedTaskHash && taskHash !== loadedTaskHash) ||
    (loadedTopicHash && topicHash !== loadedTopicHash)
  ) {
    mutatedSinceLoad = true;
  }
  // Check only if the file has been saved before
  if (
    savedTaskHash &&
    taskHash !== savedTaskHash &&
    savedTopicHash &&
    topicHash !== savedTopicHash
  ) {
    mutatedSinceSave = true;
  }
  return { mutatedSinceLoad, mutatedSinceSave };
};

export const isChanged = (
  taskHash,
  topicHash,
  loadedTaskHash,
  loadedTopicHash,
  savedTaskHash,
  savedTopicHash
) => {
  let [mutatedSinceLoad, mutatedSinceSave] = mutatedSince(
    taskHash,
    topicHash,
    loadedTaskHash,
    loadedTopicHash,
    savedTaskHash,
    savedTopicHash
  );
  console.log("Mutated since load and save");
  console.log(mutatedSinceLoad);
  console.log(mutatedSinceSave);
  console.log(savedTaskHash);
  console.log(savedTopicHash);
  console.log(loadedTaskHash);
  console.log(loadedTopicHash);
  console.log(taskHash);
  console.log(topicHash);

  if (!savedTaskHash && mutatedSinceLoad) {
    return true;
  } else if (savedTaskHash && mutatedSinceSave) {
    return true;
  } else {
    return false;
  }
};
