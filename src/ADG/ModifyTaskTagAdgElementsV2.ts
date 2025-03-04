/*
The elementary functions
*/
import { TagTasksMap, Task, TaskMap } from "../Converters/V2_types.ts";
import { FinishedState } from "../Tasks/TaskInterfaces.tsx";
import { getFreeTaskIdV2 } from "../Tags/TagHelperV2.ts";

const generateEmptyTaskV2 = (tasks: TaskMap) => {
  let newId = getFreeTaskIdV2(tasks);
  console.debug(`Generate empty task ${newId}`);
  let newTask: Task = {
    id: newId,
    name: `New Task ${newId}!`,
    finishStatus: FinishedState.NotFinished,
    scheduled: false,
    repeated: false,
    unfolded: false,
    childTaskIds: [],
    parentTaskIds: [],
    dueTime: undefined,
    transitiveDueTime: undefined,
    lastFinished: undefined,
  };
  return newTask;
};

// Assumes taskId is not yet in the TaskMap
// otherwise it will overwrite the existing task
const addOrphanTasktoTaskListV2 = (taskMap: TaskMap, task: Task) => {
  console.info(`Add task with id ${task.id} to tasks`);
  let newTaskMap = { ...taskMap };
  newTaskMap[task.id] = task;
  return newTaskMap;
};

// Insert an existig task (even with no instances) into the tag
// Does not check if task already exsists
// Does not check if tag exists
// Assumes there is only one instance of a task in every topic
// Returns a shallow copy with the changed tasks
const insertTaskInstanceIntoTagV2 = (
  tagTaskMap: TagTasksMap,
  taskId: number,
  tagId: number,
  tagOrderIndex?: number
) => {
  console.info(
    `Insert task instance with task.id: ${taskId} into topic with id: ${tagId} at view index ${tagOrderIndex}`
  );

  if (tagOrderIndex === undefined) {
    tagOrderIndex = 0;
  }
  let newTagTaskMap = { ...tagTaskMap };
  let tasksInTag = newTagTaskMap[tagId];
  // Insert the task at the right position
  tasksInTag.splice(tagOrderIndex, 0, taskId);
  return newTagTaskMap;
};

// Insert an existig subTask (even with no instances) into the current task (as supertask)
// Does not check if subtask already exsists
// Does not check if supertask exists
// Assumes task ids are unique
// Returns a shallow copy with the changed tasks
const insertTaskInstanceIntoTaskV2 = (
  taskMap: TaskMap,
  subTaskId: number,
  superTaskId: number
) => {
  console.info(
    `Insert task instance with task.id: ${subTaskId} into (super)task with id: ${superTaskId}`
  );
  let newTaskMap = { ...taskMap };
  let superTask = newTaskMap[superTaskId];
  let subTask = newTaskMap[subTaskId];
  // Note: push will always add element at the end
  superTask.childTaskIds.push(subTaskId);
  subTask.parentTaskIds.push(superTaskId);
  return newTaskMap;
};

// Assumes the task exists is in the tag
// Assumes tha taskId exists in the tasks
const removeTaskInstanceFromTagV2 = (
  tagTaskMap: TagTasksMap,
  taskId: number,
  tagId: number
) => {
  console.info(
    `Removing task instance with task.id: ${taskId} from topic with id: ${tagId}`
  );
  let newTagTaskMap = { ...tagTaskMap };
  let taskIdList = newTagTaskMap[tagId];
  let newTaskIdList = taskIdList.filter((taskId) => taskId !== taskId);
  newTagTaskMap[tagId] = newTaskIdList;
  return newTagTaskMap;
};

// Assumes tha taskId exists in the tasks
const removeTaskInstanceFromTaskV2 = (
  taskMap: TaskMap,
  taskId: number,
  superTaskId: number
) => {
  console.debug(
    `Removing task instance with task.id: ${taskId} from task with id: ${superTaskId}`
  );
  let newTaskMap = { ...taskMap };
  let superTask = newTaskMap[superTaskId];
  let subTask = newTaskMap[taskId];
  superTask.childTaskIds = superTask.childTaskIds.filter(
    (childTaskId) => childTaskId !== taskId
  );
  subTask.parentTaskIds = subTask.parentTaskIds.filter(
    (parentTaskId) => parentTaskId !== superTaskId
  );
  return newTaskMap;
};

// Pretty much no assumptions.
const deleteEntireTaskV2 = (
  taskMap: TaskMap,
  tagTasksMap: TagTasksMap,
  taskId: number
) => {
  let newTaskMap = { ...taskMap };
  let taskToDelete = newTaskMap[taskId];
  // Remove this id from child tasks and parent tasks
  taskToDelete.childTaskIds.forEach((childTaskId) => {
    let childTask = newTaskMap[childTaskId];
    childTask.parentTaskIds = childTask.parentTaskIds.filter(
      (parentTaskId) => parentTaskId !== taskId
    );
  });
  taskToDelete.parentTaskIds.forEach((parentTaskId) => {
    let parentTask = newTaskMap[parentTaskId];
    parentTask.childTaskIds = parentTask.childTaskIds.filter(
      (childTaskId) => childTaskId !== taskId
    );
  });
  // Remove the task from the taskMap
  delete newTaskMap[taskId];

  // Remove this id from the tagTaskMap
  let newTagTasksMap = { ...tagTasksMap };
  Object.entries(newTagTasksMap).forEach(([tagId, taskIds]) => {
    let newTaskIds = taskIds.filter((curTaskId) => curTaskId !== taskId);
    newTagTasksMap[tagId] = newTaskIds;
  });
  return { newTaskMap, newTagTasksMap };
};

export { generateEmptyTaskV2 };
export { addOrphanTasktoTaskListV2 };
export { insertTaskInstanceIntoTagV2 };
export { removeTaskInstanceFromTagV2 };
export { insertTaskInstanceIntoTaskV2 };
export { removeTaskInstanceFromTaskV2 };
export { deleteEntireTaskV2 };
