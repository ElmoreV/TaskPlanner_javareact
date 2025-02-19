import { useState, useEffect } from 'react';
import Task from './Task.tsx'
import Topic from './Topic.js';
import React from 'react';
// import Checkbox from './Checkbox'
import {
    getDeleteTask,
    getAddNewSubTask,
    getDeleteTopic,
    getDuplicateTask,
    getMoveTopic,
    getAddTask,
    getAddSubtopic,
    getMoveTasks,
    getAddTopic,
    sanitizeTopicOrderIndex,
} from '../ADG/ModifyFuncGeneratorsV1.js'
import {
    getCompleteTask,
    getToggleRepeatTask,
    getPlanTaskForWeek,
    getSetTaskNameFunc,
    getSetTaskFinishStatus,
    getUnplanTask,
    getToggleFoldTask,
    getSetTaskDueTime,
} from '../Tasks/TaskModifyFuncGens.ts'
import {
    getToggleFold,
    getSetTopicNameFunc,
    getUnfoldAll,
    getFoldAll
} from '../Topics/TopicModifyFuncGens.js'
import { FinishedState } from '../Tasks/TaskInterfaces.tsx';
import { isTaskDueIn, convertDueDateNameToSeconds } from '../Timing.ts';

class SelectedCategoryTask {
    constructor(taskId, topicId, topicViewIndex, superTaskId) {
        this.taskId = taskId
        this.topicId = topicId
        this.topicViewIndex = topicViewIndex
        this.superTaskId = superTaskId
    }
}

const isNewTask = (task, allSubTaskIds) => {
    return task.topics.length == 0 && !allSubTaskIds.includes(task.id)
}

const isTaskVisible = (task, hideCompletedItems, showRepeatedOnly, dueInSeconds) => {
    return (
        (!((task.completed || (task.finishStatus !== undefined && task.finishStatus !== FinishedState.NotFinished))
            && hideCompletedItems))
        && (task.repeated || !showRepeatedOnly)
        && (!dueInSeconds || isTaskDueIn(task, new Date(), dueInSeconds))
    )
}

const recursiveShowTask = (topic, superTask, task, tasks,
    topics,
    setTasks,
    selectedTasks, setSelectedTasks,
    hideCompletedItems, showRepeatedOnly, dueInSeconds,
    fancy
) => {
    // 1. Show task
    // 2. Show all subtasks

    const findTopicViewIdx = (topicId, task) => {
        return task.topicViewIndices[task.topics.findIndex(taskTopicId => taskTopicId == topicId)]
    }

    // Return the following HTML structure
    //  <>
    //      <li topic.id - suipertask.id - task id>
    //      <Task>
    //      <ul>
    //          subtasks
    //          
    return (
        <>
            <li key={(topic && topic.id) + "-" + (superTask && superTask.id) + ' - ' + task.id}>
                <Task name={task.name}
                    id={task.id}
                    completed={task.completed}
                    taskFinishStatus={task.finishStatus}
                    planned={task.thisWeek}
                    repeated={task.repeated}
                    taskTopics={task.topics}
                    taskLastCompletion={task.lastFinished}
                    setTaskFinishStatus={getSetTaskFinishStatus(setTasks, tasks, task.id)}
                    currentTopicViewIndex={topic && findTopicViewIdx(topic.id, task)}
                    currentTopicName={topic && topic.name}
                    currentTopicId={topic && topic.id}
                    currentSuperTaskId={superTask && superTask.id}
                    setTaskName={getSetTaskNameFunc(setTasks, tasks, task.id)}
                    deleteTask={getDeleteTask(setTasks, tasks, task.id)}
                    addSubTask={getAddNewSubTask(setTasks, tasks, task.id)}
                    hasSubTasks={task.subTaskIds && task.subTaskIds.length > 0}
                    completeTask={getCompleteTask(setTasks, tasks, task.id)}
                    plan={getPlanTaskForWeek(setTasks, tasks, task.id)}
                    unplan={getUnplanTask(setTasks, tasks, task.id)}
                    toggleRepeatTask={getToggleRepeatTask(setTasks, tasks, task.id)}
                    addToSelection={() => addTaskToSelection(selectedTasks, setSelectedTasks, task.id, topic && topic.id, topic && findTopicViewIdx(topic.id, task), superTask && superTask.id)}
                    deleteFromSelection={() => deleteTaskFromSelection(selectedTasks, setSelectedTasks, task.id, topic && topic.id, superTask && superTask.id)}
                    selected={selectedTasks.find((st) => (st.taskId == task.id && (!topic || st.topicId == topic.id) && (!superTask || st.superTaskId == superTask.id))) ? true : false}
                    selectedTasks={selectedTasks}
                    moveTasks={getMoveTasks(topics, tasks, setTasks)}
                    duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
                    fancy={fancy}
                    toggleFold={getToggleFoldTask(setTasks, tasks)}
                    setTasks={setTasks}
                    tasks={tasks}
                    unfolded={task.unfolded}
                    setDueTime={getSetTaskDueTime(setTasks, tasks, task.id)}
                    currentDueTime={task.dueTime}
                />
            </li >
            {
                task.subTaskIds && task.subTaskIds.length > 0 && task.unfolded && (

                    <ul>
                        {tasks
                            // .map(t=>{console.log("Hi, I'm a subtask"+t);return t})
                            .filter(subTask => task.subTaskIds.includes(subTask.id))
                            .filter((subTask) => isTaskVisible(subTask, hideCompletedItems, showRepeatedOnly, dueInSeconds))
                            // TODO: ordering of subtasks
                            .map(subTask => (
                                recursiveShowTask(null, task, subTask, tasks, topics, setTasks,
                                    selectedTasks, setSelectedTasks,
                                    hideCompletedItems, showRepeatedOnly, dueInSeconds, fancy))
                            )
                        }
                    </ul>
                )
            }
        </>
    )
}

