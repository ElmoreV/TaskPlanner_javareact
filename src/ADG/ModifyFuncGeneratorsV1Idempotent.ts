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

type TaskInstanceLocation =
  | { type: "task"; superTaskId: number }
  | { type: "topic"; topicId: number };

const moveTaskInstanceV1Pure = (
  tasks: V1_Task[],
  taskId: number,
  sourceLocation: TaskInstanceLocation,
  targetLocation: TaskInstanceLocation,
  targetViewIndex: number | undefined,
  targetTaskId: number | undefined,
  insertAfterSubtask: boolean | undefined
): { newTasks: V1_Task[]; success: boolean } => {
  let newTasks = [...tasks];
  let moveAllowed = true;
  if (targetLocation.type === "task") {
    // TODO: This is actually not the right check.
    // Something like moving task A into  Task1 should be possible
    // even if TaskA in Task2 in Task1
    moveAllowed = true; //!isTaskInSubTaskTree(tasks, targetSuperTaskId, taskId);
  }
  if (!moveAllowed) {
    console.warn(
      `Move of task id ${taskId} to task with id ${targetLocation.superTaskId} is not allowed: task already in target task subtree.`
    );
    return { newTasks: tasks, success: false };
  }

  // Removing from source location (task or topic)
  if (sourceLocation.type === "topic") {
    const sourceTask = newTasks.find((task) => task.id === taskId);
    if (
      sourceTask === undefined ||
      !sourceTask.topics.includes(sourceLocation.topicId)
    ) {
      console.warn(
        `Task ${taskId} is not in source topic ${sourceLocation.topicId}.`
      );
      return { newTasks: tasks, success: false };
    }
    newTasks = removeTaskInstanceFromTopicV1(
      newTasks,
      taskId,
      sourceLocation.topicId
    );
  } else if (sourceLocation.type === "task") {
    // TODO: check if task is in task
    newTasks = removeTaskInstanceFromTaskV1(
      newTasks,
      taskId,
      sourceLocation.superTaskId
    );
  }
  // Adding to destination location (task or topic)
  if (targetLocation.type === "topic") {
    // If the task is already in the targetTopic, remove it
    let taskTopics = newTasks.find((task) => task.id == taskId);
    if (
      taskTopics !== undefined &&
      taskTopics.topics.includes(targetLocation.topicId)
    ) {
      console.info(
        `Task ${taskId} is already in topic ${targetLocation.topicId}`
      );

      newTasks = removeTaskInstanceFromTopicV1(
        newTasks,
        taskId,
        targetLocation.topicId
      );
    }
    newTasks = insertTaskInstanceIntoTopicV1(
      newTasks,
      taskId,
      targetLocation.topicId,
      targetViewIndex
    );
  } else if (targetLocation.type === "task") {
    // If task already in target supertask, remove it
    let superTask = newTasks.find(
      (task) => task.id === targetLocation.superTaskId
    );

    if (superTask === undefined) {
      console.warn(`Supertask ${targetLocation.superTaskId} does not exist`);
      return { newTasks: tasks, success: false };
    }
    if (superTask.subTaskIds && superTask.subTaskIds.includes(taskId)) {
      console.info(
        `Task ${taskId} is already in supertask ${targetLocation.superTaskId}`
      );
      newTasks = removeTaskInstanceFromTaskV1(
        newTasks,
        taskId,
        targetLocation.superTaskId
      );
    }
    // TODO: prevent a cycle to exist (task1<-task2<-task1<-task2<-...)

    if (superTask.subTaskIds === undefined) {
      superTask.subTaskIds = [];
    }

    newTasks = insertTaskInstanceIntoTaskV1Idempotent(
      newTasks,
      taskId,
      targetLocation.superTaskId,

      targetTaskId === undefined
        ? 0
        : superTask.subTaskIds.findIndex(
            (subTaskId) => subTaskId === targetTaskId
          ) + (insertAfterSubtask ? 1 : 0)
    );
  }
  return { newTasks: newTasks, success: true };
};
// Now need four functions
// Move from task in topic to subtask in task
// Move from task in subtask to subtask in other task
// Move from task in subtask to task in topic
// Move from task in topic to task in topic

