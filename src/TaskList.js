import { useState, useEffect } from 'react';
import Task from './Task.tsx'
import Topic from './Topic';
import React from 'react';
// import Checkbox from './Checkbox'
import {
    getDeleteTask,
    getDeleteTopic,
    getDuplicateTask,
    getMoveTopic,
    getAddTask,
    getAddSubtopic,
    getMoveTasks,
    getAddTopic,
    sanitizeTopicOrderIndex,
} from './ModifyFuncGeneratorsV1'
import {
    getCompleteTask,
    getToggleRepeatTask,
    getPlanTaskForWeek,
    getSetTaskNameFunc,
    getSetTaskFinishStatus,
    getUnplanTask,
} from './TaskModifyFuncGens'
import {
    getToggleFold,
    getSetTopicNameFunc,
    getUnfoldAll,
    getFoldAll
} from './TopicModifyFuncGens'

import ImportExport from './ImportExport';

class SelectedTask {
    constructor(taskId, topicId, topicViewIndex) {
        this.taskId = taskId
        this.topicId = topicId
        this.topicViewIndex = topicViewIndex
    }
}


const recursiveShowTopic = (topic, tasks,
    setTopics, topics,
    setTasks,
    selectedTasks, setSelectedTasks,
    hideCompletedItems, showRepeatedOnly,
    fancy
) => {
    // 1. Show topic
    // 2. Show all subtopics (and their subtopics and tasks)
    // 3. Show all tasks

    // Do not show subtopics when Topic is folded
    // console.debug('Hello2')
    // console.debug(topics)
    // console.debug(topic)
    const findTopicViewIdx = (topicId, task) => {
        return task.topicViewIndices[task.topics.findIndex(taskTopicId => taskTopicId == topicId)]
    }

    return (<div key={'div_' + topic.id}><li key={topic.id}>
        <Topic
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
            // updateTaskTopics={getUpdateTaskTopics(setTasks, tasks, topic.name)}
            duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
            deleteTopic={getDeleteTopic(setTopics, topics, setTasks, tasks, topic.id)}
            fancy={fancy}

        />
    </li>
        <ul key={topic.id + '_topics'}>{topic.unfolded && topic.subtopics.map((subtopic) => (
            recursiveShowTopic(subtopic, tasks,
                setTopics, topics,
                setTasks,
                selectedTasks, setSelectedTasks,
                hideCompletedItems, showRepeatedOnly,
                fancy)
        ))}</ul>
        <ul key={topic.id + '_tasks'}>
            {topic.unfolded && tasks//.sort((taskA, taskB) => { return taskA.name > taskB.name })
                // .map((task) => (
                //     ( && task.topics.includes(topic.id) ) ?
                .filter((task) => task.topics.includes(topic.id))
                .filter((task) => (!(task.completed && hideCompletedItems) && (task.repeated || !showRepeatedOnly)))
                .slice(0).sort((taskA, taskB) => { return findTopicViewIdx(topic.id, taskA) - findTopicViewIdx(topic.id, taskB) })
                .map(task => (
                    <li key={topic.id + ' - ' + task.id}>
                        <Task name={task.name}
                            id={task.id}
                            completed={task.completed}
                            taskFinishStatus={task.finishStatus}
                            setTaskFinishStatus={getSetTaskFinishStatus(setTasks, tasks, task.id)}
                            currentTopicViewIndex={findTopicViewIdx(topic.id, task)}
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
                            addToSelection={() => addTaskToSelection(selectedTasks, setSelectedTasks, task.id, topic.id, findTopicViewIdx(topic.id, task))}
                            deleteFromSelection={() => deleteTaskFromSelection(selectedTasks, setSelectedTasks, task.id, topic.id)}
                            selected={selectedTasks.find((st) => (st.taskId == task.id && st.topicId == topic.id)) ? true : false}
                            selectedTasks={selectedTasks}
                            moveTasks={getMoveTasks(topics, tasks, setTasks)}
                            duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
                            fancy={fancy}
                            setTasks={setTasks}
                            tasks={tasks}

                        />
                    </li>))}
        </ul></div>
    )
}

