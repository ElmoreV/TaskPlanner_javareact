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
} from './ModifyFuncGenerators'
import ImportExport from './ImportExport';


const TaskList = (props) => {
    const { tasks, setTasks, topics, setTopics } = props;

    const [hideCompletedItems, setHideCompletedItems] = useState(false)




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
            <Topic title={topic.title}
                id={topic.id}
                unfolded={topic.unfolded}
                updateTaskTopics={getUpdateTaskTopics(setTasks, tasks, topic.title)}
                changeTopic={getChangeTaskTopic(setTasks, tasks)}
                addTask={getAddTask(setTasks, tasks, topics, topic.id)}
                setTopicName={getSetTopicNameFunc(setTopics, topics, topic.id)}
                toggleFold={getToggleFold(setTopics, topics)}
                moveTopic={getMoveTopic(setTopics, topics)}
                addSubTopic={getAddSubtopic(setTopics, topics, topic)}
                deleteTopic={getDeleteTopic(setTopics, topics, setTasks, tasks, topic.title)}
                duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
            />
        </li>
            <ul key={topic.id + '_topics'}>{topic.unfolded && topic.subtopics.map((subtopic) => (
                recursiveShowTopic(subtopic, tasks)
            ))}</ul>
            <ul key={topic.id + '_tasks'}>
                {topic.unfolded && tasks.map((task) => (
                    (!(task.completed && hideCompletedItems) && task.topics.includes(topic.title)) ?
                        <li key={topic.id + ' - ' + task.key}>
                            <Task taskName={task.taskName}
                                taskKey={task.key}
                                completed={task.completed}
                                currentTopicName={topic.title}
                                currentTopicId={topic.id}
                                setTaskName={getSetTaskNameFunc(setTasks, tasks, task.key)}
                                deleteTask={getDeleteTask(setTasks, tasks, task.key)}
                                completeTask={getCompleteTask(setTasks, tasks, task.key)}
                                plan={getPlanTaskForWeek(setTasks, tasks, task.key)}
                                unplan={getUnplanTask(setTasks, tasks, task.key)}
                                changeTopic={getChangeTaskTopic(setTasks, tasks)}
                                duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
                                planned={task.thisWeek}

                            />
                        </li> : null))}
            </ul></div>
        )
    }

    const recursiveShowTopicV1 = (topic, tasks) => {
        // 1. Show topic
        // 2. Show all subtopics (and their subtopics and tasks)
        // 3. Show all tasks

        // Do not show subtopics when Topic is folded
        // console.debug('Hello2')
        // console.debug(topics)
        // console.debug(topic)


        return (<div><li key={topic.id}>
            <Topic title={topic.name}
                setTopicName={getSetTopicNameFunc(setTopics, topics, topic.id)}
                updateTaskTopics={getUpdateTaskTopics(setTasks, tasks, topic.name)}
                id={topic.id}
                toggleFold={getToggleFold(setTopics, topics)}
                unfolded={topic.unfolded}
                addTask={getAddTask(setTasks, tasks, topics, topic.id)}
                addSubTopic={getAddSubtopic(setTopics, topics, topic)}
                deleteTopic={getDeleteTopic(setTopics, topic.name)}
                changeTopic={getChangeTaskTopic(setTasks, tasks)}
                moveTopic={getMoveTopic(setTopics, topics)}
                duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
            />
        </li>
            <ul key={topic.id + '_topics'}>{topic.unfolded && topic.subtopics.map((subtopic) => (
                recursiveShowTopic(subtopic, tasks)
            ))}</ul>
            <ul key={topic.id + '_tasks'}>
                {topic.unfolded && tasks.map((task) => (
                    (!(task.completed && hideCompletedItems) && task.topics.includes(topic.id)) ?
                        <li key={topic.id + ' - ' + task.id}>
                            <Task taskName={task.name}
                                taskKey={task.id}
                                completed={task.completed}
                                currentTopicName={topic.name}
                                currentTopicId={topic.id}
                                setTaskName={getSetTaskNameFunc(setTasks, tasks, task.id)}
                                deleteTask={getDeleteTask(setTasks, tasks, task.id)}
                                completeTask={getCompleteTask(setTasks, tasks, task.id)}
                                plan={getPlanTaskForWeek(setTasks, tasks, task.id)}
                                unplan={getUnplanTask(setTasks, tasks, task.id)}
                                planned={task.thisWeek}
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

    const showTopicsV1 = () => {
        console.info('Re-rendering task list')
        let [topics2, tasks2] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks);
        return topics2.map((topic) => (recursiveShowTopic(topic, tasks2)))
    }

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
            <ul key='root_topics'>
                {showTopics()}
            </ul>
            <ImportExport
                tasks={tasks}
                topics={topics}
                setTasks={setTasks}
                setTopics={setTopics} />
            <button onClick={converter_callback}>Test Converter</button>

        </div>

    );
}

export default TaskList;