import {
    getFreeTaskId,
    getFreeTopicKey,
    isTaskInAnyTopicV1,
    filterTopicsById_r,
} from './TopicHelper';
import {
    findSupertopicByTopicId,
    findTopicByTopicId,
} from './FindItems'

///////////////
/// Changing tasks
//////////////

// Can be used for v1 mode.
const getChangeTaskTopic = (setTasks, tasks) => {
    // Key here is the key of the task
    // oldTopic is the topic-object where the task came from
    // newTopic is the topic-object where the task is going to

    const changeTaskTopic = (taskIds, oldTopicIds, newTopicId) => {
        // if (!Array.isArray(taskIds)) { taskIds = [taskIds] }
        // if (!Array.isArray(oldTopicIds)) { oldTopicIds = [oldTopicIds] }
        // if (oldTopicIds.length != taskIds.length) {
        //     console.error('The length of the taskIds and oldTopicIds should be the same')
        //     return
        // }

        // console.debug('Inside change task topic (by id)')
        // const newTasks = tasks.map((task) => {
        //     if (taskIds.includes(task.id)) //cannot be ===?
        //     {
        //         console.debug("Found the task")
        //         console.debug(task)
        //         console.debug(oldTopicIds)
        //         // TODO: there is a possibility that the new Topic Id does not exist.
        //         // findTopicByTopicId(topic,newTopicId)
        //         let containedTopicIds = task.topics.filter((tt) => oldTopicIds.includes(tt))
        //         if (containedTopicIds.length > 0) {
        //             console.debug("And comes from the old Topic indeed")
        //             return {
        //                 ...task,
        //                 topics: task.topics.map((topicId) => oldTopicIds.includes(topicId) ? newTopicId : topicId)
        //             }
        //         }
        //     }
        //     return task;
        // });
        let newTasks = [...tasks]
        newTasks = updateTaskTopicIds(newTasks, taskIds, oldTopicIds, newTopicId)
        setTasks(newTasks);
    }

    return changeTaskTopic

}



// For v1 data
// This one is called on the Update Topic name when doing 
const getUpdateTaskTopics = (setTasks, tasks, curTopicId) => {
    const updateTaskTopics = (newTopicId) => {
        const newTasks = tasks.map((task) => {
            if (task.topics.includes(curTopicId)) {
                return {
                    ...task,
                    topics: task.topics.map((topicId) => topicId === curTopicId ? newTopicId : topicId)
                }
            }
            return task;
        });
        setTasks(newTasks);
    }
    return updateTaskTopics;
}

// const findIndicesExp = (arr,) => arr.reduce

const findIndices = (arr, val) => arr.reduce((accList, el, idx) => (el == val ? [...accList, idx] : accList), [])
const findNotIndices = (arr, val) => arr.reduce((accList, el, idx) => (el != val ? [...accList, idx] : accList), [])

const updateTaskTopicIds = (tasks, taskIds, sourceTopicIds, targetTopicId) => {
    if (!Array.isArray(taskIds)) { taskIds = [taskIds] }
    if (!Array.isArray(sourceTopicIds)) { sourceTopicIds = [sourceTopicIds] }
    if (sourceTopicIds.length != taskIds.length) {
        console.error('The length of the taskIds and sourceTopicIds should be the same')
        return
    }

    console.debug('Inside change task topic (by id)')
    const tasksToChange = tasks.filter(task => taskIds.includes(task.id))
    //inside these tasks, change the topic corresponding to the taskId in this thingy.
    tasksToChange.forEach(task => {
        //For single selected task it's
        // idx = taskIds.findIndex(task.id) 
        // topicIdIdx = task.topics.findIndex(sourceTopicIds[idx])
        // task.topics[topicIdIdx]=targetTopicId
        // Oh wait, it should also deduplicate the task if it's alreday in the topic.
        // TODO: Deduplicate task.topics at the end
        //Might have the task selected multiple times.
        let idcs = taskIds.reduce((accList, taskId, idx) => (taskId == task.id ? [...accList, idx] : accList), [])
        idcs.forEach(idx => {
            let topicIdIdcs = findIndices(task.topics, sourceTopicIds[idx])
            topicIdIdcs.forEach(idx2 =>
                task.topics[idx2] = targetTopicId)
        })

    })
    return tasks

}

