/*
The elementary functions
*/
import { getFreeTaskId } from './TopicHelper'

const generateEmptyTask = (tasks) => {
    let newId = getFreeTaskId(tasks)
    console.debug(`Generate empty task ${newId}`)
    let newTask = {
        name: `New Task ${newId}!`,
        id: newId,
        topics: [],
        topicViewIndices: [],
        completed: false,
        thisWeek: false,
        repeated: false,
        scheduled: false,
        weekOrderIndex: 0
    }
    return newTask
}

const addOrphanTasktoTaskList = (tasks, task) => {
    console.debug("Add task to tasks")
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
const insertTaskInstanceIntoTopic = (tasks, taskId, topicId, topicViewIndex) => {
    console.debug(`Insert task instance with task.id: ${taskId} into topic with id: ${topicId} at view index ${topicViewIndex}`)

    if (topicViewIndex === undefined) {
        topicViewIndex = 0
    }
    let newTasks = [...tasks]
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

// Assumes the viewIndices of all tasks exists
// Assumes the task is in the topic
// Assumes tha taskId exists in the tasks
// Assumes the topicViewIndices are all positive (and more assumptions)
// 
const removeTaskInstanceFromTopic = (tasks, taskId, topicId) => {
    console.debug(`Removing task instance with task.id: ${taskId} from topic with id: ${topicId}`)

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
    // Add topicId and topicViewIndex
    thisTask.topics.splice(topicIdIdx, 1)
    thisTask.topicViewIndices.splice(topicIdIdx, 1)
    return newTasks
}

// Pretty much no assumptions.
const deleteEntireTask = (tasks, taskId) => {
    let newTasks = [...tasks]
    newTasks = newTasks.filter(task => (task.id !== taskId))
    return newTasks
}



export { generateEmptyTask }
export { addOrphanTasktoTaskList }
export { insertTaskInstanceIntoTopic }
export { removeTaskInstanceFromTopic }
export { deleteEntireTask }


