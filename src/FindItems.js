
const findTopicByTopicIdR = (topics, topic_key) => {
    // console.debug(topics);
    for (let topic of topics) {
        // console.debug(topic.id);
        if (topic.id === topic_key) {
            // console.debug('Fount it!');
            return topic;
        }
        let topic_res = findTopicByTopicIdR(topic.subtopics, topic_key);
        if (topic_res) {
            // console.debug('Bubble up'); 
            return topic_res;
        }
    }
    return null;
}

const findTopicByTopicId = (topics, topic_key) => {
    return findTopicByTopicIdR(topics, topic_key);
}

const findSupertopicByTopicId_r = (topic, subtopicId) => {
    // For every subtopic, see if it matches the id
    // otherwise, search through the subtopics of the subtopic
    for (let subtopic of topic.subtopics) {
        console.debug(subtopic.id);
        if (subtopic.id === subtopicId) {
            console.info('Found subtopic id in a topic');
            return topic;
        }
        let topic_res = topic.subtopics.map((t) => findSupertopicByTopicId_r(t, subtopicId)).filter((s) => (s));
        console.debug(topic_res)
        if (topic_res.length > 0) { console.debug('Bubble up'); return topic_res[0]; }
    }
    return null;
}
const findSupertopicByTopicId = (topics, subtopic_id) => {
    // Assumptions: ids are unique
    // For all root topics, 
    let topic_res = topics.map((topic) => findSupertopicByTopicId_r(topic, subtopic_id)).filter((s) => s)
    console.debug(topic_res)
    if (topic_res) { return topic_res[0] }
    return null;
}

const findSubtopicsByTopicId = (topics, topicId) => {
    let topic = findTopicByTopicId(topics, topicId)
    return topic.subtopics
}

const findTasksByTopicId = (tasks, topicId) => {
    return tasks.filter((t) => (t.topics.includes(topicId)))
}

const findTaskByTaskId = (tasks, taskId) => {
    return tasks.find((t) => t.id == taskId)
}

const findTopicsByTaskId = (tasks, topics, taskId) => {
    let task = findTaskByTaskId(tasks, taskId)
    topics = task.topics.map((topicId) => findTopicByTopicId(topics, topicId))
    return topics
}


export { findTopicByTopicId };
export { findTopicByTopicIdR };
export { findSupertopicByTopicId };
export { findSubtopicsByTopicId };
export { findTasksByTopicId };
export { findTaskByTaskId };
export { findTopicsByTaskId };

// export { findFirstTopicByNameR };
