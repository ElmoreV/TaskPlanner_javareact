import { memo } from 'react'
import {
    getDeleteTopic,
    getDuplicateTask,
    getMoveTopic,
    getAddTask,
    getAddSubtopic,
    getMoveTasks,
} from '../ADG/ModifyFuncGeneratorsV1.ts'
import {
    getToggleFold,
    getSetTopicNameFunc,
    getUnfoldAll,
    getFoldAll
} from '../Topics/TopicModifyFuncGens.js'
import Topic from './Topic.js';


export default memo(function TopicContainer(props) {
    const { topic, tasks, setTasks, topics, setTopics, selectedTasks, fancy } = props;

    return (<Topic
        name={topic.name}
        id={topic.id}
        unfolded={topic.unfolded}
        selectedTasks={selectedTasks}
        setTopicName={getSetTopicNameFunc(setTopics, topics, topic.id)}
        toggleFold={getToggleFold(setTopics, topics)}
        addSubTopic={getAddSubtopic(setTopics, topics, topic)}
        moveTopic={getMoveTopic(setTopics, topics)}
        addTask={getAddTask(setTasks, tasks, topics, topic.id)}
        moveTasks={getMoveTasks(topics, tasks, setTasks)}
        unfoldAll={getUnfoldAll(setTopics, topics)}
        foldAll={getFoldAll(setTopics, topics)}
        duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
        deleteTopic={getDeleteTopic(setTopics, topics, setTasks, tasks, topic.id)}
        fancy={fancy}
    />)
})