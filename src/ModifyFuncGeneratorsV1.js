import {
    find_topic_by_key,
    getFreeTaskId,
    getFreeTopicKey,
    isTaskInAnyTopicV1,
    filterTopicsById_r,
    find_supertopic_by_id
} from './TopicHelper';


///////////////
/// Changing tasks
//////////////

// Can be used for v1 mode.
const getChangeTaskTopic = (setTasks, tasks) => {
    // Key here is the key of the task
    // oldTopic is the topic-object where the task came from
    // newTopic is the topic-object where the task is going to

    const changeTaskTopic = (taskIds, oldTopicIds, newTopicId) => {
        if (!Array.isArray(taskIds)) { taskIds = [taskIds] }
        if (!Array.isArray(oldTopicIds)) { oldTopicIds = [oldTopicIds] }
        if (oldTopicIds.length != taskIds.length) {
            console.error('The length of the taskIds and oldTopicIds should be the same')
            return
        }

        console.debug('Inside change task topic (by id)')
        const newTasks = tasks.map((task) => {
            if (taskIds.includes(task.id)) //cannot be ===?
            {
                console.debug("Found the task")
                console.debug(task)
                console.debug(oldTopicIds)
                // TODO: there is a possibility that the new Topic Id does not exist.
                // find_topic_by_id(topic,newTopicId)
                let containedTopicIds = task.topics.filter((tt) => oldTopicIds.includes(tt))
                if (containedTopicIds.length > 0) {
                    console.debug("And comes from the old Topic indeed")
                    return {
                        ...task,
                        topics: task.topics.map((topicId) => oldTopicIds.includes(topicId) ? newTopicId : topicId)
                    }
                }
            }
            return task;
        });
        setTasks(newTasks);
    }

    return changeTaskTopic

}




// For v1 data
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




// For v1 data
const getDuplicateTask = (setTasks, tasks, topics) => {
    const duplicateTask = (task_id, topic_id) => {
        // Copy tasks
        let newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id == task_id);
        console.debug(task_to_change)
        const topic_to_add = find_topic_by_key(topics, topic_id)
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
        const topic = find_topic_by_key(topics, topicId);
        if (topic) {
            const addedTask = {
                name: `New Task ${getFreeTaskId(tasks)}!`,
                id: getFreeTaskId(tasks),
                topics: [topic.id]
            }
            newTasks.push(addedTask);
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
        let source_topic = find_topic_by_key(topics, source_id)
        console.info(source_topic)
        let is_sub_topic = find_topic_by_key(source_topic.subtopics, target_id)
        if (is_sub_topic) {
            console.log("Cannot move a topic to its own subtopic")
            return
        }
        // If the target topic is the sources topic direct supertopic, also don't do it
        // Find the super topic of the source topic
        let newTopics = [...topics];
        let source_supertopic = find_supertopic_by_id(newTopics, source_id)
        if (!source_supertopic) {
            console.log("There is no supertopic. Is this a root topic?")
            let target_topic = find_topic_by_key(newTopics, target_id)
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
        let target_topic = find_topic_by_key(newTopics, target_id)
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

// For v0 data
const getSetTopicNameFunc = (setTopics, topics, id) => {
    const setTopicName = (newTopicName) => {
        const newTopics = [...topics];
        const topic_to_change = find_topic_by_key(topics, id);
        topic_to_change.name = newTopicName;
        setTopics(newTopics);
    }
    return setTopicName;
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
        topic.subtopics = [...topic.subtopics,
            newSubTopic];
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




//Recursive function to handle all toggles
const toggleFold_r = (topics, id) => {
    for (let topic of topics) {
        if (topic.id === id) { topic.unfolded = !topic.unfolded; return true; }
        if (toggleFold_r(topic.subtopics, id)) { return true; }
    }
    return false;
}

const getToggleFold = (setTopics, topics) => {
    const toggleFold = (id) => {
        const newTopics = [...topics];
        if (toggleFold_r(newTopics, id)) {
            setTopics(newTopics);
        }
    }
    return toggleFold;
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
export { getSetTopicNameFunc };
export { getUpdateTaskTopics };
export { getToggleFold }
export { getAddTask }
export { getAddTopic }
export { getAddSubtopic }
export { getChangeWeekOrderIndex }
export { sanitizeWeekOrderIndex }
export { sanitizeWeekOrderIndex2 }
