import { FinishedState } from "./TaskInterfaces.tsx";


const getScheduleTaskV1 = (setTasks, tasks, id) => {
    const scheduleTask = () => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.scheduled = !task_to_change.scheduled;
        setTasks(newTasks);
    }
    return scheduleTask;
}

const getToggleFoldTaskV1 = (setTasks, tasks) => {
    const toggleFold = (id) => {
        const newTasks = [...tasks];
        let thisTask = newTasks.find(task => (task.id == id))
        thisTask.unfolded = !thisTask.unfolded
        setTasks(newTasks)
    }
    return toggleFold;
}


const getToggleRepeatTaskV1 = (setTasks, tasks, id) => {
    const toggleRepeatTask = () => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.repeated = !task_to_change.repeated;
        setTasks(newTasks);
    }
    return toggleRepeatTask;
}

// For v1 data
const getCompleteTaskV1 = (setTasks, tasks, id) => {
    const completeTask = () => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.completed = !task_to_change.completed;
        if (task_to_change.completed) {
            task_to_change.finishStatus = FinishedState.Completed
            task_to_change.lastFinished = new Date().toISOString()
        }
        else { task_to_change.finishStatus = FinishedState.NotFinished }
        setTasks(newTasks);
    }
    return completeTask;
}

const getSetTaskFinishStatusV1 = (setTasks, tasks, id) => {
    const setTaskFinishStatus = (status) => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.finishStatus = status;
        if (status !== FinishedState.NotFinished) {
            task_to_change.lastFinished = new Date().toISOString()
        }
        setTasks(newTasks);
    }
    return setTaskFinishStatus;
}


// For v1 data
const getPlanTaskForWeekV1 = (setTasks, tasks, id) => {
    const planTaskForWeek = () => {
        let newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        newTasks = newTasks.map((task) => {
            if (task.thisWeek) { task.weekOrderIndex += 1 };
            return task
        })
        task_to_change.thisWeek = true;
        task_to_change.weekOrderIndex = 1;
        console.log(newTasks.map((task) => {
            if (task.thisWeek) { return [task.name, task.weekOrderIndex] }
        }))
        setTasks(newTasks);
    }
    return planTaskForWeek
}


//v0
const getUnplanTaskV1 = (setTasks, tasks, id) => {
    const unplanTask = () => {
        let newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.thisWeek = false;

        newTasks = newTasks.map((task) => {
            if (task.thisWeek && task.weekOrderIndex >= task_to_change.weekOrderIndex) {
                task.weekOrderIndex -= 1
            };
            return task
        })
        task_to_change.weekOrderIndex = 0;
        console.log(newTasks.map((task) => {
            if (task.thisWeek) { return [task.name, task.weekOrderIndex] }
        }))
        setTasks(newTasks);
    }
    return unplanTask
}

// For v1 data
const getSetTaskNameFuncV1 = (setTasks, tasks, id) => {
    const setTaskName = (newTaskName) => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.name = newTaskName;
        setTasks(newTasks);
    }
    return setTaskName;
}

const getSetTaskDueTimeV1 = (setTasks, tasks, id: number) => {
    const setTaskDueTime = (dueTime: Date) => {
        const newTasks = [...tasks]
        const taskToChange = newTasks.find((task) => task.id === id);
        taskToChange.dueTime = dueTime;
        setTasks(newTasks);
    }
    return setTaskDueTime;
}





export { getCompleteTaskV1 };
export { getScheduleTaskV1 };
export { getToggleRepeatTaskV1 }
export { getUnplanTaskV1 };
export { getPlanTaskForWeekV1 };
export { getSetTaskNameFuncV1 };
export { getSetTaskFinishStatusV1 };
export { getToggleFoldTaskV1 };
export { getSetTaskDueTimeV1 };