import { useState, useEffect } from 'react';
import PlannedTask from "./PlannedTask.js"
import { getSetTaskNameFuncV1 } from "../Tasks/TaskModifyFuncGensV1.ts";
import { getAddTaskWithoutTopic } from "../ADG/ModifyFuncGeneratorsV1.js";

class SelectedNewTask {
    constructor(taskId, weekOrderIndex) {
        this.taskId = taskId
    }
}


const AddTaskView = (props) => {
    const { tasks, setTasks, topics, setTopics, fancy } = props;
    console.debug("Rendering AddTaskView")

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
        newSelectedTasks.push(new SelectedNewTask(taskId))
        setSelectedTasks(newSelectedTasks)
    }

    const deleteTaskFromSelection = (taskId, weekOrderIndex) => {
        let newSelectedTasks = [...selectedTasks]
        newSelectedTasks = newSelectedTasks.filter((selTask) => !(selTask.taskId == taskId && selTask.weekOrderIndex == weekOrderIndex))
        setSelectedTasks(newSelectedTasks)
    }

    const isVisible = (task) => {
        // Only show tasks when it has no topics
        // Otherwise, we can assume it's already been categorized and not new
        // Also do not show tasks that are in a subtask
        return task.topics.length == 0 && !allSubTaskIds.includes(task.id)
    }

    let allSuperTasks = tasks.filter((task) => task.subTaskIds && task.subTaskIds.length > 0)
    let allSubTaskIds = allSuperTasks.reduce((acc, task) => {
        acc = acc.concat(task.subTaskIds)
        return acc
    }, [])
    return (
        <div className='task-list'>
            <button onClick={getAddTaskWithoutTopic(setTasks, tasks)}>Add task</button>
            <ul>
                {tasks
                    .filter((task) => (isVisible(task)))
                    .map((task) => (
                        <PlannedTask
                            taskName={task.name}
                            taskKey={task.id}
                            hasSubTasks={task.subTaskIds && task.subTaskIds.length > 0}
                            topics={topics}
                            taskTopics={task.topics}
                            fancy={fancy}
                            setTaskName={getSetTaskNameFuncV1(setTasks, tasks, task.id)}
                            clearSelection={clearSelection}
                            selected={selectedTasks.find((st) => (st.taskId == task.id && st.weekOrderIndex == task.weekOrderIndex)) ? true : false}
                            selectedTasks={selectedTasks}
                        />
                    ))
                }
            </ul>
            <button onClick={getAddTaskWithoutTopic(setTasks, tasks)}>Add task</button>
        </div >
    );
}


export default AddTaskView;