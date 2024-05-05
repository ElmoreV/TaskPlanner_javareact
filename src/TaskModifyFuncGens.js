import { FinishedState } from "./TaskInterfaces.tsx";


const getScheduleTask = (setTasks, tasks, id) => {
    const scheduleTask = () => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.scheduled = !task_to_change.scheduled;
        setTasks(newTasks);
    }
    return scheduleTask;
}


const getToggleRepeatTask = (setTasks, tasks, id) => {
    const toggleRepeatTask = () => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.repeated = !task_to_change.repeated;
        setTasks(newTasks);
    }
    return toggleRepeatTask;
}

// For v1 data
const getCompleteTask = (setTasks, tasks, id) => {
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

const getSetTaskFinishStatus = (setTasks, tasks, id) => {
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
const getPlanTaskForWeek = (setTasks, tasks, id) => {
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
const getUnplanTask = (setTasks, tasks, id) => {
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
const getSetTaskNameFunc = (setTasks, tasks, id) => {
    const setTaskName = (newTaskName) => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.name = newTaskName;
        setTasks(newTasks);
    }
    return setTaskName;
}


export { getCompleteTask };
export { getScheduleTask };
export { getToggleRepeatTask }
export { getUnplanTask };
export { getPlanTaskForWeek };
export { getSetTaskNameFunc };
export { getSetTaskFinishStatus }; 