import { useState } from 'react';
import PlannedTask from './PlannedTask';
import { getCompleteTask } from './ModifyFuncGeneratorsV1';
// TODO: add the topic name to the bar

const PlannedList = (props) => {
    const { tasks, setTasks, topics, setTopics } = props;

    const [hideCompletedItems, setHideCompletedItems] = useState(false)
    const onHideCompletedItemsChange = () => {
        setHideCompletedItems(!hideCompletedItems)
    }


    return (
        <div className='planned-list'>
            <label><input
                type="checkbox"
                name='HideCompletedItems'
                onChange={onHideCompletedItemsChange}
                className="form-check-input"
            />Hide completed tasks</label>
            <ul key='root_topics'>
                {tasks.map(
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