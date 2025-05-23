import { V1_Task, V1_Topic } from "../Structure/V1_types.ts";
import { findTaskByTaskIdV1, findTopicByTopicIdV1 } from "./FindItemsV1.ts";
import {
  addOrphanTasktoTaskListV1,
  deleteEntireTaskV1,
  generateEmptyTaskV1,
  insertTaskInstanceIntoTopicV1,
  removeTaskInstanceFromTopicV1,
  removeTaskInstanceFromTaskV1,
  insertTaskInstanceIntoTaskV1Idempotent,
} from "./ModifyTaskTopicAdgElementsV1.ts";

// Now need four functions
// Move from task in topic to subtask in task
// Move from task in subtask to subtask in other task
// Move from task in subtask to task in topic
// Move from task in topic to task in topic

const moveTasksV1Pure = (
  topics: V1_Topic[],
  tasks: V1_Task[],
  taskIds: number[],
  sourceTopicIds: number[],
  sourceSuperTaskIds: number[],
  targetTopicId: number,
  targetViewIndex: number,
  targetSuperTaskId: number,
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
  if (!Array.isArray(sourceSuperTaskIds)) {
    sourceSuperTaskIds = [sourceSuperTaskIds];
  }
  if (sourceSuperTaskIds.length != taskIds.length) {
    console.error(
      "The length of the taskIds and sourceTopicIds should be the same"
    );
    return;
  }
  if (sourceSuperTaskIds.length != taskIds.length) {
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
  } else if (targetSuperTaskId) {
    const targetTask = findTaskByTaskIdV1(tasks, targetSuperTaskId);
    if (!targetTask) {
      console.warn(`Target super task ${targetSuperTaskId} does not exist.`);
      return;
    }
  } else {
    console.warn(
      "Either targetSuperTaskId or targetTopicId needs to be specified."
    );
  }

  // go through all 'operations' 1-by-1
  taskIds.forEach((taskId, idx) => {
    let sourceTopicId = sourceTopicIds[idx];
    let sourceTaskId = sourceSuperTaskIds[idx];
    let moveAllowed = true;
    if (targetSuperTaskId) {
      // TODO: This is actually not the right check.
      // Something like moving task A into  Task1 should be possible
      // even if TaskA in Task2 in Task1
      moveAllowed = true; //!isTaskInSubTaskTree(tasks, targetSuperTaskId, taskId);
    }
    if (!moveAllowed) {
      console.warn(
        `Move of task id ${taskId} to task with id ${targetSuperTaskId} is not allowed: task already in target task subtree.`
      );
      return tasks;
    }

    // Removing from source location (task or topic)
    if (sourceTopicId) {
      newTasks = removeTaskInstanceFromTopicV1(newTasks, taskId, sourceTopicId);
    } else if (sourceTaskId) {
      newTasks = removeTaskInstanceFromTaskV1(newTasks, taskId, sourceTaskId);
    } else {
      console.warn(`No source (task or topic) defined for  ${taskId}.`);
      return tasks;
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
    } else if (targetSuperTaskId) {
      // If task already in target supertask, remove it
      let superTask = newTasks.find((task) => task.id === targetSuperTaskId);
      if (superTask === undefined) {
        console.warn(`Supertask ${targetSuperTaskId} does not exist`);
        return tasks;
      }
      if (superTask.subTaskIds && superTask.subTaskIds.includes(taskId)) {
        console.info(
          `Task ${taskId} is already in supertask ${targetSuperTaskId}`
        );
        newTasks = removeTaskInstanceFromTaskV1(
          newTasks,
          taskId,
          targetSuperTaskId
        );
      }
      // TODO: prevent a cycle to exist (task1<-task2<-task1<-task2<-...)
      if (superTask.subTaskIds === undefined) {
        superTask.subTaskIds = [];
      }

      newTasks = insertTaskInstanceIntoTaskV1Idempotent(
        newTasks,
        taskId,
        targetSuperTaskId,
        superTask.subTaskIds.findIndex(
          (subTaskId) => subTaskId === targetTaskId
        )
      );
    }
  });
  return newTasks;
};

const duplicateTaskV1Pure = (
  topics: V1_Topic[],
  tasks: V1_Task[],
  taskIds: number[],
  targetTopicId: number | undefined,
  targetViewIndex: number | undefined,
  targetSuperTaskId: number | undefined,
  targetTaskId: number | undefined
) => {
  // Validation checks + defaults
  // Convert single items to a list
  if (!Array.isArray(taskIds)) {
    taskIds = [taskIds];
  }
  if (targetViewIndex === undefined) {
    targetViewIndex = 1;
  }
  if (targetTopicId === undefined && targetSuperTaskId === undefined) {
    console.warn("No target topic or supertask specified");
    return tasks;
  }
  let targetTopic;
  let targetSuperTask: V1_Task | undefined;
  if (targetTopicId) {
    targetTopic = findTopicByTopicIdV1(topics, targetTopicId);
    if (!targetTopic) {
      console.warn(`Target topic ${targetTopicId} does not exist.`);
      return tasks;
    }
  } else if (targetSuperTaskId) {
    targetSuperTask = findTaskByTaskIdV1(tasks, targetSuperTaskId);
    if (!targetSuperTask) {
      console.warn(`Target super task ${targetSuperTaskId} does not exist.`);
      return tasks;
    }
  }

  // Copy tasks
  let newTasks = [...tasks];
  taskIds.forEach((taskId) => {
    const taskToDuplicate = newTasks.find((task) => task.id == taskId);
    if (!taskToDuplicate) {
      console.warn(`Task ${taskId} does not exist`);
      return tasks;
    }
    if (targetTopicId) {
      if (taskToDuplicate.topics.includes(targetTopicId)) {
        console.info(
          `Task ${taskToDuplicate.id} is already in topic ${targetTopicId}`
        );
        return tasks;
      }
      newTasks = insertTaskInstanceIntoTopicV1(
        newTasks,
        taskId,
        targetTopicId,
        targetViewIndex
      );
    } else if (targetSuperTaskId) {
      targetSuperTask = findTaskByTaskIdV1(newTasks, targetSuperTaskId);
      let moveAllowed = true; // !isTaskInSubTaskTree(
      //   newTasks,
      //   targetSuperTaskId,
      //   taskId
      // );
      if (!moveAllowed) {
        console.warn(
          `Move of task id ${taskId} to task with id ${targetSuperTaskId} is not allowed: task already in target task subtree.`
        );
        return tasks;
      }

      if (
        targetSuperTask &&
        targetSuperTask.subTaskIds &&
        targetSuperTask.subTaskIds.includes(taskId)
      ) {
        console.info(
          `Task ${taskId} is already in supertask ${targetSuperTaskId}`
        );
        newTasks = removeTaskInstanceFromTaskV1(
          newTasks,
          taskId,
          targetSuperTaskId
        );
      }
      if (targetTaskId) {
        // add above targeted task
        newTasks = insertTaskInstanceIntoTaskV1Idempotent(
          newTasks,
          taskId,
          targetSuperTaskId,
          targetSuperTask?.subTaskIds.findIndex((x) => x === targetTaskId)
        );
      } else {
        // add at the top
        newTasks = insertTaskInstanceIntoTaskV1Idempotent(
          newTasks,
          taskId,
          targetSuperTaskId,
          undefined
        );
      }
    } else {
      console.warn("No target topic or supertask specified");
      return tasks;
    }
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

  newTasks = insertTaskInstanceIntoTaskV1Idempotent(
    newTasks,
    newSubTask.id,
    superTaskId,
    0
  );
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
