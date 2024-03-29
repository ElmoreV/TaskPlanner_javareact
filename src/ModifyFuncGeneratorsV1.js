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

    const changeTaskTopic = (taskId, oldTopicId, newTopicId) => {
        console.debug('Inside change task topic (by id)')
        const newTasks = tasks.map((task) => {
            if (task.id == taskId) //cannot be ===?
            {
                console.debug("Found the task")
                console.debug(task)
                console.debug(oldTopicId)
                // TODO: there is a possibility that the new Topic Id does not exist.
                // find_topic_by_id(topic,newTopicId)
                if (task.topics.includes(oldTopicId)) {
                    console.debug("And comes from the old Topic indeed")
                    return {
                        ...task,
                        topics: task.topics.map((topicId) => topicId == oldTopicId ? newTopicId : topicId)
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
const getSetTaskNameFunc = (setTasks, tasks, id) => {
    const setTaskName = (newTaskName) => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.name = newTaskName;
        setTasks(newTasks);
    }
    return setTaskName;
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

// For v1 data
const getCompleteTask = (setTasks, tasks, id) => {
    const completeTask = () => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.id === id);
        task_to_change.completed = !task_to_change.completed;
        setTasks(newTasks);
    }
    return completeTask;
}

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

const checkValidWeekOrderIndex = (tasks) => {
    // Check if there are undefined values
    const getWrongTasks = tasks.filter((task) => task.weekOrderIndex == undefined)
    if (getWrongTasks.length > 0) { return false }
    // Check if the values are not 0 for tasks where task.thisWeek=false
    // TODO: sdf
    // Check if the values are not exactly 1,2,3,4,....
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

const getChangeWeekOrderIndex = (setTasks, tasks) => {
    const changeWeekOrderIndex = (taskId, sourceWeekOrderIndex, targetWeekOrderIndex) => {
        let newTasks = [...tasks]
        console.log(newTasks)

        if (targetWeekOrderIndex < sourceWeekOrderIndex) {
            // move all indices newIdx<=idx<oldIdx 1 up
            newTasks = newTasks.map((task) => {
                if (task.thisWeek && task.weekOrderIndex >= targetWeekOrderIndex
                    && task.weekOrderIndex < sourceWeekOrderIndex) {
                    task.weekOrderIndex += 1
                };
                return task
            })
        } else if (targetWeekOrderIndex > sourceWeekOrderIndex) {
            newTasks = newTasks.map((task) => {
                // move all indices oldIdx<idx<=newIdx one down
                if (task.thisWeek && task.weekOrderIndex <= targetWeekOrderIndex
                    && task.weekOrderIndex > sourceWeekOrderIndex) {
                    task.weekOrderIndex -= 1
                };
                return task
            })
        }
        console.log(newTasks)
        const task_to_change = newTasks.find((task) => task.id == taskId);
        task_to_change.weekOrderIndex = targetWeekOrderIndex
        console.log(newTasks)
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
export { getCompleteTask };
export { getScheduleTask };
export { getDeleteTask };
export { getDeleteTopic };
export { getDuplicateTask };
export { getMoveTopic };
export { getPlanTaskForWeek };
export { getSetTaskNameFunc };
export { getSetTopicNameFunc };
export { getUnplanTask };
export { getUpdateTaskTopics };
export { getToggleFold }
export { getAddTask }
export { getAddTopic }
export { getAddSubtopic }
export { getToggleRepeatTask }
export { getChangeWeekOrderIndex }
export { sanitizeWeekOrderIndex }
export { sanitizeWeekOrderIndex2 }