const updateTopicViewIndices = (tasks, taskIds, sourceTopicIds, targetTopicId, sourceViewIndices, targetViewIndex) => {
    //
    let newTasks = [...tasks]
    let tasksToChange = newTasks.filter((task) => taskIds.includes(task.id))
    // Task-> Topic A 2 Task-> Topic B
    let indicesMove = findIndices(sourceTopicIds, targetTopicId)
    // Task-> Topic A 2 Task -> Topic A
    let indicesStay = findNotIndices(sourceTopicIds, targetTopicId)
    //Moving indices should be inserted at the right targetViewIndex
    let tasksInTargetTopic = newTasks.filter((task) => task.topics.includes(targetTopicId))

    let insertedTasksCount = indicesMove.length //All tasks at and after the target View Index should be increased be this amount
    // All tasks that are shuffled within the topic should be shuffled like always (with the weird logic)


}


const shuffleTopicOrderIndicesWithinTopic = (tasks, taskIds, sourceOrderIndices, targetOrderIndex) => {
    let newTasks = [...tasks]
    let taskId = taskIds[0]
    // let topic = find
    let sourceOrderIdx = sourceOrderIndices[0]
    let taskToChange = newTasks.filter(task => task.id == taskId)
    console.log('called change topic order with ', taskIds, sourceOrderIndices, targetOrderIndex)
    // If we go to an index before, we need to shift down all the ones before
    // If we go down an index after, we need to shift up all the ones after
    console.log(newTasks.map(t => t.id + '|' + t.name + '|' + t.topicViewIndices))
    newTasks = newTasks.map(task => {
        return {
            ...task,
            topicViewIndices: task.topicViewIndices.map(
                idx => {
                    if (sourceOrderIdx < idx && idx <= targetOrderIndex) {
                        console.log(idx, idx + 1)
                        return idx - 1
                    } else if (targetOrderIndex <= idx && idx < sourceOrderIdx) {
                        console.log(idx, idx - 1)
                        return idx + 1
                    } else if (idx == sourceOrderIdx) {
                        return targetOrderIndex
                    }
                    else {
                        return idx
                    }
                }
            )
        }
    })
    console.log(newTasks.map(t => t.id + '|' + t.name + '|' + t.topicViewIndices))
    return newTasks
}


const getMoveTask = (topics, tasks, setTasks) => {
    const moveTask = (taskIds, sourceTopicIds, targetTopicId, sourceViewIndices, targetViewIndex) => {
        let newTasks = [...tasks]
        //Task 1. Change the topic ids in the tasks to the target topic Id\
        newTasks = updateTaskTopicIds(newTasks, taskIds, sourceTopicIds, targetTopicId)
        //Task 2. For the target topic, we need to insert all the tasks at the target view index
        //Task 3(Optional). For all the source Topics, we need to handle the reordering of the leftover tasks
        //Task 4. Clean up duplicate topic Ids (by moving duplicates around)

    }

}




// For v1 data
const getDuplicateTask = (setTasks, tasks, topics) => {
    const duplicateTask = (task_id, topic_id) => {
        // Copy tasks
        let newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id == task_id);
        console.debug(task_to_change)
        const topic_to_add = findTopicByTopicId(topics, topic_id)
        if (task_to_change.topics.includes(topic_to_add.id)) {
            console.info("Task is already in topic")
            return;
        }
        task_to_change.topics.push(topic_to_add.id)
        setTasks(newTasks)
    }
    return duplicateTask
}


const getAddTask = (setTasks, tasks, topics, topicId) => {

    const addTask = () => {
        let newTasks = [...tasks];
        console.log(topicId);
        const topic = findTopicByTopicId(topics, topicId);
        if (topic) {
            // Get the topicViewOrderInside the topic
            let tasksInTopic = newTasks.filter(t => t.topics.includes(topicId))
            let taskOrderIdcs = tasksInTopic.map(t => t.topicViewIndices[t.topics.findIndex(t => t == topicId)])
            let maxTaskOrderIdx = Math.max(...tasks.map(t => Math.max(...t.topicViewIndices)))
            // console.log('max-task:', maxTaskOrderIdx)
            // console.log(tasks.map(t => Math.max(t.topicViewIndices)))
            console.log("Ïndices")
            console.log(taskOrderIdcs)
            const addedTask = {
                name: `New Task ${getFreeTaskId(tasks)}!`,
                id: getFreeTaskId(tasks),
                topics: [topic.id],
                topicViewIndices: [maxTaskOrderIdx + 1]
            }
            newTasks.push(addedTask);
            // Put the added task as the first task in the topic
            if (tasksInTopic.length > 0) {
                newTasks = changeTopicOrderIndices(newTasks, [addedTask.id], [addedTask.topicViewIndices[0]],
                    Math.min(...taskOrderIdcs))
            }
            console.log(newTasks);
            setTasks(newTasks);

        }

    }
    return addTask
}

