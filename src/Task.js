import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const Task = (props) => {
    const { id, name, setTaskName, deleteTask,
        completed, completeTask,
        currentTopicName, currentTopicId, changeTopic,
        planned, plan, unplan,
        duplicateTask } = props;

    const [isEditing, setIsEditing] = useState(false);
    const [color, setColor] = useState('green');
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingAllowed, setIsDraggingAllowed] = useState(true);
    let isDuplicateDragging = false;

    const handleChange = (e) => {
        console.info(e.target.value);
        setTaskName(e.target.value);
    }


    const handleDragStart = (e) => {
        if (isDuplicateDragging) { return; }
        setIsDragging(true)
        e.dataTransfer.setData('Type', "Task")
        e.dataTransfer.setData('TaskId', id)
        e.dataTransfer.setData('TopicName', currentTopicName) //also name
        e.dataTransfer.setData('TopicId', currentTopicId) //also name
        console.info('Dragging task')
        setColor('blue')
    }
    const handleDragEnd = () => {
        //TODO: how is this event still called when dropping duplicate?
        if (isDuplicateDragging) { return; }
        console.info("Stop dragging task")
        setIsDragging(false)
        setColor('green')
    }

    const handleDuplicateDragStart = (e) => {
        // How to prevent the normal drag to happen?
        setIsDragging(true)
        isDuplicateDragging = true;
        e.dataTransfer.setData("Type", "TaskDuplicate")
        e.dataTransfer.setData('TaskId', id)
        console.info('Duplicate dragging task')
        setColor('pink')
    }
    const handleDuplicateDragEnd = () => {
        isDuplicateDragging = false;
        console.info("Stop duplicate dragging task")
        setIsDragging(false)
        setColor('violet')
    }


    const handleDrop = (e) => {
        e.preventDefault()
        e.target.setAttribute('draggedOver', false)
        console.info('drop')
        setColor('yellow')
        var type = e.dataTransfer.getData("Type")
        if (type == "Task") {
            var task_id = Number(e.dataTransfer.getData("TaskId"))
            var oldTopicName = e.dataTransfer.getData("TopicName")
            var oldTopicId = Number(e.dataTransfer.getData("TopicId"))
            console.info(`Dropped task with id ${task_id} with old topic id ${oldTopicId} on task within topic with id ${currentTopicId}`)
            console.info(changeTopic)
            if (changeTopic) {
                // changeTopic(key, oldTopicName, currentTopicName) //v0
                changeTopic(task_id, oldTopicId, currentTopicId)
            }
        } else if (type == "TaskDuplicate") {
            var task_id = Number(e.dataTransfer.getData("TaskId"))
            console.info(`Duplicate dropped task with id ${task_id} on this topic with id ${currentTopicId}`)
            duplicateTask(task_id, currentTopicId)
        } else {
            console.info("On a task, you can only drop another task (not a topic)")
        }
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
        plan()
    }
    const moveOutOfWeek = () => {
        unplan()
    }


    let class_str = 'task'
    // Completion has precedence over planned
    if (completed) { class_str = 'taskCompleted' }
    else if (planned) { class_str = 'taskPlanned' }

    const dragHandlers = isDraggingAllowed ? { draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd } : {};
    const dropHandlers = isDragging ? {} : { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave };

    const duplicateDragHandlers = isDraggingAllowed ? {
        draggable: true,
        onDragStart: handleDuplicateDragStart,
        onDragEnd: handleDuplicateDragEnd
    } : {}


    const toggleEdit = () => {
        setIsEditing(true);
        setIsDraggingAllowed(false);
        // inputRef.current.focus()
        // TODO: set focus on text edit box

    }

    const handleKeyDown = (event) => {
        // Check if the Enter key was pressed
        if (event.key === 'Enter') {
            // Call handleBlur or directly implement logic to finish editing
            handleBlur();
            // Prevents the form from being submitted if your input is part of one
            event.preventDefault();
        }
    };
    const handleBlur = () => {
        setIsDraggingAllowed(true);
        setIsEditing(false);

    }
    const inputRef = useRef(null);
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]); // Dependency array ensures this runs only when isEditing changes



    return (<div className={class_str}
        onDoubleClick={toggleEdit}
        {...dragHandlers}
        {...dropHandlers}>
        {isEditing ?
            <input type='text'
                value={name}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                ref={inputRef}
            /> :
            //  <span style={{color : color}}>{name}</span>
            <><span style={{ color: color }}>{name}</span>
                <span className='buttonDuplicate' {...duplicateDragHandlers}>+ Duplicate +</span></>
        }
        {deleteTask && (<button className='taskDelete' onClick={deleteTask && deleteTask}>Delete</button>)}
        {!completed && completeTask && (<button className='taskComplete' onClick={completeTask}>Complete</button>)}
        {completed && completeTask && (<button className='taskComplete' onClick={completeTask}>Decomplete</button>)}
        {plan && planned && (<button className='moveToWeek' onClick={moveOutOfWeek}> Unplan for this week </button>)}
        {plan && !planned && (<button className='moveToWeek' onClick={moveToWeek}> Plan for this week </button>)}
    </div>);
}

Task.propTypes = {
    name: PropTypes.string.isRequired,
    setTaskName: PropTypes.func,
    deleteTask: PropTypes.func,
    completed: PropTypes.bool.isRequired,
    completeTask: PropTypes.func
};


export default Task;