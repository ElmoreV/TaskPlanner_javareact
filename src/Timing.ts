



// Shows tasks that are due in the next timeIntervalInSeconds
const showTasksDueIn = (tasks, now: Date, timeIntervalInSeconds: number) => {
    let dueTime = now.setSeconds(now.getSeconds() + timeIntervalInSeconds)
    return tasks.filter(task => (task.dueTime && task.dueTime < dueTime));
}

const isTaskDueIn = (task, now: Date, timeIntervalInSeconds: number) => {
    let dueTime = now.setSeconds(now.getSeconds() + timeIntervalInSeconds)
    if (task.dueTime === undefined)
        return false
    return task.dueTime < dueTime
}


export { isTaskDueIn, showTasksDueIn }