import { TaskMap } from "../Converters/V2_types.ts";
import { FinishedState } from "./TaskInterfaces.tsx";

// All functions below are idempotent
// e.g. the original function like
// scheduleTaskV2 can be called twice
// with the exact same arguments
// it's a bit less strong than a pure functions
// but it's limited side effects.

const scheduleTaskV2 = (taskMap: TaskMap, id: number): TaskMap => {
  return {
    ...taskMap,
    [id]: {
      ...taskMap[id],
      scheduled: !taskMap[id].scheduled,
    },
  };
};

const toggleFoldTaskV2 = (taskMap: TaskMap, id: number): TaskMap => {
  return {
    ...taskMap,
    [id]: {
      ...taskMap[id],
      unfolded: !taskMap[id].unfolded,
    },
  };
};

const toggleRepeatTaskV2 = (taskMap: TaskMap, id: number): TaskMap => {
  return {
    ...taskMap,
    [id]: {
      ...taskMap[id],
      repeated: !taskMap[id].repeated,
    },
  };
};

const completeTaskV2 = (taskMap: TaskMap, id: number): TaskMap => {
  if (taskMap[id].finishStatus === FinishedState.NotFinished) {
    return setTaskFinishStatusV2(taskMap, id, FinishedState.Completed);
  } else {
    return setTaskFinishStatusV2(taskMap, id, FinishedState.NotFinished);
  }
};

const setTaskFinishStatusV2 = (
  taskMap: TaskMap,
  id: number,
  status: FinishedState
): TaskMap => {
  return {
    ...taskMap,
    [id]: {
      ...taskMap[id],
      finishStatus: status,
      lastFinished:
        status !== FinishedState.NotFinished
          ? new Date().toISOString()
          : taskMap[id].lastFinished,
    },
  };
};

const planTaskV2 = (plannedTaskIdList: number[], id: number): number[] => {
  return [id, ...plannedTaskIdList];
};

const unplanTaskV2 = (plannedTaskIdList: number[], id: number): number[] => {
  return plannedTaskIdList.filter((taskId) => taskId !== id);
};

const setTaskNameV2 = (
  taskMap: TaskMap,
  id: number,
  newTaskName: string
): TaskMap => {
  return {
    ...taskMap,
    [id]: {
      ...taskMap[id],
      name: newTaskName,
    },
  };
};

const setTaskDueTimeV2 = (
  taskMap: TaskMap,
  id: number,
  dueTime: Date
): TaskMap => {
  return {
    ...taskMap,
    [id]: {
      ...taskMap[id],
      dueTime: dueTime,
    },
  };
};

export { scheduleTaskV2 };
export { toggleFoldTaskV2 };
export { toggleRepeatTaskV2 };
export { completeTaskV2 };
export { setTaskFinishStatusV2 };
export { planTaskV2 };
export { unplanTaskV2 };
export { setTaskNameV2 };
export { setTaskDueTimeV2 };
