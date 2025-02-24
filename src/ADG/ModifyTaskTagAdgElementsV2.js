/*
The elementary functions
*/
import { FinishedState } from '../Tasks/TaskInterfaces.tsx'
import { getFreeTaskId } from '../Topics/TopicHelper.js'

const generateEmptyTaskV2 = (tasks) => {
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

const addOrphanTasktoTaskListV2 = (tasks, task) => {
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
const insertTaskInstanceIntoTopicV2 = (tasks, taskId, topicId, topicViewIndex) => {
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
const insertTaskInstanceIntoTaskV2 = (tasks, subTaskId, superTaskId) => {
    console.info(`Insert task instance with task.id: ${subTaskId} into (super)task with id: ${superTaskId}`)
    //TODO: add taskViewIndices

    let newTasks = [...tasks]

    let superTask = newTasks.find((task) => (task.id == superTaskId))
    // let subTask = newTasks.find((task) => (task.id === subTaskId))
    console.log(superTask)
    superTask.subTaskIds.push(subTaskId)
    console.log(superTask)
    return newTasks
}




// Assumes the viewIndices of all tasks exists
// Assumes the task is in the topic
// Assumes tha taskId exists in the tasks
// Assumes the topicViewIndices are all positive (and more assumptions)
// 
const removeTaskInstanceFromTopicV1 = (tasks, taskId, topicId) => {
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


// Assumes the viewIndices of all tasks exists
// Assumes the task is in the topic
// Assumes tha taskId exists in the tasks
// Assumes the topicViewIndices are all positive (and more assumptions)
// 
const removeTaskInstanceFromTaskV2 = (taskMap, taskId, superTaskId) => {
    console.debug(`Removing task instance with task.id: ${taskId} from task with id: ${superTaskId}`)
    let newTaskMap = { ...taskMap }
    let superTask = newTaskMap[superTaskId]
    let subTask = newTaskMap[taskId]
    superTask.childTaskIds = superTask.childTaskIds.filter(childTaskId => childTaskId !== taskId)
    subTask.parentTaskIds = subTask.parentTaskIds.filter(parentTaskId => parentTaskId !== superTaskId)
    return newTaskMap
}


// Pretty much no assumptions.
const deleteEntireTaskV2 = (taskMap, tagTaskMap, taskId) => {
    let newTaskMap = { ...taskMap }
    let taskToDelete = newTaskMap[taskId]
    // Remove this id from child tasks and parent tasks
    taskToDelete.childTaskIds.forEach(childTaskId => {
        let childTask = newTaskMap[childTaskId]
        childTask.parentTaskIds = childTask.parentTaskIds.filter(parentTaskId => parentTaskId !== taskId)
    })
    taskToDelete.parentTaskIds.forEach(parentTaskId => {
        let parentTask = newTaskMap[parentTaskId]
        parentTask.childTaskIds = parentTask.childTaskIds.filter(childTaskId => childTaskId !== taskId)
    })
    // Remove the task from the taskMap
    delete newTaskMap[taskId]

    // Remove this id from the tagTaskMap
    let newTagTaskMap = { ...tagTaskMap }
    Object.entries(newTagTaskMap).forEach(
        ([tagId, taskIds]) => {
            let newTaskIds = taskIds.filter(taskId => taskId !== taskId)
            tagTaskMap[tagId] = newTaskIds
        }
    )

    return { newTaskMap, newTagTaskMap }
}



export { generateEmptyTaskV2 }
export { addOrphanTasktoTaskListV2 }
export { insertTaskInstanceIntoTopicV2 }
export { removeTaskInstanceFromTopicV2 }
export { insertTaskInstanceIntoTaskV2 }
export { removeTaskInstanceFromTaskV2 }
export { deleteEntireTaskV2 }
