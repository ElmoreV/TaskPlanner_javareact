import {
    find_topic_by_key,
    getFreeTaskKey,
    getFreeTopicKey,
    isTaskInAnyTopic,
    filter_by_name_r,
    find_supertopic_by_id
} from './TopicHelper';




///////////////
/// Changing tasks
//////////////



// For v0 data
const getChangeTaskTopic = (setTasks, tasks) => {
    // Key here is the key of the task
    // oldTopic is the topic-object where the task came from
    // newTopic is the topic-object where the task is going to

    const changeTaskTopic = (key, oldTopicName, newTopicName) => {
        console.debug('Inside change task topic')
        console.debug(key)
        const newTasks = tasks.map((task) => {
            if (task.key == key) //cannot be ===?
            {
                console.debug('relevant task')
                console.debug(task)
                if (task.topics.includes(oldTopicName)) {
                    return {
                        ...task,
                        topics: task.topics.map((topic) => topic == oldTopicName ? newTopicName : topic)
                    }
                }
                console.debug(task)
            }
            return task;
        });
        setTasks(newTasks);
    }

    return changeTaskTopic

}


// For v0 data
const getSetTaskNameFunc = (setTasks, tasks, key) => {
    const setTaskName = (newTaskName) => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.key === key);
        task_to_change.taskName = newTaskName;
        setTasks(newTasks);
    }
    return setTaskName;
}


// For v0 data
const getUpdateTaskTopics = (setTasks, tasks, topic_name) => {
    const updateTaskTopics = (newTopicName) => {
        const newTasks = tasks.map((task) => {
            if (task.topics.includes(topic_name)) {
                return {
                    ...task,
                    topics: task.topics.map((topic) => topic === topic_name ? newTopicName : topic)
                }
            }
            return task;
        });
        setTasks(newTasks);
    }
    return updateTaskTopics;
}


// For v0 data
const getDuplicateTask = (setTasks, tasks, topics) => {
    const duplicateTask = (task_id, topic_id) => {
        // Copy tasks
        let newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.key == task_id);
        console.debug(task_to_change)
        const topic_to_add = find_topic_by_key(topics, topic_id)
        if (task_to_change.topics.includes(topic_to_add.title)) {
            console.info("Task is already in topic")
            return;
        }
        task_to_change.topics.push(topic_to_add.title)
        setTasks(newTasks)
    }
    return duplicateTask
}

const getAddTask = (setTasks, tasks, topics, topic_key) => {

    const addTask = () => {
        let newTasks = [...tasks];
        console.log(topic_key);
        const topic = find_topic_by_key(topics, topic_key);
        if (topic) {
            const addedTask = {
                taskName: `New Task ${getFreeTaskKey(tasks)}!`,
                key: getFreeTaskKey(tasks),
                topics: [topic.title]
            }
            newTasks.push(addedTask);
            console.log(newTasks);
            setTasks(newTasks);

        }

    }
    return addTask
}


// For v0 data    
const getDeleteTask = (setTasks, tasks, key) => {
    const deleteTask = () => {
        let newTasks = [...tasks]
        newTasks = newTasks.filter((task) => task.key !== key);
        setTasks(newTasks);

    }
    return deleteTask;
}

// For v0 data
const getCompleteTask = (setTasks, tasks, key) => {
    const completeTask = () => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.key === key);
        task_to_change.completed = !task_to_change.completed;
        setTasks(newTasks);
    }
    return completeTask;
}

// For v0 data
const getPlanTaskForWeek = (setTasks, tasks, id) => {
    const planTaskForWeek = () => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.key === id);
        task_to_change.thisWeek = true;
        setTasks(newTasks);
    }
    return planTaskForWeek
}


const getUnplanTask = (setTasks, tasks, id) => {
    const unplanTask = () => {
        const newTasks = [...tasks]
        const task_to_change = newTasks.find((task) => task.key === id);
        task_to_change.thisWeek = false;
        setTasks(newTasks);
    }
    return unplanTask
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
        const newTopics = [...topics];
        let source_supertopic = find_supertopic_by_id(newTopics, source_id)
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
        topic_to_change.title = newTopicName;
        setTopics(newTopics);
    }
    return setTopicName;
}

const getAddTopic = (setTopics, topics) => {


    const addTopic = () => {
        let newTopics = [...topics];
        const addedTopic = {
            title: `New Topic ${getFreeTopicKey(topics)}`,
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
const getAddSubtopic = (setTopics, topics, topic) => {
    console.log("Creating add subtopic")
    console.log(topic);
    console.log(topics)

    const addSubtopic = () => {
        console.log('In AddSubTopic')
        console.log(topic);
        console.log(topics)
        let newTopics = [...topics]
        const addedTopic = {
            title: `New Topic ${getFreeTopicKey(topics)}`,
            id: getFreeTopicKey(topics),
            unfolded: false,
            subtopics: []
        }
        console.log(addedTopic)
        console.log('start recursion')
        // now add this topic at the exact right spot
        // recurse through newTopics
        // and return the changed topic if it is the right topic
        newTopics = newTopics.map((topic_r) => addSubtopic_r(topic_r, topic, addedTopic));
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

// For v0 data
const getDeleteTopic = (setTopics, topics, setTasks, tasks, topicName) => {
    // console.debug('Creating delete topic thingy')
    const deleteTopic = () => {

        let newTopics = [...topics]
        // filter recursively
        newTopics = filter_by_name_r(newTopics, topicName);
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

export default getChangeTaskTopic;
export { getChangeTaskTopic };
export { getCompleteTask };
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
