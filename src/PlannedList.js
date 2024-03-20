import { useState } from 'react';
import PlannedTask from './PlannedTask';
import {
    getCompleteTask,
    getChangeWeekOrderIndex,
    sanitizeWeekOrderIndex
} from './ModifyFuncGeneratorsV1';
// TODO: add the topic name to the bar

const PlannedList = (props) => {
    const { tasks, setTasks, topics, setTopics } = props;

    const [hideCompletedItems, setHideCompletedItems] = useState(false)
    const onHideCompletedItemsChange = () => {
        setHideCompletedItems(!hideCompletedItems)
    }

    const onClearCompletedItems = () => {
        let newTasks = [...tasks]
        newTasks = newTasks.map((task) => (task.completed && task.thisWeek) ? { ...task, thisWeek: false } : task)
        setTasks(newTasks)
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
            />Hide completed tasks</label>
            <ul key='root_topics'>
                {tasks.sort((taskA, taskB) => taskA.weekOrderIndex > taskB.weekOrderIndex).map(
                    (task) => {
                        return (
                            <li>
                                {!(task.completed && hideCompletedItems) &&
                                    task.thisWeek && <PlannedTask
                                        taskName={task.name}
                                        taskKey={task.id}
                                        // setTaskName={getSetTaskNameFunc(task.id)}
                                        // deleteTask = {getDeleteTask(task.id)}
                                        completed={task.completed}
                                        completeTask={getCompleteTask(setTasks, tasks, task.id)}
                                        // currentTopic = {task.topics[0]}
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