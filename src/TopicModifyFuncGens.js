import { findTopicByTopicId } from './FindItems'

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

// For v0 data
const getSetTopicNameFunc = (setTopics, topics, id) => {
    const setTopicName = (newTopicName) => {
        const newTopics = [...topics];
        const topic_to_change = findTopicByTopicId(topics, id);
        topic_to_change.name = newTopicName;
        setTopics(newTopics);
    }
    return setTopicName;
}



export { getToggleFold }
export { getSetTopicNameFunc };