// For v1 data
const getDeleteTask = (setTasks, tasks, id) => {
    const deleteTask = () => {
        let newTasks = [...tasks]
        newTasks = newTasks.filter((task) => task.id !== id);
        setTasks(newTasks);

    }
    return deleteTask;
}


const checkValidWeekOrderIndex = (tasks) => {
    // Check if there are undefined values
    const getWrongTasks = tasks.filter((task) => task.weekOrderIndex == undefined)
    if (getWrongTasks.length > 0) { return false }
    // Check if the values are not 0 for tasks where task.thisWeek=false
    const getWrongTasks2 = tasks.filter((task) => !task.thisWeek && task.weekOrderIndex != 0)
    if (getWrongTasks2.length > 0) { return false }
    // TODO: sdf
    // Check if the values are not exactly 1,2,3,4,....
    const getWrongTasks3 = tasks.filter((task) => task.thisWeek && task.weekOrderIndex < 1)
    if (getWrongTasks3.length > 0) { return false }
    // Check if there are duplicate weekOrderIndices
    const getWrongTasks4 = tasks.filter((task) => task.thisWeek).map((task) => task.weekOrderIndex)
    if (new Set(getWrongTasks4).size !== getWrongTasks4.length) { return false }
    // TODO:

    return true

}

const sanitizeWeekOrderIndex2 = (tasks) => {
    let newTasks = [...tasks]
    if (checkValidWeekOrderIndex(tasks)) { return newTasks; }

    //gather all the tasks with and without a weekOrderIndex
    // if thisWeek=false: weekOrderIndex = 0
    // if thisWeek=true: weekOrderIndex = value
    let nextVal = 1
    newTasks = newTasks.map((task) => {
        if (!task.thisWeek) { task.weekOrderIndex = 0 }
        else {
            task.weekOrderIndex = nextVal
            nextVal += 1
        }
        return task;
    })

    return newTasks
}


const sanitizeWeekOrderIndex = (setTasks, tasks) => {
    let newTasks = [...tasks]
    if (checkValidWeekOrderIndex(tasks)) { return; }
    console.warn("Found invalid weekOrderIndex. Reordering...")
    //gather all the tasks with and without a weekOrderIndex
    // if thisWeek=false: weekOrderIndex = 0
    // if thisWeek=true: weekOrderIndex = value
    let nextVal = 1
    newTasks = newTasks.map((task) => {
        if (!task.thisWeek) { task.weekOrderIndex = 0 }
        else {
            task.weekOrderIndex = nextVal
            nextVal += 1
        }
        return task;
    })

    setTasks(newTasks)
}

