import { V1_Task } from "../Converters/V1_types.ts";
import { FinishedState } from "./TaskInterfaces.tsx";

const scheduleTaskV1Semipure = (tasks: V1_Task[], id: number) => {
    const newTasks = [...tasks]
    const taskToChange = newTasks.find((task) => task.id === id);
    if (taskToChange === undefined) { return newTasks; }
    taskToChange.scheduled = !taskToChange.scheduled;
    return newTasks;
}

const toggleFoldTaskV1Semipure = (tasks: V1_Task[], id: number) => {
    const newTasks = [...tasks];
    let taskToChange = newTasks.find(task => (task.id == id))
    if (taskToChange === undefined) { return newTasks; }
    taskToChange.unfolded = !taskToChange.unfolded
    return newTasks;
}

const toggleRepeatTaskV1Semipure = (tasks: V1_Task[], id: number) => {
    const newTasks = [...tasks]
    const taskToChange = newTasks.find((task) => task.id === id);
    if (taskToChange === undefined) { return newTasks; }
    taskToChange.repeated = !taskToChange.repeated;
    return newTasks;
}

const completeTaskV1Semipure = (tasks: V1_Task[], id: number) => {
    const newTasks = [...tasks]
    const taskToChange = newTasks.find((task) => task.id === id);
    if (taskToChange === undefined) { return newTasks; }
    taskToChange.completed = !taskToChange.completed;
    if (taskToChange.completed) {
        taskToChange.finishStatus = FinishedState.Completed
        taskToChange.lastFinished = new Date().toISOString()
    }
    else { taskToChange.finishStatus = FinishedState.NotFinished }
    return newTasks;
}

const setTaskFinishStatusV1Semipure = (tasks: V1_Task[], id: number, status: FinishedState) => {
    const newTasks = [...tasks]
    const taskToChange = newTasks.find((task) => task.id === id);
    if (taskToChange === undefined) { return newTasks; }
    taskToChange.finishStatus = status;
    if (status !== FinishedState.NotFinished) {
        taskToChange.lastFinished = new Date().toISOString()
    }
    return newTasks;
}

const planTaskForWeekV1Semipure = (tasks: V1_Task[], id: number) => {
    let newTasks = [...tasks]
    const taskToChange = newTasks.find((task) => task.id === id);
    if (taskToChange === undefined) { return newTasks; }

    // modify
    newTasks = newTasks.map((task) => {
        if (task.thisWeek) { task.weekOrderIndex += 1 };
        return task
    })
    taskToChange.thisWeek = true;
    taskToChange.weekOrderIndex = 1;
    return newTasks;
}

const unplanTaskV1Semipure = (tasks: V1_Task[], id: number) => {
    let newTasks = [...tasks]
    const taskToChange = newTasks.find((task) => task.id === id);
    if (taskToChange === undefined) { return newTasks; }

    taskToChange.thisWeek = false;
    newTasks = newTasks.map((task) => {
        if (task.thisWeek && task.weekOrderIndex >= taskToChange.weekOrderIndex) {
            task.weekOrderIndex -= 1
        };
        return task
    })
    taskToChange.weekOrderIndex = 0;
    return newTasks;
}

const setTaskNameV1Semipure = (tasks: V1_Task[], id: number, newTaskName: string) => {
    const newTasks = [...tasks]
    const taskToChange = newTasks.find((task) => task.id === id);
    if (taskToChange === undefined) { return newTasks; }

    taskToChange.name = newTaskName;
    return newTasks;
}

const setTaskDueTimeV1Semipure = (tasks: V1_Task[], id: number, dueTime: Date) => {
    const newTasks = [...tasks]
    const taskToChange = newTasks.find((task) => task.id === id);
    if (taskToChange === undefined) { return newTasks; }
    taskToChange.dueTime = dueTime;
    return newTasks;
}




export { scheduleTaskV1Semipure };
export { toggleFoldTaskV1Semipure };
export { toggleRepeatTaskV1Semipure }
export { completeTaskV1Semipure };
export { setTaskFinishStatusV1Semipure };
export { planTaskForWeekV1Semipure };
export { unplanTaskV1Semipure };
export { setTaskNameV1Semipure };
export { setTaskDueTimeV1Semipure };