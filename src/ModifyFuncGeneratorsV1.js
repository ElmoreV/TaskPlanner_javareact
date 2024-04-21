import {
    getFreeTopicKey,
    isTaskInAnyTopic,
    filterTopicsById_r,
} from './TopicHelper';
import {
    findSupertopicByTopicId,
    findTopicByTopicId,
} from './FindItems'
import {
    addOrphanTasktoTaskList,
    deleteEntireTask,
    generateEmptyTask,
    insertTaskInstanceIntoTopic,
    removeTaskInstanceFromTopic
} from './ModifyTaskTopicAdgElements';

const getMoveTasks = (topics, tasks, setTasks) => {
    // taskIds here is the id of the task
    // sourceTopicIds is the topic-object where the task came from
    // targetTopicId is the topic-object where the task is going to
    const moveTasks = (taskIds, sourceTopicIds, targetTopicId, targetViewIndex) => {
        // Validation checks + defaults
        if (!Array.isArray(taskIds)) { taskIds = [taskIds] }
        if (!Array.isArray(sourceTopicIds)) { sourceTopicIds = [sourceTopicIds] }
        if (sourceTopicIds.length != taskIds.length) {
            console.error('The length of the taskIds and sourceTopicIds should be the same')
            return
        }
        let newTasks = [...tasks]
        const targetTopic = findTopicByTopicId(topics, targetTopicId)
        if (!targetTopic) {
            console.warn(`Target topic ${targetTopicId} does not exist.`)
            return
        }

        //TODO: remove duplicates
        //TODO: Make sure that tasks that come from the same topicId stay in the same order (local sequence so to say).
        // Maybe calculate a global index and sort them by this.


        // go through all 'operations' 1-by-1
        taskIds.forEach((taskId, idx) => {
            let sourceTopicId = sourceTopicIds[idx]
            newTasks = removeTaskInstanceFromTopic(newTasks, taskId, sourceTopicId)
            // If the task is already in the targetTopic, remove it
            let taskTopics = newTasks.find((task) => task.id == taskId);
            if (taskTopics.topics.includes(targetTopicId)) {
                console.info(`Task ${taskId} is already in topic ${targetTopicId}`)

                newTasks = removeTaskInstanceFromTopic(newTasks, taskId, targetTopicId)
            }
            newTasks = insertTaskInstanceIntoTopic(newTasks, taskId, targetTopicId, targetViewIndex)
        })
        setTasks(newTasks)
    }
    return moveTasks
}

const getDuplicateTask = (setTasks, tasks, topics) => {
    const duplicateTask = (taskIds, targetTopicId, targetViewIndex) => {
        // Validation checks + defaults
        // Convert single items to a list
        if (!Array.isArray(taskIds)) { taskIds = [taskIds] }
        if (targetViewIndex === undefined) { targetViewIndex = 1 }
        const targetTopic = findTopicByTopicId(topics, targetTopicId)
        if (!targetTopic) {
            console.warn(`Target topic ${targetTopicId} does not exist.`)
            return
        }

        // Copy tasks
        let newTasks = [...tasks]
        taskIds.forEach(taskId => {
            const task_to_change = newTasks.find((task) => task.id == taskId);
            if (task_to_change.topics.includes(targetTopicId)) {
                console.info(`Task ${task_to_change.id} is already in topic ${targetTopicId}`)
                return;
            }
            newTasks = insertTaskInstanceIntoTopic(newTasks, taskId, targetTopicId, targetViewIndex)

        })
        setTasks(newTasks)
    }
    return duplicateTask
}

const getAddTask = (setTasks, tasks, topics, topicId) => {
    const addTask = () => {
        // Check if topic belonging to topicId exists
        // Find tasks in the topic
        // generate a new task
        // insert it into the new topic
        let newTasks = [...tasks]
        const topic = findTopicByTopicId(topics, topicId)
        if (!topic) {
            return
        }
        let newTask = generateEmptyTask(newTasks)
        newTasks = addOrphanTasktoTaskList(newTasks, newTask)
        newTasks = insertTaskInstanceIntoTopic(newTasks, newTask.id, topicId, 1)
        setTasks(newTasks)
    }
    return addTask
}

const getDeleteTask = (setTasks, tasks, id) => {
    const deleteTask = () => {
        let newTasks = deleteEntireTask(tasks, id)
        setTasks(newTasks);
    }
    return deleteTask;
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
    const getWrongTasks = tasks.filter((task) => task.topicViewIndices === undefined)
    if (getWrongTasks.length > 0) {
        console.debug("There are tasks that don't have topicViewIndices")
        console.debug(getWrongTasks)
        return false
    }
    let getWrongTasks2 = tasks.filter((task) => (task.topics.length != task.topicViewIndices.length))
    if (getWrongTasks2.length > 0) {
        console.debug("There are tasks that don't have the same amount of topicViewIndices as topics")
        console.debug(getWrongTasks2)
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
            nextOrderVal = 0
            tasksInTopic.forEach(
                (task) => {
                    let idcs = task.topics.reduce((acc, topicId, idx) => (topicId == topic.id ? [...acc, idx] : acc), [])
                    if (!task.topicViewIndices) { task.topicViewIndices = new Array }
                    idcs.forEach(idx => {
                        task.topicViewIndices[idx] = nextOrderVal
                        nextOrderVal += 1
                    })
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

////////////////////////
//// Fix Week Order Indices
///////////////////////////

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
        newTasks = newTasks.filter((task) => isTaskInAnyTopic(task, newTopics))
        console.info('Length of tasks before deletion/length of tasks after deletion')
        console.info(tasks.length + ' / ' + newTasks.length)

        setTopics(newTopics);
        setTasks(newTasks);
    }
    return deleteTopic;
}

export default getAddTask;
export { getDeleteTask };
export { getDeleteTopic };
export { getDuplicateTask };
export { getMoveTopic };
export { getAddTask }
export { getAddTopic }
export { getAddSubtopic }
export { getChangeWeekOrderIndex }
export { sanitizeWeekOrderIndex }
export { sanitizeWeekOrderIndex2 }
export { sanitizeTopicOrderIndex }
export { getMoveTasks }


/// What I would need is basically
// A moveTaskToTopic
// moveTask