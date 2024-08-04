import PlannedTask from "./PlannedTask.js"
import { getSetTaskNameFunc } from "../Tasks/TaskModifyFuncGens.js";
import { getAddTaskWithoutTopic } from "../ADG/ModifyFuncGeneratorsV1.js";

const AddTaskView = (props) => {
    const { tasks, setTasks, topics, setTopics, fancy } = props;
    console.debug("Rendering AddTaskView")

    // const [hideCompletedItems, setHideCompletedItems] = useState(true)
    // const [hideScheduledItems, setHideScheduledItems] = useState(false)
    // const [selectedTasks, setSelectedTasks] = useState([])

    // const clearSelection = () => {
    //     console.log("Clearing selection")
    //     setSelectedTasks([]);
    // };
    // useEffect(() => {
    //     // Function to clear selection


    //     // Add global click listener
    //     document.addEventListener('click', clearSelection);

    //     // Remove the event listener on cleanup
    //     return () => {
    //         document.removeEventListener('click', clearSelection);
    //     };
    // }, []); // Empty dependency array means this effect runs once on mount


    // const addTaskToSelection = (taskId, weekOrderIndex) => {
    //     let newSelectedTasks = [...selectedTasks]
    //     newSelectedTasks.push(new SelectedTask(taskId, weekOrderIndex))
    //     setSelectedTasks(newSelectedTasks)
    // }

    // const deleteTaskFromSelection = (taskId, weekOrderIndex) => {
    //     let newSelectedTasks = [...selectedTasks]
    //     newSelectedTasks = newSelectedTasks.filter((selTask) => !(selTask.taskId == taskId && selTask.weekOrderIndex == weekOrderIndex))
    //     setSelectedTasks(newSelectedTasks)
    // }

    // const onHideCompletedItemsChange = () => {
    //     setHideCompletedItems(!hideCompletedItems)
    // }
    // const onHideScheduledItemsChange = () => {
    //     setHideScheduledItems(!hideScheduledItems)
    // }
    // const onClearCompletedItems = () => {
    //     let newTasks = [...tasks]
    //     newTasks = newTasks.map((task) => (((task.completed || (task.finishStatus !== undefined && task.finishStatus !== FinishedState.NotFinished))
    //         && task.thisWeek) ? { ...task, thisWeek: false, scheduled: false } : task))
    //     setTasks(newTasks)
    // }
    const isVisible = (task) => {
        // Only show tasks when it has no topics
        // Otherwise, we can assume it's already been categorized and not new
        // Also do not show tasks that are in a subtask
        return task.topics.length == 0 && !allSubTaskIds.includes(task.id)
    }
    // const isVisible = (task, checkWeek) => {
    //     return ((!((task.completed || (task.finishStatus !== undefined && task.finishStatus !== FinishedState.NotFinished))
    //         && hideCompletedItems))
    //         && !(task.scheduled && hideScheduledItems)
    //         && (task.thisWeek || !checkWeek)
    //     )
    // }

    // const copyListToClipboard = () => {
    //     let taskList = tasks.sort((taskA, taskB) => taskA.weekOrderIndex > taskB.weekOrderIndex).reduce(
    //         (acc, task) =>
    //             isVisible(task, true) ? acc.concat(task.name, '\n') : acc
    //         // if (isVisible(task)) { return acc.concat(task.name, '\n') } else { return acc }

    //         // isVisible(task) ? acc.concat(task.name, '\n') : null
    //         , "")
    //     console.log(taskList)
    //     navigator.clipboard.writeText(taskList)
    // }

    // sanitizeWeekOrderIndex(setTasks, tasks)
    let allSuperTasks = tasks.filter((task) => task.subTaskIds && task.subTaskIds.length > 0)
    let allSubTaskIds = allSuperTasks.reduce((acc, task) => {
        acc = acc.concat(task.subTaskIds)
        return acc
    }, [])
    return (
        <div className='task-list'>
            {/* <button onClick={onClearCompletedItems}>Clear finished items</button> */}
            {/* <label><input
                type="checkbox"
                name='HideCompletedItems'
                onChange={onHideCompletedItemsChange}
                className="form-check-input"
                defaultChecked={hideCompletedItems}
            />Hide finished tasks</label> */}
            {/* <label><input
                type="checkbox"
                name='HideScheduledItems'
                onChange={onHideScheduledItemsChange}
                className="form-check-input"
                defaultChecked={hideScheduledItems}
            />Hide scheduled tasks</label> */}
            {/* <button onClick={copyListToClipboard}>
                Copy to clipboard
            </button> */}
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
                            setTaskName={getSetTaskNameFunc(setTasks, tasks, task.id)}
                        />
                    ))
                }
            </ul>
            <button onClick={getAddTaskWithoutTopic(setTasks, tasks)}>Add task</button>



            {/* <ul key='root_topics'>
                {tasks.sort((taskA, taskB) => taskA.weekOrderIndex > taskB.weekOrderIndex)
                    .filter((task) => (isVisible(task, true)))
                    .map((task) => (
                        recursiveShowPlannedTask(task, null, setTasks, tasks,
                            addTaskToSelection, deleteTaskFromSelection, clearSelection, selectedTasks,
                            topics, fancy, isVisible)
                    )
                    )}
            </ul> */}
        </div >
    );
}


export default AddTaskView;