// TODO: make this way nicer. This feels wacked.
const getChangeWeekOrderIndex = (setTasks, tasks) => {
    const changeWeekOrderIndex = (taskIds, sourceWeekOrderIndices, targetWeekOrderIndex) => {
        console.log(taskIds, sourceWeekOrderIndices, targetWeekOrderIndex)

        if (!Array.isArray(taskIds)) { taskIds = [taskIds] }
        if (!Array.isArray(sourceWeekOrderIndices)) { sourceWeekOrderIndices = [sourceWeekOrderIndices] }
        console.log(taskIds, sourceWeekOrderIndices, targetWeekOrderIndex)

        // Sort the tasks and sourceWeekOrderIndices by their sourceWeekOrderIndex
        let zipped = taskIds.map((el, idx) => [el, sourceWeekOrderIndices[idx]]);
        zipped = zipped.sort((a, b) => a[1] - b[1]);
        // Remove duplicate task Ids
        zipped = zipped.filter((el, idx, self) => self.findIndex((t) => t[0] === el[0]) === idx);
        // Exclude any tasks that are the target
        zipped = zipped.filter((el) => el[1] !== targetWeekOrderIndex);
        taskIds = zipped.map((el) => el[0]);
        sourceWeekOrderIndices = zipped.map((el) => el[1]);
        console.log(taskIds, sourceWeekOrderIndices, targetWeekOrderIndex)

        let newTasks = [...tasks]
        console.log(newTasks.filter(t => t.thisWeek).map(t => [t.name, t.weekOrderIndex]))


        let tasksBeforeTarget = sourceWeekOrderIndices.filter((idx) => idx < targetWeekOrderIndex).length
        let direction = 0

        // If the target task is before the source task, move all tasks between source tasks and target task up
        // Includes target task
        if (targetWeekOrderIndex < sourceWeekOrderIndices[0]) {
            // Reorder all tasks squeezed between the source tasks and the target task
            newTasks = newTasks.map((task) => {

                // Count the number of tasks that are marked to move that are  this task
                let tasksBefore = sourceWeekOrderIndices.filter((idx) => idx < task.weekOrderIndex).length
                let tasksAfter = sourceWeekOrderIndices.filter((idx) => idx > task.weekOrderIndex).length
                // Move all tasks squeezed, which aren't marked to move
                if (task.thisWeek && !taskIds.includes(task.id)) {
                    if (task.weekOrderIndex >= targetWeekOrderIndex) {
                        task.weekOrderIndex += tasksAfter
                    }
                    else {
                        task.weekOrderIndex -= tasksBefore
                    }
                };
                return task
            })

            // If the target task is after the first source task, move all tasks between source tasks and target task down
        } else if (targetWeekOrderIndex > sourceWeekOrderIndices[0]) {
            // move all indices behind this target task
            newTasks = newTasks.map((task) => {
                // Count the number of tasks that are marked to move that are before this task
                let tasksBefore = sourceWeekOrderIndices.filter((idx) => idx <= task.weekOrderIndex).length
                let tasksAfter = sourceWeekOrderIndices.filter((idx) => idx > task.weekOrderIndex).length
                if (task.thisWeek && !taskIds.includes(task.id)) {
                    if (task.weekOrderIndex <= targetWeekOrderIndex) {
                        task.weekOrderIndex -= tasksBefore
                    }
                    else {
                        task.weekOrderIndex += tasksAfter
                    }
                };
                return task
            })
            direction = - tasksBeforeTarget + 1
        }
        console.log(newTasks.filter(t => t.thisWeek).map(t => [t.name, t.weekOrderIndex]))

        const tasks_to_change = newTasks.filter((task) => taskIds.includes(task.id));
        const tasks_to_change_indices = tasks_to_change.map((task, idx) => idx)

        // Change the weekOrderIndex of the tasks to change
        tasks_to_change.forEach((task) => {
            task.weekOrderIndex = targetWeekOrderIndex + tasks_to_change_indices[taskIds.indexOf(task.id)] + direction
        })

        console.log(newTasks.filter(t => t.thisWeek).map(t => [t.name, t.weekOrderIndex]))

        setTasks(newTasks)
    }
    return changeWeekOrderIndex;
}


/////////////////////////
/// Changing topics
//////////////////////////

// Both for v0 and v1 data
const getMoveTopic = (setTopics, topics) => {
    const moveTopic = (source_id, target_id) => {
        console.info(`Moving topic ${source_id} to ${target_id}`)
        // Cannot move a topic into one of its sub(sub)topics
        let source_topic = findTopicByTopicId(topics, source_id)
        console.info(source_topic)
        let is_sub_topic = findTopicByTopicId(source_topic.subtopics, target_id)
        if (is_sub_topic) {
            console.log("Cannot move a topic to its own subtopic")
            return
        }
        // If the target topic is the sources topic direct supertopic, also don't do it
        // Find the super topic of the source topic
        let newTopics = [...topics];
        let source_supertopic = findSupertopicByTopicId(newTopics, source_id)
        if (!source_supertopic) {
            console.log("There is no supertopic. Is this a root topic?")
            let target_topic = findTopicByTopicId(newTopics, target_id)
            console.info(target_topic)
            console.info(source_supertopic)
            // Copy the topic into the new topic
            target_topic.subtopics.push(source_topic)
            // Delete the topic out of its current spot
            newTopics = newTopics.filter((t) => t.id != source_topic.id)
            setTopics(newTopics)
            return

        }
        if (source_supertopic.id == target_id) {
            console.log("Will not move a topic to its direct supertopic. It does nothing")
            return

        }
        let target_topic = findTopicByTopicId(newTopics, target_id)
        console.info(target_topic)
        console.info(source_supertopic)
        // Copy the topic into the new topic
        target_topic.subtopics.push(source_topic)
        // Delete the topic out of its current spot
        source_supertopic.subtopics = source_supertopic.subtopics.filter((t) => t.id != source_topic.id)
        setTopics(newTopics)
    }
    return moveTopic
}


const getAddTopic = (setTopics, topics) => {
    const addTopic = () => {
        let newTopics = [...topics];
        const addedTopic = {
            name: `New Topic ${getFreeTopicKey(topics)}`,
            id: getFreeTopicKey(topics),
            unfolded: true,
            subtopics: []
        }
        newTopics.push(addedTopic);
        console.debug(newTopics);
        setTopics(newTopics);
    }
    return addTopic
}