const showTasksWithoutTopics = (topics, tasks, setTopics, setTasks, selectedTasks, setSelectedTasks,
    hideCompletedItems, showRepeatedOnly, dueInSeconds,
    fancy, allSubTaskIds
) => {
    // const findTopicViewIdx = (topicId, task) => {
    //     return task.topicViewIndices[task.topics.findIndex(taskTopicId => taskTopicId == topicId)]
    // }


    return (<div key="div_tasks_no_topic">
        {tasks
            .filter((task) => isNewTask(task, allSubTaskIds))
            .filter((subTask) => isTaskVisible(subTask, hideCompletedItems, showRepeatedOnly, dueInSeconds))

            // .slice(0).sort((taskA, taskB) => { return findTopicViewIdx(topic.id, taskA) - findTopicViewIdx(topic.id, taskB) })
            .map((task) => (
                recursiveShowTask(null, null, task, tasks, topics, setTasks,
                    selectedTasks, setSelectedTasks,
                    hideCompletedItems, showRepeatedOnly, dueInSeconds, fancy)
            ))

        }
    </div>)
}

const recursiveShowTopic = (topic, tasks,
    setTopics, topics,
    setTasks,
    selectedTasks, setSelectedTasks,
    hideCompletedItems, showRepeatedOnly, dueInSeconds,
    fancy
) => {
    // 1. Show topic
    // 2. Show all subtopics (and their subtopics and tasks)
    // 3. Show all tasks

    // Do not show subtopics when Topic is folded

    const findTopicViewIdx = (topicId, task) => {
        return task.topicViewIndices[task.topics.findIndex(taskTopicId => taskTopicId == topicId)]
    }

    // Return the following HTML structure
    //  <div div_topic_id>
    //      <li>
    //          <Topic>
    //      <ul>
    //          Other subtopics
    //      <ul>
    //          Tasks inside of topic
    return (<div key={'div_' + topic.id}>
        <li key={topic.id}>
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
                hideCompletedItems, showRepeatedOnly, dueInSeconds,
                fancy)
        ))}</ul>
        <ul key={topic.id + '_tasks'}>
            {topic.unfolded && tasks
                .filter((task) => task.topics.includes(topic.id))
                .filter((task) => isTaskVisible(task, hideCompletedItems, showRepeatedOnly, dueInSeconds))
                .slice(0).sort((taskA, taskB) => { return findTopicViewIdx(topic.id, taskA) - findTopicViewIdx(topic.id, taskB) })
                .map(task => (
                    recursiveShowTask(topic, null, task, tasks, topics, setTasks,
                        selectedTasks, setSelectedTasks,
                        hideCompletedItems, showRepeatedOnly, dueInSeconds, fancy))
                )
            }
        </ul></div>
    )
}

const showTopics = (topics, tasks,
    setTopics,
    setTasks,
    selectedTasks, setSelectedTasks,
    hideCompletedItems, showRepeatedOnly, dueInSeconds,
    fancy) => {
    console.info('Re-rendering task list')
    return topics.map((topic) => (recursiveShowTopic(topic, tasks,
        setTopics, topics,
        setTasks,
        selectedTasks, setSelectedTasks,
        hideCompletedItems, showRepeatedOnly, dueInSeconds,
        fancy)))
}
const addTaskToSelection = (selectedTasks, setSelectedTasks, taskId, topicId, topicViewIndex, superTaskId) => {
    let newSelectedTasks = [...selectedTasks]
    newSelectedTasks.push(new SelectedCategoryTask(taskId, topicId, topicViewIndex, superTaskId))
    setSelectedTasks(newSelectedTasks)
}
const deleteTaskFromSelection = (selectedTasks, setSelectedTasks, taskId, topicId, superTaskId) => {
    let newSelectedTasks = [...selectedTasks]
    newSelectedTasks = newSelectedTasks.filter((selTask) => !(selTask.taskId == taskId && selTask.topicId == topicId && selTask.superTaskId == superTaskId))
    setSelectedTasks(newSelectedTasks)
}


