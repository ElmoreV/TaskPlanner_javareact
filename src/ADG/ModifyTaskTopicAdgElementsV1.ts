/*
The elementary functions
*/
import { V1_Task } from '../Converters/V1_types.ts'
import { FinishedState } from '../Tasks/TaskInterfaces.tsx'
import { getFreeTaskId } from '../Topics/TopicHelper.js'

const generateEmptyTaskV1 = (tasks: V1_Task[]) => {
    let newId = getFreeTaskId(tasks)
    console.debug(`Generate empty task ${newId}`)
    let newTask = {
        name: `New Task ${newId}!`,
        id: newId,
        topics: [],
        topicViewIndices: [],
        subTaskIds: [],
        completed: false,
        finishStatus: FinishedState.NotFinished,
        thisWeek: false,
        repeated: false,
        scheduled: false,
        weekOrderIndex: 0
    }
    return newTask
}


const addOrphanTasktoTaskListV1 = (tasks: V1_Task[], task: V1_Task) => {
    console.info(`Add task with id ${task.id} to tasks`)
    let newTasks = [...tasks]
    newTasks.push(task)
    return newTasks
}


// Insert an existig task (even with no instances) into the topic
// Does not check if task already exsists
// Does not check if topic exists
// Does not check if the task is well-shaped (same length taskIds as topicViewIndices)
// Assumes there is only one instance of a task in every topic
// Returns a shallow copy with the changed tasks 
const insertTaskInstanceIntoTopicV1 = (tasks: V1_Task[], taskId: number, topicId: number, topicViewIndex?: number) => {
    console.info(`Insert task instance with task.id: ${taskId} into topic with id: ${topicId} at view index ${topicViewIndex}`)

    if (topicViewIndex === undefined) {
        topicViewIndex = 0
    }
    let newTasks = [...tasks]
    // Find all tasks that are in the topic
    let tasksInTopic = newTasks.filter((task) => task.topics.includes(topicId))
    let thisTask = newTasks.find((task) => (task.id === taskId))
    //Shift up all tasks at or above the topicOrderIndex
    tasksInTopic.forEach((taskInTopic) => {
        let topicIdx = taskInTopic.topics.findIndex(taskTopicId => topicId == taskTopicId)
        if (taskInTopic.topicViewIndices[topicIdx] >= topicViewIndex) {
            taskInTopic.topicViewIndices[topicIdx] = taskInTopic.topicViewIndices[topicIdx] + 1
        }
    })
    // Add topicId and topicViewIndex
    thisTask.topics.push(topicId)
    thisTask.topicViewIndices.push(topicViewIndex)
    return newTasks
}


// Insert an existig subTask (even with no instances) into the current task (as supertask)
// Does not check if subtask already exsists
// Does not check if supertask exists
// Assumes task ids are unique
// Returns a shallow copy with the changed tasks 
const insertTaskInstanceIntoTaskV1 = (tasks: V1_Task[], subTaskId: number, superTaskId: number) => {
    console.info(`Insert task instance with task.id: ${subTaskId} into (super)task with id: ${superTaskId}`)
    //TODO: add taskViewIndices

    let newTasks = [...tasks]
    let superTask = newTasks.find((task) => (task.id == superTaskId))
    superTask.subTaskIds.push(subTaskId)
    return newTasks
}


// Assumes the viewIndices of all tasks exists
// Assumes the task is in the topic
// Assumes tha taskId exists in the tasks
// Assumes the topicViewIndices are all positive (and more assumptions)
// 
const removeTaskInstanceFromTopicV1 = (tasks: V1_Task[], taskId: number, topicId: number) => {
    console.info(`Removing task instance with task.id: ${taskId} from topic with id: ${topicId}`)

    let newTasks = [...tasks]
    let tasksInTopic = newTasks.filter((task) => task.topics.includes(topicId))
    let thisTask = newTasks.find((task) => (task.id === taskId))
    let topicIdIdx = thisTask.topics.findIndex(taskTopicId => taskTopicId === topicId)
    let topicViewIndex = thisTask.topicViewIndices[topicIdIdx]

    //Shift down all tasks at or above the topicOrderIndex
    tasksInTopic.forEach((taskInTopic) => {
        let topicIdx = taskInTopic.topics.find(taskTopicId => topicId === taskTopicId)
        if (taskInTopic.topicViewIndices[topicIdx] > topicViewIndex) {
            taskInTopic.topicViewIndices[topicIdx] -= 1
        }
    })
    // Remove topicId and topicViewIndex
    thisTask.topics.splice(topicIdIdx, 1)
    thisTask.topicViewIndices.splice(topicIdIdx, 1)
    return newTasks
}


// Assumes tha taskId exists in the tasks
const removeTaskInstanceFromTaskV1 = (tasks: V1_Task[], taskId: number, superTaskId: number) => {
    console.debug(`Removing task instance with task.id: ${taskId} from task with id: ${superTaskId}`)

    let newTasks = [...tasks]
    let superTask = newTasks.find((task) => (task.id === superTaskId))
    // let subTask = newTasks.find((task) => (task.id === taskId))
    let subTaskIdIdx = superTask.subTaskIds.findIndex(subTaskId => subTaskId === taskId)

    // Remove subTask
    superTask.subTaskIds.splice(subTaskIdIdx, 1)
    return newTasks
}


// Pretty much no assumptions.
const deleteEntireTaskV1 = (tasks: V1_Task[], taskId: number) => {
    let newTasks = [...tasks]
    newTasks = newTasks.filter(task => (task.id !== taskId))
    // Remove this id from subtasks
    newTasks = newTasks.map(task => {
        return {
            ...task,
            subTaskIds: (task.subTaskIds ? task.subTaskIds.filter(st => (st !== taskId)) : []),
        }
    })

    return newTasks
}


export { generateEmptyTaskV1 }
export { addOrphanTasktoTaskListV1 }
export { insertTaskInstanceIntoTopicV1 }
export { removeTaskInstanceFromTopicV1 }
export { insertTaskInstanceIntoTaskV1 }
export { removeTaskInstanceFromTaskV1 }
export { deleteEntireTaskV1 }
