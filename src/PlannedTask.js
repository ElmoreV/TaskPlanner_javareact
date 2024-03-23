import { useState } from 'react';
import PropTypes from 'prop-types';
import { getTopicTreeById } from './TopicHelper';

const PlannedTask = (props) => {
    const { taskKey, taskName, setTaskName, deleteTask,
        completed, completeTask,
        scheduled, scheduleTask,
        currentTopic, changeTopic, planned, plan, topics, taskTopics,
        changeWeekOrderIndex, currentWeekOrderIndex } = props;

    const [isEditing, setIsEditing] = useState(false);
    const [color, setColor] = useState('green');
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingAllowed, setIsDraggingAllowed] = useState(true);



    const handleChange = (e) => {
        console.info(e.target.value);
        if (setTaskName) { setTaskName(e.target.value); }
    }

    const toggleEdit = () => {
        setIsEditing(true);
        setIsDraggingAllowed(false);
        // TODO: set focus on text edit box

    }

    const handleDragStart = (e) => {
        setIsDragging(true)
        e.dataTransfer.setData('taskId', taskKey)
        e.dataTransfer.setData('sourceWeekOrderIndex', currentWeekOrderIndex)
        setColor('blue')
    }
    const handleDragEnd = () => {
        setIsDragging(false)
        setColor('green')
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.target.setAttribute('draggedOver', false)
        console.info('drop')
        setColor('maroon')
        var sourceTaskId = e.dataTransfer.getData("taskId")
        var sourceWeekOrderIndex = e.dataTransfer.getData("sourceWeekOrderIndex")
        console.log(`Dropping from task with id=${sourceTaskId} with weekIndex=${sourceWeekOrderIndex} on task with id=${taskKey} with weekIndex=${currentWeekOrderIndex}`)
        if (changeWeekOrderIndex) { changeWeekOrderIndex(sourceTaskId, sourceWeekOrderIndex, currentWeekOrderIndex) }
    }
    const handleDragOver = (e) => {
        e.preventDefault();
        // this is not perfect, because I always want the <div class='task'> to be the target..
        e.target.setAttribute('draggedOver', true);
        setColor('red');
    }
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.target.setAttribute('draggedOver', false);
        setColor('gray');
    }

    const moveToWeek = () => {
        if (plan) { plan() }
    }

    const handleBlur = () => {
        setIsDraggingAllowed(true);
        setIsEditing(false);

    }
    let class_str = 'task'
    // Completion has precedence over planned
    if (completed) { class_str = 'taskCompleted' }
    else if (scheduled) { class_str = 'taskPlanned' }

    const dragHandlers = isDraggingAllowed ? { draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd } : {};
    const dropHandlers = isDragging ? {} : { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave };

    let topicPath = getTopicTreeById(topics, taskTopics[0])


    return (<div className={class_str}
        onDoubleClick={toggleEdit}
        {...dragHandlers}
        {...dropHandlers}>
        <div className="textBar">
            <span className="taskText">
                {isEditing ?
                    <input type='text'
                        value={taskName}
                        onChange={handleChange}
                        onBlur={handleBlur} /> :
                    //  <span style={{color : color}}>{taskName}</span>
                    <span style={{ color: color }}>{taskName}</span>
                }
            </span>
            <span className="topicPath">{topicPath}</span>
        </div>
        {deleteTask && (<button className='taskDelete' onClick={deleteTask && deleteTask}>Delete</button>)}
        {!completed && completeTask && (<button className='taskComplete' onClick={completeTask}>Complete</button>)}
        {completed && completeTask && (<button className='taskComplete' onClick={completeTask}>Decomplete</button>)}
        {plan && (<button className='moveToWeek' onClick={moveToWeek}> Plan for this week </button>)}
        {scheduled && scheduleTask && (<button className='taskSchedule' onClick={scheduleTask}>Scheduled!</button>)}
        {!scheduled && scheduleTask && (<button className='taskSchedule' onClick={scheduleTask}>Unscheduled</button>)}


    </div>);
}

PlannedTask.propTypes = {
    taskName: PropTypes.string.isRequired,
    setTaskName: PropTypes.func,
    deleteTask: PropTypes.func,
    completed: PropTypes.bool.isRequired,
    completeTask: PropTypes.func
};


export default PlannedTask;