import { useState, useEffect } from 'react';
import PlannedTask from './PlannedTask';
import {
    getCompleteTask,
    getScheduleTask,
    getChangeWeekOrderIndex,
    sanitizeWeekOrderIndex,
    getUnplanTask
} from './ModifyFuncGeneratorsV1';
// TODO: add the topic name to the bar

class SelectedTask {
    constructor(taskId, weekOrderIndex) {
        this.taskId = taskId
        this.weekOrderIndex = weekOrderIndex
    }
}


const PlannedList = (props) => {
    const { tasks, setTasks, topics, setTopics } = props;
    console.debug("Rendering PlannedList")

    const [hideCompletedItems, setHideCompletedItems] = useState(true)
    const [hideScheduledItems, setHideScheduledItems] = useState(false)
    const [selectedTasks, setSelectedTasks] = useState([])

    useEffect(() => {
        // Function to clear selection
        const clearSelectionOnClickOutside = (event) => {
            setSelectedTasks([]);
        };

        // Add global click listener
        document.addEventListener('click', clearSelectionOnClickOutside);

        // Remove the event listener on cleanup
        return () => {
            document.removeEventListener('click', clearSelectionOnClickOutside);
        };
    }, []); // Empty dependency array means this effect runs once on mount


    const addTaskToSelection = (taskId, weekOrderIndex) => {
        let newSelectedTasks = [...selectedTasks]
        newSelectedTasks.push(new SelectedTask(taskId, weekOrderIndex))
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
        newTasks = newTasks.map((task) => (task.completed && task.thisWeek) ? { ...task, thisWeek: false } : task)
        setTasks(newTasks)
    }
    const isVisible = (task) => {
        return (!(task.completed && hideCompletedItems) && !(task.scheduled && hideScheduledItems) && task.thisWeek)
    }

    const copyListToClipboard = () => {
        let taskList = tasks.sort((taskA, taskB) => taskA.weekOrderIndex > taskB.weekOrderIndex).reduce(
            (acc, task) =>
                isVisible(task) ? acc.concat(task.name, '\n') : acc
            // if (isVisible(task)) { return acc.concat(task.name, '\n') } else { return acc }

            // isVisible(task) ? acc.concat(task.name, '\n') : null
            , "")
        console.log(taskList)
        navigator.clipboard.writeText(taskList)
    }

    sanitizeWeekOrderIndex(setTasks, tasks)

    return (
        <div className='planned-list'>
            <button onClick={onClearCompletedItems}>Clear completed items</button>
            <label><input
                type="checkbox"
                name='HideCompletedItems'
                onChange={onHideCompletedItemsChange}
                className="form-check-input"
                defaultChecked={hideCompletedItems}
            />Hide completed tasks</label>
            <label><input
                type="checkbox"
                name='HideScheduledItems'
                onChange={onHideScheduledItemsChange}
                className="form-check-input"
                defaultChecked={hideScheduledItems}
            />Hide scheduled tasks</label>
            <button onClick={copyListToClipboard}>
                Copy to clipboardd
            </button>

            <ul key='root_topics'>
                {tasks.sort((taskA, taskB) => taskA.weekOrderIndex > taskB.weekOrderIndex).map(
                    (task) => {
                        return (
                            <li>
                                {isVisible(task) && <PlannedTask
                                    taskName={task.name}
                                    taskKey={task.id}
                                    // setTaskName={getSetTaskNameFunc(task.id)}
                                    // deleteTask = {getDeleteTask(task.id)}
                                    completed={task.completed}
                                    completeTask={getCompleteTask(setTasks, tasks, task.id)}
                                    scheduled={task.scheduled}
                                    scheduleTask={getScheduleTask(setTasks, tasks, task.id)}
                                    unplan={getUnplanTask(setTasks, tasks, task.id)}
                                    // currentTopic = {task.topics[0]}
                                    addToSelection={() => addTaskToSelection(task.id, task.weekOrderIndex)}
                                    deleteFromSelection={() => deleteTaskFromSelection(task.id, task.weekOrderIndex)}
                                    selected={selectedTasks.find((st) => (st.taskId == task.id && st.weekOrderIndex == task.weekOrderIndex)) ? true : false}
                                    selectedTasks={selectedTasks}

                                    currentWeekOrderIndex={task.weekOrderIndex}
                                    changeWeekOrderIndex={getChangeWeekOrderIndex(setTasks, tasks)}
                                    topics={topics}
                                    taskTopics={task.topics}
                                // changeTopic = {getChangeTaskTopic()}
                                />
                                }
                            </li>
                        )
                    }
                )}
            </ul>
        </div>
    );
}


export default PlannedList;