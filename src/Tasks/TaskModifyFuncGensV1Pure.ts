import { V1_Task } from "../Structure/V1_types.ts";
import { FinishedState } from "../Structure/TaskInterfaces.tsx";

const scheduleTaskV1Semipure = (tasks: V1_Task[], id: number) => {
  return tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        scheduled: !task.scheduled,
      };
    }
    return task;
  });
  // This below code is not idempotent, leaving it here for reference.
  // This causes a bug, where possibly react does the function twice
  // to test if I'm being nice and creating idempotent functions.

  // const newTasks = [...tasks]
  // const taskToChange = newTasks.find((task) => task.id === id);
  // if (taskToChange === undefined) { return newTasks; }
  // taskToChange.scheduled = !taskToChange.scheduled;
  // return newTasks;
};

const toggleFoldTaskV1Semipure = (tasks: V1_Task[], id: number) => {
  console.log("Running toggle fold");
  return tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        unfolded: !task.unfolded,
      };
    }
    return task;
  });
};

const toggleRepeatTaskV1Semipure = (tasks: V1_Task[], id: number) => {
  return tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        repeated: !task.repeated,
      };
    }
    return task;
  });
};

const completeTaskV1Semipure = (tasks: V1_Task[], id: number) => {
  return tasks.map((task) => {
    if (task.id === id) {
      if (task.completed) {
        return {
          ...task,
          completed: !task.completed,
          finishStatus: FinishedState.NotFinished,
        };
      } else {
        return {
          ...task,
          completed: !task.completed,
          finishStatus: FinishedState.Completed,
          lastFinished: new Date().toISOString(),
        };
      }
    }
    return task; // unchanged tasks keep their original object reference
  });
};

const setTaskFinishStatusV1Semipure = (
  tasks: V1_Task[],
  id: number,
  status: FinishedState
) => {
  return tasks.map((task) => {
    if (task.id === id) {
      if (status !== FinishedState.NotFinished) {
        return {
          ...task,
          finishStatus: status,
          lastFinished: new Date().toISOString(),
        };
      } else {
        return {
          ...task,
          finishStatus: status,
        };
      }
    }
    return task;
  });
};

const planTaskForWeekV1Semipure = (tasks: V1_Task[], id: number) => {
  return tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        thisWeek: true,
        weekOrderIndex: 1,
      };
    }
    if (task.thisWeek) {
      return {
        ...task,
        weekOrderIndex: task.weekOrderIndex + 1,
      };
    } else {
      return task;
    }
  });
};

const unplanTaskV1Semipure = (tasks: V1_Task[], id: number) => {
  const taskToChange = tasks.find((task) => task.id === id);
  const taskToRemoveOrderIndex = taskToChange?.weekOrderIndex;

  return tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        thisWeek: false,
        weekOrderIndex: 0,
      };
    }
    // modify
    if (task.thisWeek && task.weekOrderIndex >= taskToRemoveOrderIndex) {
      return {
        ...task,
        weekOrderIndex: task.weekOrderIndex - 1,
      };
    } else {
      return task;
    }
  });
};

const setTaskNameV1Semipure = (
  tasks: V1_Task[],
  id: number,
  newTaskName: string
) => {
  return tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        name: newTaskName,
      };
    } else {
      return task;
    }
  });
};

const setTaskDueTimeV1Semipure = (
  tasks: V1_Task[],
  id: number,
  dueTime: Date
) => {
  return tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        dueTime: dueTime,
      };
    } else {
      return task;
    }
  });
};

export { scheduleTaskV1Semipure };
export { toggleFoldTaskV1Semipure };
export { toggleRepeatTaskV1Semipure };
export { completeTaskV1Semipure };
export { setTaskFinishStatusV1Semipure };
export { planTaskForWeekV1Semipure };
export { unplanTaskV1Semipure };
export { setTaskNameV1Semipure };
export { setTaskDueTimeV1Semipure };
