import { useState } from 'react';
import PlannedTask from './PlannedTask';

// TODO: add the topic name to the bar

const PlannedList = (props) => {
    const { tasks, setTasks, topics, setTopics } = props;

    return (
        <div className='planned-list'>
            <ul key='root_topics'>
                {tasks.map(
                    (task) => {
                        return (<li>{task.thisWeek && <PlannedTask
                            taskName={task.name}
                            taskKey={task.id}
                            // setTaskName={getSetTaskNameFunc(task.id)}
                            // deleteTask = {getDeleteTask(task.id)}
                            completed={task.completed}
                            // completeTask = {getCompleteTask(task.id)}
                            // currentTopic = {task.topics[0]}
                            topics={topics}
                            taskTopics={task.topics}
                        // changeTopic = {getChangeTaskTopic()}
                        />} </li>)
                    }
                )}
            </ul>
        </div>
    );
}


export default PlannedList;