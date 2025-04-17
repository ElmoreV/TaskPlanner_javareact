import structuredClone from "@ungap/structured-clone";
import { sanitizeWeekOrderIndex2 } from "../ADG/ModifyFuncGeneratorsV1.ts";
import { getVersionOfAppData } from "./VersionDeterminer.ts";
import { Version } from "../Structure/Versions.ts";
import { TaskMap, TagMap, TagTasksMap } from "../Structure/V2_types.ts";
import { V1_Task, V1_Topic } from "../Structure/V1_types.ts";
import { V0_Task, V0_Topic } from "../Structure/V0_types.ts";
import { AppData, AppDataV1, AppDataV2 } from "../Structure/AppDataTypes.ts";
var hash = require("object-hash");

/*
    ///////////
    ////// Calculating hash
    ///////////////
    */

export const calculateAppDataHash = (appData: AppData): string => {
  const appDataVersion = getVersionOfAppData(appData);
  if (appDataVersion === Version.V1) {
    let appDataV1: AppDataV1 = appData as AppDataV1;
    const { taskHash, topicHash } = calculateV1Hash(
      appDataV1.tasks,
      appDataV1.topics
    );
    return hash({ taskHash, topicHash });
    //  calculateHash(appData.tasks, appData.topics);
  }
  return "";
};

export const isAppDataChanged = (
  appDataHash: string | null,
  loadedAppDataHash: string | null,
  savedAppDataHash: string | null
) => {
  let { mutatedSinceLoad, mutatedSinceSave } = mutatedAppDataSince(
    appDataHash,
    loadedAppDataHash,
    savedAppDataHash
  );
  console.log(`Mutated since load: ${mutatedSinceLoad}`);
  console.log(`Mutated since save: ${mutatedSinceSave}`);
  console.log(`Saved app data hash: ${savedAppDataHash}`);
  console.log(`Loaded app data hash: ${loadedAppDataHash}`);
  console.log(`Current app data hash: ${appDataHash}`);

  if (!savedAppDataHash && mutatedSinceLoad) {
    return true;
  } else if (savedAppDataHash && mutatedSinceSave) {
    return true;
  } else {
    return false;
  }
};

export const mutatedAppDataSince = (
  appDataHash: string | null,
  loadedAppDataHash: string | null,
  savedAppDataHash: string | null
) => {
  let mutatedSinceLoad = false;
  let mutatedSinceSave = false;
  if (loadedAppDataHash && appDataHash !== loadedAppDataHash) {
    mutatedSinceLoad = true;
  }
  // Check only if the file has been saved before
  if (savedAppDataHash && appDataHash !== savedAppDataHash) {
    mutatedSinceSave = true;
  }
  return { mutatedSinceLoad, mutatedSinceSave };
};

export const calculateTaskV1Hash = (tasks: V1_Task[]): string => {
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

export const calculateTopicV1Hash = (topics: V1_Topic[]): string => {
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

export const calculateV1Hash = (
  tasks: V1_Task[],
  topics: V1_Topic[]
): {
  taskHash: string;
  topicHash: string;
} => {
  return {
    taskHash: calculateTaskV1Hash(tasks),
    topicHash: calculateTopicV1Hash(topics),
  };
};
