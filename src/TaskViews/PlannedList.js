import { useState, useEffect } from 'react';
import PlannedTask from './PlannedTask.js';
import {
    getChangeWeekOrderIndex,
    sanitizeWeekOrderIndex,
    getSpawnNewTask,
} from '../ADG/ModifyFuncGeneratorsV1.js';
import {
    getCompleteTaskV1,
    getScheduleTaskV1,
    getUnplanTaskV1,
    getSetTaskNameFuncV1,
    getSetTaskFinishStatusV1,
    getToggleFoldTaskV1,
} from "../Tasks/TaskModifyFuncGensV1.ts";

import { FinishedState } from '../Tasks/TaskInterfaces.tsx';

// TODO: add the topic name to the bar

class SelectedPlannedTask {
    constructor(taskId, weekOrderIndex) {
        this.taskId = taskId
        this.weekOrderIndex = weekOrderIndex
    }
}


const recursiveShowPlannedTask = (task, superTask, setTasks, tasks,
    addTaskToSelection, deleteTaskFromSelection, clearSelection, selectedTasks,
    topics, fancy, isVisible) => {
    console.log("Task recusrive planning " + task.name)
    return (
        <li key={"planned_" + (task.id)}>
            <PlannedTask
                taskName={task.name}
                taskKey={task.id}
                // deleteTask = {getDeleteTask(task.id)}
                completed={task.completed}
                taskFinishStatus={task.finishStatus}
                scheduled={task.scheduled}
                currentWeekOrderIndex={task.weekOrderIndex}
                taskLastCompletion={task.lastFinished}
                taskTopics={task.topics}
                hasSubTasks={task.subTaskIds && task.subTaskIds.length > 0}
                unfolded={task.unfolded}
                topics={topics}
                fancy={fancy}
                clearSelection={clearSelection}
                selected={selectedTasks.find((st) => (st.taskId == task.id && st.weekOrderIndex == task.weekOrderIndex)) ? true : false}
                selectedTasks={selectedTasks}

                setTaskName={getSetTaskNameFuncV1(setTasks, tasks, task.id)}
                setTaskFinishStatus={getSetTaskFinishStatusV1(setTasks, tasks, task.id)}
                completeTask={getCompleteTaskV1(setTasks, tasks, task.id)}
                scheduleTask={getScheduleTaskV1(setTasks, tasks, task.id)}
                unplan={getUnplanTaskV1(setTasks, tasks, task.id)}
                // currentTopic = {task.topics[0]}
                addToSelection={() => addTaskToSelection(task.id, task.weekOrderIndex)}
                deleteFromSelection={() => deleteTaskFromSelection(task.id, task.weekOrderIndex)}
                changeWeekOrderIndex={getChangeWeekOrderIndex(setTasks, tasks)}
                spawnNewTask={getSpawnNewTask(setTasks, tasks, task)}
                toggleFold={getToggleFoldTaskV1(setTasks, tasks)}
            />
            {
                task.subTaskIds && task.subTaskIds.length > 0 && task.unfolded && (
                    <ul>
                        {tasks
                            // .map(t=>{console.log("Hi, I'm a subtask"+t);return t})
                            .filter(subTask => task.subTaskIds.includes(subTask.id))
                            .filter((subTask) => isVisible(subTask, false))
                            // TODO: ordering of subtasks
                            .map(subTask => (
                                recursiveShowPlannedTask(subTask, task, setTasks, tasks,
                                    addTaskToSelection, deleteTaskFromSelection, clearSelection, selectedTasks,
                                    topics, fancy, isVisible))
                            )
                        }
                    </ul>
                )
            }
        </li>
    )


}

const PlannedList = (props) => {
    const { tasks, setTasks, topics, setTopics, fancy } = props;
    console.debug("Rendering PlannedList")

    const [hideCompletedItems, setHideCompletedItems] = useState(true)
    const [hideScheduledItems, setHideScheduledItems] = useState(false)
    const [selectedTasks, setSelectedTasks] = useState([])

    const clearSelection = () => {
        console.log("Clearing selection")
        setSelectedTasks([]);
    };
    useEffect(() => {
        // Function to clear selection


        // Add global click listener
        document.addEventListener('click', clearSelection);

        // Remove the event listener on cleanup
        return () => {
            document.removeEventListener('click', clearSelection);
        };
    }, []); // Empty dependency array means this effect runs once on mount


    const addTaskToSelection = (taskId, weekOrderIndex) => {
        let newSelectedTasks = [...selectedTasks]
        newSelectedTasks.push(new SelectedPlannedTask(taskId, weekOrderIndex))
        setSelectedTasks(newSelectedTasks)
    }
    const deleteTaskFromSelection = (taskId, weekOrderIndex) => {
        let newSelectedTasks = [...selectedTasks]
        newSelectedTasks = newSelectedTasks.filter((selTask) => !(selTask.taskId == taskId && selTask.weekOrderIndex == weekOrderIndex))
        setSelectedTasks(newSelectedTasks)
    }

    const onHideCompletedItemsChange = () => {
        setHideCompletedItems(!hideCompletedItems)
    }
    const onHideScheduledItemsChange = () => {
        setHideScheduledItems(!hideScheduledItems)
    }
    const onClearCompletedItems = () => {
        let newTasks = [...tasks]
        newTasks = newTasks.map((task) => (((task.completed || (task.finishStatus !== undefined && task.finishStatus !== FinishedState.NotFinished))
            && task.thisWeek) ? { ...task, thisWeek: false, scheduled: false } : task))
        setTasks(newTasks)
    }
    const isVisible = (task, checkWeek) => {
        return ((!((task.completed || (task.finishStatus !== undefined && task.finishStatus !== FinishedState.NotFinished))
            && hideCompletedItems))
            && !(task.scheduled && hideScheduledItems)
            && (task.thisWeek || !checkWeek)
        )
    }

    const copyListToClipboard = () => {
        let taskList = tasks.sort((taskA, taskB) => taskA.weekOrderIndex > taskB.weekOrderIndex).reduce(
            (acc, task) =>
                isVisible(task, true) ? acc.concat(task.name, '\n') : acc
            // if (isVisible(task)) { return acc.concat(task.name, '\n') } else { return acc }

            // isVisible(task) ? acc.concat(task.name, '\n') : null
            , "")
        console.log(taskList)
        navigator.clipboard.writeText(taskList)
    }

    sanitizeWeekOrderIndex(setTasks, tasks)

    return (
        <div className='planned-list'>
            <button onClick={onClearCompletedItems}>Clear finished items</button>
            <label><input
                type="checkbox"
                name='HideCompletedItems'
                onChange={onHideCompletedItemsChange}
                className="form-check-input"
                defaultChecked={hideCompletedItems}
            />Hide finished tasks</label>
            <label><input
                type="checkbox"
                name='HideScheduledItems'
                onChange={onHideScheduledItemsChange}
                className="form-check-input"
                defaultChecked={hideScheduledItems}
            />Hide scheduled tasks</label>
            <button onClick={copyListToClipboard}>
                Copy to clipboard
            </button>

            <ul key='root_topics'>
                {tasks.sort((taskA, taskB) => taskA.weekOrderIndex > taskB.weekOrderIndex)
                    .filter((task) => (isVisible(task, true)))
                    .map((task) => (
                        recursiveShowPlannedTask(task, null, setTasks, tasks,
                            addTaskToSelection, deleteTaskFromSelection, clearSelection, selectedTasks,
                            topics, fancy, isVisible)
                    )
                    )}
            </ul>
        </div>
    );
}


export default PlannedList;