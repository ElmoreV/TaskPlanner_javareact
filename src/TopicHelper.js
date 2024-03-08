

const find_topic_by_key_r = (topics, topic_key) => {
    console.debug(topics);
    for (let topic of topics) {
        console.debug(topic.id);
        if (topic.id === topic_key) {
            console.debug('Fount it!');
            return topic;
        }
        let topic_res = find_topic_by_key_r(topic.subtopics, topic_key);
        if (topic_res) { console.debug('Bubble up'); return topic_res; }
    }
    return null;
}
const find_topic_by_key = (topics, topic_key) => {
    return find_topic_by_key_r(topics, topic_key);
}
const find_supertopic_by_id_r = (topic, subtopic_id) => {
    console.debug(topic);
    for (let subtopic of topic.subtopics) {
        console.debug(subtopic.id);
        if (subtopic.id === subtopic_id) {
            console.info('Found subtopic id in a topic');
            return topic;
        }
        let topic_res = topic.subtopics.map((t) => find_supertopic_by_id_r(t, subtopic_id)).filter((s) => (s));
        console.debug(topic_res)
        if (topic_res.length > 0) { console.debug('Bubble up'); return topic_res[0]; }
    }
    return null;
}
const find_supertopic_by_id = (topics, subtopic_id) => {
    // Assumptions: ids are unique
    console.debug(topics)
    console.debug(subtopic_id)
    let topic_res = topics.map((topic) => find_supertopic_by_id_r(topic, subtopic_id)).filter((s) => s)
    console.debug(topic_res)
    if (topic_res) { return topic_res[0] }
    return null;
}

const find_topic_by_name_r = (topics, topic_name) => {
    console.debug(topics);
    for (let topic of topics) {
        console.debug(topic.name);
        if (topic.title === topic_name) {
            console.debug('Fount it!');
            return topic;
        }
        let topic_res = find_topic_by_name_r(topic.subtopics, topic_name);
        if (topic_res) { console.debug('Bubble up'); return topic_res; }
    }
    return null;
}

const getFreeTaskKey = (tasks) => {
    return 1 + tasks.reduce((max_key, task) => Math.max(max_key, task.key), 0);
}

function isEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let map = new Map();
    for (let elem of a) {
        map.set(elem, (map.get(elem) || 0) + 1)

    }
    for (let elem of b) {
        if (!map.has(elem)) {
            return false;
        }
        map.set(elem, map.get(elem) - 1);
        if (map.get(elem) < 0) {
            return false;
        }
    }
    return true;
}


const topicCompletelyContainsTasks = (topic, task) => {
    // Check all topics and if the task is only contained in topic
    // and/or its subtopics, we can return true
    // We check this by checking the topics in the task, and seeing if all the topics are contained within
    // the topic and its subtopics (recursively)
    let included_topics = []
    if (task.topics.includes(topic.title)) {
        included_topics.append(topic.title)
        if (isEqual(task.topics, included_topics)) { return true; }
    }
    // try all subtopics

    included_topics.append(topic.subtopics.map((topic) => topicCompletelyContainsTasks(topic, task)))
    console.log(included_topics)
    if (isEqual(task.topics, included_topics)) { return true; }
    return false;
}

const filter_by_name_r = (topics, topic_name) => {
    // 1. enumerate all subtopics that do not match name, and filter their subtopics
    // 2. filter all subtopics that do match name
    // 3. return the topics object as is, just with all topics with title==topic_name filtered out,
    // and all subtopics (or subsubtopics) with title==topic_name filtered out
    console.log(topics)
    return topics.filter((topic) => topic.title !== topic_name).map(
        (topic) => { return { ...topic, subtopics: filter_by_name_r(topic.subtopics, topic_name) } }
    )
}
const find_topic_by_name = (topics, topic_name) => {
    return find_topic_by_name_r(topics, topic_name);
}
const get_all_subtopics = (topic) => {

    return topic.subtopics.map((subtopic) => get_all_subtopics(subtopic)).concat(topic);
}


const isTaskInAnyTopic = (task, topics) => {
    // check if the topic of the task in the
    console.log(task.topics)
    task.topics = task.topics.filter((topic_name) => {
        console.log('Is topic .. in non-deleted topics ...')
        console.log(topic_name)
        console.log(topics)
        return find_topic_by_name(topics, topic_name)
    })
    console.log('Resulting task.topics')
    console.log(task.topics)
    console.log(task.topics.length)
    if (task.topics.length > 0) {
        return true;
    }
    return false;
}
const getLargestTopicKey = (topic) => {
    let max_id = Math.max(topic.id,
        topic.subtopics.reduce((max_key, topic) => Math.max(max_key, getLargestTopicKey(topic)), 0));
    console.log(max_id, topic.title)
    return max_id;
}
const getFreeTopicKey = (topics) => {
    let max_id = 1 + topics.reduce((max_key, topic) => Math.max(max_key, getLargestTopicKey(topic)), 0);
    console.log(max_id)
    return max_id;
}

const getTopicTree_by_id_r = (topic, topic_id) => {
    let found_topic_id = false;
    let next_string = "";
    if (topic.id == topic_id) {
        next_string = topic.title
        found_topic_id = true;
    } else {
        let strings = topic.subtopics.map((t) => getTopicTree_by_id_r(t, topic_id)).filter((s) => s.length > 0)
        if (strings.length > 0) {
            next_string = topic.title + '/' + strings[0]
            found_topic_id = true;
        }
    }
    if (!found_topic_id) {
        return ""
    } else {
        return next_string
    }
}
const getTopicTree_by_id = (topics, topic_id) => {
    let strings = topics.map((t) => {
        let s = getTopicTree_by_id_r(t, topic_id)
        if (s.length > 0) { return t.title + '/' + s } else { return "" }
    }).filter((s) => s.length > 0)
    if (strings.length > 0) { return strings[0] } else { return "" }

}
const getTopicTree_by_name_r = (topic, topic_name) => {
    let found_topic_id = false;
    let next_string = "";
    if (topic.title == topic_name) {
        next_string = topic.title
        found_topic_id = true;
    } else {
        let strings = topic.subtopics.map((t) => getTopicTree_by_name_r(t, topic_name)).filter((s) => s.length > 0)
        if (strings.length > 0) {
            next_string = topic.title + '/' + strings[0]
            found_topic_id = true;
        }
    }
    if (!found_topic_id) {
        return ""
    } else {
        return next_string
    }
}
const getTopicTree_by_name = (topics, topic_name) => {
    let strings = topics.map((t) =>
        getTopicTree_by_name_r(t, topic_name)).filter((s) => s.length > 0)
    if (strings.length > 0) { return strings[0] } else { return "" }

}

export default find_topic_by_key_r;
export { find_topic_by_key };
export { find_topic_by_name_r };
export { getFreeTaskKey };
export { isTaskInAnyTopic };
export { filter_by_name_r };
export { getFreeTopicKey };
export { getTopicTree_by_name }
export { find_supertopic_by_id }