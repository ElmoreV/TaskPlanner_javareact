import { V1_Task, V1_Topic } from "../Converters/V1_types.ts";
import {
  getFreeTopicKeyV1,
  disconnectTopicsByIdV1_r,
} from "../Topics/TopicHelperV1.ts";
import {
  findSupertopicByTopicIdV1,
  findTaskByTaskIdV1,
  findTopicByTopicIdV1,
} from "./FindItemsV1.ts";
import {
  addOrphanTasktoTaskListV1,
  deleteEntireTaskV1,
  generateEmptyTaskV1,
  insertTaskInstanceIntoTaskV1,
  insertTaskInstanceIntoTopicV1,
  removeTaskInstanceFromTopicV1,
  removeTaskInstanceFromTaskV1,
} from "./ModifyTaskTopicAdgElementsV1.ts";

// Now need four functions
// Move from task in topic to subtask in task
// Move from task in subtask to subtask in other task
// Move from task in subtask to task in topic
// Move from task in topic to task in topic

const findTaskInSubTaskTree: (
  tasks: V1_Task[],
  rootTaskId: number,
  subTaskId: number
) => boolean = (tasks, rootTaskId, subTaskId) => {
  if (rootTaskId === subTaskId) {
    return true;
  }
  let rootTask = findTaskByTaskIdV1(tasks, rootTaskId);
  if (rootTask === undefined) {
    console.warn(
      `Searched for task with id ${rootTaskId} but could not find it.`
    );
    return false;
  }
  console.log("rootTask");
  console.log(rootTask);
  if (rootTask.subTaskIds === undefined) {
    console.log("undefined ret");
    return false;
  } else if (rootTask.subTaskIds.includes(subTaskId)) {
    console.log(`${rootTask.subTaskIds} and ${subTaskId}`);
    return true;
  } else {
    return rootTask.subTaskIds
      .map((st) => findTaskInSubTaskTree(tasks, st, subTaskId))
      .reduce((acc, curr) => (curr ? acc || curr : acc), false);
  }
};

const moveTasksV1Pure = (
  topics: V1_Topic[],
  tasks: V1_Task[],
  taskIds: number[],
  sourceTopicIds: number[],
  sourceTaskIds: number[],
  targetTopicId: number,
  targetViewIndex: number,
  targetTaskId: number
) => {
  // taskIds here is the id of the task
  // sourceTopicIds is the topic-object where the task came from
  // targetTopicId is the topic-object where the task is going to
  // const moveTasks = (taskIds, sourceTopicIds, targetTopicId, targetViewIndex) => {

  // Validation checks + defaults
  if (!Array.isArray(taskIds)) {
    taskIds = [taskIds];
  }
  if (!Array.isArray(sourceTopicIds)) {
    sourceTopicIds = [sourceTopicIds];
  }
  if (!Array.isArray(sourceTaskIds)) {
    sourceTaskIds = [sourceTaskIds];
  }
  if (sourceTaskIds.length != taskIds.length) {
    console.error(
      "The length of the taskIds and sourceTopicIds should be the same"
    );
    return;
  }
  if (sourceTaskIds.length != taskIds.length) {
    console.error(
      "The length of the taskIds and sourceTopicIds should be the same"
    );
    return;
  }
  let newTasks = [...tasks];
  if (targetTopicId) {
    const targetTopic = findTopicByTopicIdV1(topics, targetTopicId);
    if (!targetTopic) {
      console.warn(`Target topic ${targetTopicId} does not exist.`);
      return;
    }
  } else if (targetTaskId) {
    const targetTask = findTaskByTaskIdV1(tasks, targetTaskId);
    if (!targetTask) {
      console.warn(`Target super task ${targetTaskId} does not exist.`);
      return;
    }
  } else {
    console.warn("Either targetTaskId or targetTopicId needs to be specified.");
  }

  // go through all 'operations' 1-by-1
  taskIds.forEach((taskId, idx) => {
    let sourceTopicId = sourceTopicIds[idx];
    let sourceTaskId = sourceTaskIds[idx];
    let moveAllowed = true;
    if (targetTaskId) {
      moveAllowed = !findTaskInSubTaskTree(tasks, targetTaskId, taskId);
    }
    if (!moveAllowed) {
      console.warn(
        `Move of task id ${taskId} to task with id ${targetTaskId} is not allowed: task already in target task subtree.`
      );
    }

    // Removing from source location (task or topic)
    if (sourceTopicId) {
      if (moveAllowed) {
        newTasks = removeTaskInstanceFromTopicV1(
          newTasks,
          taskId,
          sourceTopicId
        );
      }
    } else if (sourceTaskId) {
      if (moveAllowed) {
        newTasks = removeTaskInstanceFromTaskV1(newTasks, taskId, sourceTaskId);
      }
    } else {
      console.warn(`No source (task or topic) defined for  ${taskId}.`);
      // return
    }
    // Adding to destination location (task or topic)
    if (targetTopicId) {
      // If the task is already in the targetTopic, remove it
      let taskTopics = newTasks.find((task) => task.id == taskId);
      if (taskTopics.topics.includes(targetTopicId)) {
        console.info(`Task ${taskId} is already in topic ${targetTopicId}`);

        newTasks = removeTaskInstanceFromTopicV1(
          newTasks,
          taskId,
          targetTopicId
        );
      }
      newTasks = insertTaskInstanceIntoTopicV1(
        newTasks,
        taskId,
        targetTopicId,
        targetViewIndex
      );
    } else if (targetTaskId) {
      // If task already in target supertask, remove it
      if (moveAllowed) {
        let superTask = newTasks.find((task) => task.id === targetTaskId);
        console.log(superTask);
        if (superTask.subTaskIds && superTask.subTaskIds.includes(taskId)) {
          console.info(
            `Task ${taskId} is already in supertask ${targetTaskId}`
          );
          newTasks = removeTaskInstanceFromTaskV1(
            newTasks,
            taskId,
            targetTaskId
          );
        }
        // TODO: prevent a cycle to exist (task1<-task2<-task1<-task2<-...)
        if (superTask.subTaskIds === undefined) {
          superTask.subTaskIds = [];
        }
        console.log(superTask);
        let alreadyExisting = findTaskInSubTaskTree(
          tasks,
          targetTaskId,
          taskId
        );
        console.log(alreadyExisting);
        console.log(
          `Task ${taskId} already exists somewhere within task ${targetTaskId}`
        );

        newTasks = insertTaskInstanceIntoTaskV1(newTasks, taskId, targetTaskId);
        console.log(superTask);
      }
    }
  });
  return newTasks;
};