const TaskList = (props) => {
    const { tasks, setTasks, topics, setTopics, fancy } = props;
    console.debug("Rendering TaskList")

    const [hideCompletedItems, setHideCompletedItems] = useState(true)
    const [showRepeatedOnly, setShowRepeatedOnly] = useState(false)
    const [dueTimeInSeconds, setDueTimeInSeconds] = useState(undefined)
    const [selectedTasks, setSelectedTasks] = useState([])
    const [runOnce, setRunOnce] = useState(false)
    const [needTransitiveUpdate, setNeedTransitiveUpdate] = useState(true)

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

    const handleUnfoldAll = () => {
        let unfoldAll = getUnfoldAll(setTopics, topics)
        topics.map(topic => unfoldAll(topic.id))

    }


    const onDueDateChange = (event) => {
        let dueDateName = event.target.value
        console.log(dueDateName)
        console.log(convertDueDateNameToSeconds(dueDateName))
        setDueTimeInSeconds(convertDueDateNameToSeconds(dueDateName))
    }


    let allSuperTasks = tasks.filter((task) => task.subTaskIds && task.subTaskIds.length > 0)
    let allSubTaskIds = allSuperTasks.reduce((acc, task) => {
        acc = acc.concat(task.subTaskIds)
        return acc
    }, [])

    if (runOnce < 2) {
        console.log("Running sanitize")
        sanitizeTopicOrderIndex(topics, tasks, setTasks)
        // setRunOnce(runOnce + 1)
    }

    const updateTransitiveDueDate_r = (subTaskIds) => {
        return tasks
            .filter((task) => subTaskIds.includes(task.id))
            .reduce((acc, task) => {
                let newDueTime = updateTransitiveDueDate_r(task.subTaskIds)
                acc = safe_min(acc, task.dueTime)
                acc = safe_min(acc, newDueTime)
                console.log(acc)
                return acc
            }, undefined)

    }

    const safe_min = (a, b) => {
        if (a === undefined && b === undefined) { return undefined }
        if (a === undefined) { return b }
        if (b === undefined) { return a }
        return Math.min(a, b)
    }

    const updateTransitiveDueDate = () => {
        tasks.forEach((task) => {
            console.log(task.name)
            task.transitiveDueTime = safe_min(task.dueTime, updateTransitiveDueDate_r(task.subTaskIds))
            console.log(task.dueTime)
            console.log(task.transitiveDueTime)
        })
    }


    if (needTransitiveUpdate) {
        console.log("Updating transitive ADG data")
        updateTransitiveDueDate()
        setNeedTransitiveUpdate(false)
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
    // checkForDuplicateIds(tasks)

    return (
        <div className='task-list'>
            <button onClick={getAddTopic(setTopics, topics)}> Add New Root topic</button><br />
            <label><input
                type="checkbox"
                name='HideCompletedItems'
                onChange={onHideCompletedItemsChange}
                className="form-check-input"
                defaultChecked={hideCompletedItems}
            />Hide finished tasks</label>
            <label><input
                type="checkbox"
                name='ShowRepeatedOnly'
                onChange={onShowRepeatedOnlyChange}
                className="form-check-input"
                defaultChecked={setShowRepeatedOnly}
            />Show repeated tasks only</label>
            <button className="fold_all" onClick={handleFoldAll} >Fold all</button>
            <button className="unfold_all" onClick={handleUnfoldAll} >Unfold all</button>
            <select id="select_due_date" name="due_date" onChange={onDueDateChange}>
                <option value="none">Select due time interval</option>
                <option value="setDueDate"></option>
                <option value="30min">30 minutes</option>
                <option value="2hrs">2 hours</option>
                <option value="8hrs">8 hours</option>
                <option value="1day">1 day</option>
                <option value="4day">4 day</option>
                <option value="1week">1 week</option>
                <option value="2week">2 weeks</option>
                <option value="3week">3 weeks</option>
                <option value="1month">1 month</option>
            </select>
            <ul key='root_topics'>
                {showTasksWithoutTopics(
                    topics, tasks,
                    setTopics, setTasks,
                    selectedTasks, setSelectedTasks,
                    hideCompletedItems, showRepeatedOnly, dueTimeInSeconds,
                    fancy,
                    allSubTaskIds,
                )}
                {showTopics(topics, tasks,
                    setTopics,
                    setTasks,
                    selectedTasks, setSelectedTasks,
                    hideCompletedItems, showRepeatedOnly, dueTimeInSeconds,
                    fancy)}
            </ul>
            <button onClick={() => testFunction()}>Test Function</button>
            <button onClick={() => setNeedTransitiveUpdate(true)}>Test ADG Update</button>
        </div>
    );
}

export default TaskList;