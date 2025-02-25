import { V1_Task, V1_Topic } from "../Converters/V1_types";

const findTopicByTopicIdV1R = (topics: V1_Topic[], topic_key: number) => {
    // console.debug(topics);
    for (let topic of topics) {
        // console.debug(topic.id);
        if (topic.id === topic_key) {
            // console.debug('Fount it!');
            return topic;
        }
        let topic_res = findTopicByTopicIdV1R(topic.subtopics, topic_key);
        if (topic_res) {
            // console.debug('Bubble up'); 
            return topic_res;
        }
    }
    return null;
}

const findTopicByTopicIdV1 = (topics: V1_Topic[], topic_key: number) => {
    return findTopicByTopicIdV1R(topics, topic_key);
}

const findSupertopicByTopicIdV1_r = (topic: V1_Topic, subtopicId: number) => {
    // For every subtopic, see if it matches the id
    // otherwise, search through the subtopics of the subtopic
    for (let subtopic of topic.subtopics) {
        console.debug(subtopic.id);
        if (subtopic.id === subtopicId) {
            console.info('Found subtopic id in a topic');
            return topic;
        }
        let topic_res = topic.subtopics.map((t) => findSupertopicByTopicIdV1_r(t, subtopicId)).filter((s) => (s));
        console.debug(topic_res)
        if (topic_res.length > 0) { console.debug('Bubble up'); return topic_res[0]; }
    }
    return null;
}
const findSupertopicByTopicIdV1 = (topics: V1_Topic[], subtopic_id: number) => {
    // Assumptions: ids are unique
    // For all root topics, 
    let topic_res = topics.map((topic) => findSupertopicByTopicIdV1_r(topic, subtopic_id)).filter((s) => s)
    console.debug(topic_res)
    if (topic_res) { return topic_res[0] }
    return null;
}

const findSubtopicsByTopicIdV1 = (topics: V1_Topic[], topicId: number) => {
    let topic = findTopicByTopicIdV1(topics, topicId)
    return topic.subtopics
}

const findTasksByTopicIdV1 = (tasks: V1_Task[], topicId: number) => {
    return tasks.filter((t) => (t.topics.includes(topicId)))
}

const findTaskByTaskIdV1 = (tasks: V1_Task[], taskId: number) => {
    return tasks.find((t) => t.id == taskId)
}

const findTopicsByTaskIdV1 = (tasks: V1_Task[], topics: V1_Topic[], taskId: number) => {
    let task = findTaskByTaskIdV1(tasks, taskId)
    topics = task.topics.map((topicId) => findTopicByTopicIdV1(topics, topicId))
    return topics
}


export { findTopicByTopicIdV1 };
export { findTopicByTopicIdV1R };
export { findSupertopicByTopicIdV1 };
export { findSubtopicsByTopicIdV1 };
export { findTasksByTopicIdV1 };
export { findTaskByTaskIdV1 };
export { findTopicsByTaskIdV1 };