const duplicateTaskV1Pure = (
  topics: V1_Topic[],
  tasks: V1_Task[],
  taskIds: number[],
  targetTopicId: number,
  targetViewIndex: number
) => {
  // Validation checks + defaults
  // Convert single items to a list
  if (!Array.isArray(taskIds)) {
    taskIds = [taskIds];
  }
  if (targetViewIndex === undefined) {
    targetViewIndex = 1;
  }
  const targetTopic = findTopicByTopicIdV1(topics, targetTopicId);
  if (!targetTopic) {
    console.warn(`Target topic ${targetTopicId} does not exist.`);
    return tasks;
  }

  // Copy tasks
  let newTasks = [...tasks];
  taskIds.forEach((taskId) => {
    const task_to_change = newTasks.find((task) => task.id == taskId);
    if (task_to_change.topics.includes(targetTopicId)) {
      console.info(
        `Task ${task_to_change.id} is already in topic ${targetTopicId}`
      );
      return tasks;
    }
    newTasks = insertTaskInstanceIntoTopicV1(
      newTasks,
      taskId,
      targetTopicId,
      targetViewIndex
    );
  });
  return newTasks;
};

const addNewSubtaskV1Pure = (tasks: V1_Task[], superTaskId: number) => {
  let newTasks = [...tasks];
  // Check if supertask belonging to superTaskId exists
  // Generate new (sub)task
  // insert it into (super)task
  const superTask = findTaskByTaskIdV1(tasks, superTaskId);
  if (!superTask) {
    return tasks;
  }
  if (superTask.subTaskIds == undefined) {
    superTask.subTaskIds = [];
  }
  let newSubTask = generateEmptyTaskV1(newTasks);
  newTasks = addOrphanTasktoTaskListV1(newTasks, newSubTask);

  newTasks = insertTaskInstanceIntoTaskV1(newTasks, newSubTask.id, superTaskId);
  return newTasks;
};

const deleteTaskV1Pure = (tasks: V1_Task[], id: number) => {
  let newTasks = deleteEntireTaskV1(tasks, id);
  return newTasks;
};

export { deleteTaskV1Pure };
export { duplicateTaskV1Pure };
export { moveTasksV1Pure };
export { addNewSubtaskV1Pure };
