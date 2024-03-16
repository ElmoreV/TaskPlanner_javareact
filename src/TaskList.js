import { useState } from 'react';
import Task from './Task'
import Topic from './Topic';
// import Checkbox from './Checkbox'
import {
    convert_old_topic_tasks_to_new_topic_tasks,
    convert_topic_tasks_to_relational,
    convert_new_topic_tasks_to_old_topic_tasks
} from './Converter';
import {
    getChangeTaskTopic,
    getCompleteTask,
    getToggleRepeatTask,
    getDeleteTask,
    getDeleteTopic,
    getDuplicateTask,
    getMoveTopic,
    getPlanTaskForWeek,
    getSetTaskNameFunc,
    getSetTopicNameFunc,
    getUnplanTask,
    getUpdateTaskTopics,
    getToggleFold,
    getAddTask,
    getAddSubtopic,
    getAddTopic,
} from './ModifyFuncGeneratorsV1'
import ImportExport from './ImportExport';


const TaskList = (props) => {
    const { tasks, setTasks, topics, setTopics } = props;

    const [hideCompletedItems, setHideCompletedItems] = useState(false)
    const [showRepeatedOnly, setShowRepeatedOnly] = useState(false)
    const converter_callback = () => {
        let [topics2, tasks2] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks)
        let [topics3, tasks3] = convert_new_topic_tasks_to_old_topic_tasks(topics2, tasks2)
        console.log(tasks, tasks3)
        console.log('Boy oh boy')
        for (let i = 0; i < tasks.length; i++) {
            console.log(tasks[i])
            console.log(tasks2[i])
            console.log(tasks3[i])
        }
        // let tables = convert_topic_tasks_to_relational(topics2,tasks2)
        // console.log('res')
        // console.log(topics2)
        // console.log(tasks2)
        // console.log(tables)
    }

    const recursiveShowTopic = (topic, tasks) => {
        // 1. Show topic
        // 2. Show all subtopics (and their subtopics and tasks)
        // 3. Show all tasks

        // Do not show subtopics when Topic is folded
        // console.debug('Hello2')
        // console.debug(topics)
        // console.debug(topic)


        return (<div><li key={topic.id}>
            <Topic name={topic.name}
                id={topic.id}
                unfolded={topic.unfolded}
                setTopicName={getSetTopicNameFunc(setTopics, topics, topic.id)}
                toggleFold={getToggleFold(setTopics, topics)}
                addSubTopic={getAddSubtopic(setTopics, topics, topic)}
                moveTopic={getMoveTopic(setTopics, topics)}
                addTask={getAddTask(setTasks, tasks, topics, topic.id)}
                changeTopic={getChangeTaskTopic(setTasks, tasks)}
                updateTaskTopics={getUpdateTaskTopics(setTasks, tasks, topic.name)}
                duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
                deleteTopic={getDeleteTopic(setTopics, topics, setTasks, tasks, topic.id)}
            />
        </li>
            <ul key={topic.id + '_topics'}>{topic.unfolded && topic.subtopics.map((subtopic) => (
                recursiveShowTopic(subtopic, tasks)
            ))}</ul>
            <ul key={topic.id + '_tasks'}>
                {topic.unfolded && tasks.sort((taskA, taskB) => { return taskA.name > taskB.name })
                    .map((task) => (
                        (!(task.completed && hideCompletedItems) && task.topics.includes(topic.id) && (task.repeated || !showRepeatedOnly)) ?
                            <li key={topic.id + ' - ' + task.id}>
                                <Task name={task.name}
                                    id={task.id}
                                    completed={task.completed}
                                    currentTopicName={topic.name}
                                    currentTopicId={topic.id}
                                    setTaskName={getSetTaskNameFunc(setTasks, tasks, task.id)}
                                    deleteTask={getDeleteTask(setTasks, tasks, task.id)}
                                    completeTask={getCompleteTask(setTasks, tasks, task.id)}
                                    plan={getPlanTaskForWeek(setTasks, tasks, task.id)}
                                    unplan={getUnplanTask(setTasks, tasks, task.id)}
                                    toggleRepeatTask={getToggleRepeatTask(setTasks, tasks, task.id)}
                                    planned={task.thisWeek}
                                    repeated={task.repeated}
                                    
                                    changeTopic={getChangeTaskTopic(setTasks, tasks)}
                                    duplicateTask={getDuplicateTask(setTasks, tasks, topics)}

                                />
                            </li> : null))}
            </ul></div>
        )
    }


    const onHideCompletedItemsChange = () => {
        setHideCompletedItems(!hideCompletedItems)
    }
    const onShowRepeatedOnlyChange = () => {
        setShowRepeatedOnly(!showRepeatedOnly)
    }

    // const showTopics = () => {
    //     console.info('Re-rendering task list')
    //     let [topics2, tasks2] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks);
    //     return topics2.map((topic) => (recursiveShowTopic(topic, tasks2)))
    // }

    const showTopics = () => {
        console.info('Re-rendering task list')
        // let [topics2, tasks2] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks);
        return topics.map((topic) => (recursiveShowTopic(topic, tasks)))
    }

    return (
        // <div>
        <div className='task-list'>
            <button onClick={getAddTopic(setTopics, topics)}> Add New Root topic</button><br />
            <label><input
                type="checkbox"
                name='HideCompletedItems'
                onChange={onHideCompletedItemsChange}
                className="form-check-input"
            />Hide completed tasks</label>
            <label><input
                type="checkbox"
                name='ShowRepeatedOnly'
                onChange={onShowRepeatedOnlyChange}
                className="form-check-input"
            />Show repeated tasks only</label>
            <ul key='root_topics'>
                {showTopics()}
            </ul>
            <button onClick={converter_callback}>Test Converter</button>

        </div>

    );
}

export default TaskList;