const showTopics = (topics, tasks,
    setTopics,
    setTasks,
    selectedTasks, setSelectedTasks,
    hideCompletedItems, showRepeatedOnly,
    fancy) => {
    console.info('Re-rendering task list')
    return topics.map((topic) => (recursiveShowTopic(topic, tasks,
        setTopics, topics,
        setTasks,
        selectedTasks, setSelectedTasks,
        hideCompletedItems, showRepeatedOnly,
        fancy)))
}
const addTaskToSelection = (selectedTasks, setSelectedTasks, taskId, topicId, topicViewIndex) => {
    let newSelectedTasks = [...selectedTasks]
    newSelectedTasks.push(new SelectedTask(taskId, topicId, topicViewIndex))
    setSelectedTasks(newSelectedTasks)
}
const deleteTaskFromSelection = (selectedTasks, setSelectedTasks, taskId, topicId) => {
    let newSelectedTasks = [...selectedTasks]
    newSelectedTasks = newSelectedTasks.filter((selTask) => !(selTask.taskId == taskId && selTask.topicId == topicId))
    setSelectedTasks(newSelectedTasks)
}



const TaskList = (props) => {
    const { tasks, setTasks, topics, setTopics, fancy } = props;
    console.debug("Rendering TaskList")

    const [hideCompletedItems, setHideCompletedItems] = useState(true)
    const [showRepeatedOnly, setShowRepeatedOnly] = useState(false)

    const [selectedTasks, setSelectedTasks] = useState([])
    const [runOnce, setRunOnce] = useState(false)

    const testFunction = () => {
        console.log(tasks)
        console.log(topics)
    }


    useEffect(() => {
        // Function to clear selection
        const clearSelectionOnClickOutside = (event) => {
            // if (selectedTasks.length > 0)
            console.log(selectedTasks)
            setSelectedTasks([]);
            // else
            //     console.log("Empty selection")
        };

        // Add global click listener
        document.addEventListener('click', clearSelectionOnClickOutside);

        // Remove the event listener on cleanup
        return () => {
            document.removeEventListener('click', clearSelectionOnClickOutside);
        };
    }, []); // Empty dependency array means this effect runs once on mount





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
    const handleFoldAll = () => {
        let foldAll = getFoldAll(setTopics, topics)
        topics.map(topic => foldAll(topic.id))

    }

    if (runOnce < 2) {
        console.log("Running sanitize")
        sanitizeTopicOrderIndex(topics, tasks, setTasks)
        // setRunOnce(runOnce + 1)
    }
    // TODO: add duplicate id recognition and resolving
    // let arr = new Array
    // for (let i in new Range(300)){
    //     arr[i]=0
    // }
    // let taskIdCount = tasks.map((task,idx)=>(arr[task.id])?arr[task.id]+=1:arr[task.id]=1)
    // console.log(taskIdCount)
    // console.log(arr)
    const checkForDuplicateIds = (tasks) => {
        let taskIdCount = new Array
        tasks.forEach((task, idx) => taskIdCount[idx] ? taskIdCount[idx] += 1 : taskIdCount[idx] = 1)
        taskIdCount.forEach((count, taskId) => {
            if (taskIdCount > 1) {
                console.warn(`task (id:${taskId}) has ${count} tasks associated with it:`)
                console.warn(tasks.filter((task) => task.id == taskId))
            }
        })
    }
    checkForDuplicateIds(tasks)

    return (
        // <div>
        <div className='task-list'>
            <button onClick={getAddTopic(setTopics, topics)}> Add New Root topic</button><br />
            <label><input
                type="checkbox"
                name='HideCompletedItems'
                onChange={onHideCompletedItemsChange}
                className="form-check-input"
                defaultChecked={hideCompletedItems}
            />Hide completed tasks</label>
            <label><input
                type="checkbox"
                name='ShowRepeatedOnly'
                onChange={onShowRepeatedOnlyChange}
                className="form-check-input"
                defaultChecked={setShowRepeatedOnly}
            />Show repeated tasks only</label>
            <button className="fold_all" onClick={handleFoldAll} >Fold all</button>
            <ul key='root_topics'>
                {showTopics(topics, tasks,
                    setTopics,
                    setTasks,
                    selectedTasks, setSelectedTasks,
                    hideCompletedItems, showRepeatedOnly,
                    fancy)}
            </ul>
            <button onClick={() => testFunction()}>Test Function</button>
        </div>

    );
}

export default TaskList;