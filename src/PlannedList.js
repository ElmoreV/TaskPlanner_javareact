import { useState} from 'react';
import Task from './Task';

const PlannedList= (props)=>
{
    const {tasks,setTasks,topics,setTopics} = props;

    return (
        <div className = 'planned-list'>
            <ul key='root_topics'>
            {tasks.map(
            (task)=>
        {
            return (<li>{task.thisWeek &&<Task
                taskName={task.taskName} 
                taskKey = {task.key}
                // setTaskName={getSetTaskNameFunc(task.id)}
                // deleteTask = {getDeleteTask(task.id)}
                completed = {task.completed} 
                // completeTask = {getCompleteTask(task.id)}
                currentTopic = {"blegh"}
                // changeTopic = {getChangeTaskTopic()}
            />}</li>)
        }
        )}
        </ul>
        </div>
    )  ;
}


export default PlannedList;