// This one might be separated
const addSubtopic_r = (topic, superTopic, newSubTopic) => {
    if (topic.id == superTopic.id) {
        //Add subtopic here
        topic.subtopics = [newSubTopic,
            ...topic.subtopics,
        ];
        return topic;
    } else {
        //recurse through all subtopics
        return {
            ...topic,
            subtopics: topic.subtopics.map((topic) => addSubtopic_r(topic, superTopic, newSubTopic))
        }
    }
}

const getAddSubtopic = (setTopics, topics, superTopic) => {
    // console.log("Creating add subtopic")
    // console.log(topic);
    // console.log(topics)

    const addSubtopic = () => {
        console.log('In AddSubTopic')
        console.log(superTopic);
        console.log(topics)
        let newTopics = [...topics]
        const addedTopic = {
            name: `New Topic ${getFreeTopicKey(topics)}`,
            id: getFreeTopicKey(topics),
            unfolded: true,
            subtopics: []
        }
        console.log(addedTopic)
        console.log('start recursion')
        // now add this topic at the exact right spot
        // recurse through newTopics
        // and return the changed topic if it is the right topic
        newTopics = newTopics.map((topic_r) => addSubtopic_r(topic_r, superTopic, addedTopic));
        setTopics(newTopics);
    }
    return addSubtopic
}

////////////////////////////
/////  Sanitize topic and task order
/////////////////////////////

const checkValidTopicOrderIndex = (topics, tasks) => {
    // Every task needs to have as many topicOrderIndices as they have topics
    const getWrongTasks = tasks.filter((task) => task.topicViewIndices == undefined)
    if (getWrongTasks.length > 0) {
        console.debug("There are tasks that don't have topicViewIndices")
        return false
    }
    let valid2 = tasks.reduce((valid, task) => (valid & (task.topics.length == task.topicViewIndices.length)), true)
    if (!valid2) {
        console.debug("There are tasks that don't have the same amount of topicViewIndices as topics")
        return false
    }


    return true
}


const sanitizeTopicOrderIndex = (topics, tasks, setTasks) => {
    let newTasks = [...tasks]
    if (checkValidTopicOrderIndex(topics, tasks)) { return; }
    console.warn("Found invalid topicOrderIndex. Reordering...")

    const sanitize_r = (topics, tasks) => {
        newTasks = [...tasks]
        for (let topic of topics) {
            //Iterate through subtopics and update tasks
            newTasks = sanitize_r(topic.subtopics, newTasks)

            // are there tasks in this topic?
            let tasksInTopic = newTasks.filter((task) => task.topics.includes(topic.id))
            console.debug(`Tasks ${tasksInTopic.map(t => t.name)} in topic ${topic.name}`)
            // if there are tasks in this topic, give them an order index
            tasksInTopic = tasksInTopic.map(
                (task) => {
                    let idx = task.topics.findIndex((topicId) => topicId == topic.id)
                    if (!task.topicViewIndices) { task.topicViewIndices = new Array }
                    task.topicViewIndices[idx] = nextOrderVal
                    nextOrderVal += 1
                }
            )
        }
        return newTasks
    }

    // Recurse through all topics+tasks and fix the order.
    let nextOrderVal = 1
    newTasks = sanitize_r(topics, tasks)
    console.log(newTasks)
    setTasks(newTasks)
}




////////////////////////////////
/// Changing both topics and tasks
///////////////////////////////

// For v1 data
const getDeleteTopic = (setTopics, topics, setTasks, tasks, topicId) => {
    const deleteTopic = () => {
        let newTopics = [...topics]

        // Filter out any topic that is a subtopic of topicId, recursively
        newTopics = filterTopicsById_r(newTopics, topicId);
        // Find any orphan tasks (tasks without a topic)
        // and filter them
        // TODO: this is slow and not scalable. Fix when necessary.
        let newTasks = [...tasks]
        // all_subtopics = newTopics.
        newTasks = newTasks.filter((task) => isTaskInAnyTopicV1(task, newTopics))
        console.info('Length of tasks before deletion/length of tasks after deletion')
        console.info(tasks.length + ' / ' + newTasks.length)

        setTopics(newTopics);
        setTasks(newTasks);
    }
    return deleteTopic;
}

export default getChangeTaskTopic;
export { getChangeTaskTopic };
export { getDeleteTask };
export { getDeleteTopic };
export { getDuplicateTask };
export { getMoveTopic };
export { getUpdateTaskTopics };
export { getAddTask }
export { getAddTopic }
export { getAddSubtopic }
export { getChangeWeekOrderIndex }
export { sanitizeWeekOrderIndex }
export { sanitizeWeekOrderIndex2 }
export { sanitizeTopicOrderIndex }
export { changeTopicOrderIndices }


/// What I would need is basically
// A moveTaskToTopic
// moveTask