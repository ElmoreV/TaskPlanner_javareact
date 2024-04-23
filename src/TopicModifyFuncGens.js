import { findTopicByTopicId } from './FindItems'

//Recursive function to handle all toggles
const toggleFold_r = (topics, id) => {
    for (let topic of topics) {
        if (topic.id === id) {
            topic.unfolded = !topic.unfolded;
            return true;
        }
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

const unfoldAll_r =  (topic,topicId,shouldUnfold)=>{
    if (shouldUnfold==true)
    {
        topic.unfolded = true
    }else{
        if (topic.id == topicId){
            shouldUnfold = true
            topic.unfolded = true
        }
    }
    topic.subtopics.forEach(subtopic=>unfoldAll_r(subtopic,topicId,shouldUnfold))
}


const getUnfoldAll = (setTopics,topics) =>{
    const unfoldAll = (topicId)=>{
        console.log('inside unfoldall')

        let newTopics = [...topics]
        newTopics.forEach(topic=>unfoldAll_r(topic,topicId,false))
        setTopics(newTopics)
    }
    return unfoldAll
}


const foldAll_r = (topic,topicId,shouldFold)=>{
    if (shouldFold==true)
    {
        topic.unfolded = false
    }else{
        if (topic.id == topicId){
            shouldFold = true
            topic.unfolded = false
        }
    }
    topic.subtopics.forEach(subtopic=>foldAll_r(subtopic,topicId,shouldFold))
}

const getFoldAll = (setTopics,topics) =>{
    const foldAll = (topicId)=>{
        console.log('inside foldall')
        let newTopics = [...topics]
        newTopics.forEach(topic=>foldAll_r(topic,topicId,false))
        setTopics(newTopics)
    }
    return foldAll
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
export {getFoldAll};
export {getUnfoldAll}