const moveTasksV1Pure = (
  topics: V1_Topic[],
  tasks: V1_Task[],
  taskIds: number[],
  sourceTopicIds: (number | undefined)[],
  sourceSuperTaskIds: (number | undefined)[],
  targetTopicId: number | undefined | null,
  targetViewIndex: number | undefined | null,
  targetSuperTaskId: number | undefined | null,
  targetTaskId: number | undefined | null,
  insertAfterSubtask: boolean | undefined
): V1_Task[] => {
  // taskIds here is the id of the task
  // sourceTopicIds is the topic-object where the task came from
  // targetTopicId is the topic-object where the task is going to
  // const moveTasks = (taskIds, sourceTopicIds, targetTopicId, targetViewIndex) => {

  // Validation checks + defaults
  if (!Array.isArray(taskIds)) {
    taskIds = [taskIds];
  }
  // normalize all nulls to undefined
  if (targetTopicId === null) targetTopicId = undefined;
  if (targetViewIndex === null) targetViewIndex = undefined;
  if (targetSuperTaskId === null) targetSuperTaskId = undefined;
  if (targetTaskId === null) targetTaskId = undefined;

  if (!Array.isArray(sourceTopicIds)) {
    sourceTopicIds = [sourceTopicIds];
  }
  if (!Array.isArray(sourceSuperTaskIds)) {
    sourceSuperTaskIds = [sourceSuperTaskIds];
  }
  if (sourceSuperTaskIds.length != taskIds.length) {
    console.error(
      "The length of the taskIds and sourceSuperTaskIds should be the same"
    );
    return tasks; // return unchanged tasks
  }
  if (sourceTopicIds.length != taskIds.length) {
    console.error(
      "The length of the taskIds and sourceTopicIds should be the same"
    );
    return tasks;
  }
  let newTasks = [...tasks];
  if (targetTopicId !== undefined) {
    const targetTopic = findTopicByTopicIdV1(topics, targetTopicId);
    if (!targetTopic) {
      console.warn(`Target topic ${targetTopicId} does not exist.`);
      return tasks;
    }
  } else if (targetSuperTaskId !== undefined) {
    const targetTask = findTaskByTaskIdV1(tasks, targetSuperTaskId);
    if (!targetTask) {
      console.warn(`Target super task ${targetSuperTaskId} does not exist.`);
      return tasks;
    }
  } else {
    console.warn(
      "Either targetSuperTaskId or targetTopicId needs to be specified."
    );
    return tasks;
  }
  let targetLocation: TaskInstanceLocation;
  if (targetTopicId !== undefined) {
    targetLocation = { type: "topic", topicId: targetTopicId };
  } else if (targetSuperTaskId !== undefined) {
    targetLocation = { type: "task", superTaskId: targetSuperTaskId };
  } else {
    console.warn(`No target (task or topic) defined move.`);
    return tasks;
  }

  // go through all 'operations' 1-by-1
  let indices = taskIds.map((_, idx) => idx);
  if (insertAfterSubtask) {
    // to preserve order of selected tasks when inserting after
    indices.reverse();
  }
  for (let idx of indices) {
    const taskId = taskIds[idx];
    let sourceLocation: TaskInstanceLocation;
    if (sourceTopicIds[idx] !== undefined) {
      sourceLocation = { type: "topic", topicId: sourceTopicIds[idx] };
    } else if (sourceSuperTaskIds[idx] !== undefined) {
      sourceLocation = { type: "task", superTaskId: sourceSuperTaskIds[idx] };
    } else {
      console.warn(`No source (task or topic) defined for  ${taskId}.`);
      return tasks; //abort
    }

    let result = moveTaskInstanceV1Pure(
      newTasks,
      taskId,
      sourceLocation,
      targetLocation,
      targetViewIndex,
      targetTaskId,
      insertAfterSubtask
    );
    if (!result.success) {
      return tasks; //abort
    }
    newTasks = result.newTasks;
  }
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
