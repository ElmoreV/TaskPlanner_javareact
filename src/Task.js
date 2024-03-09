import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const Task = (props) => {
    const { taskKey, taskName, setTaskName, deleteTask, completed, completeTask, currentTopic, changeTopic, planned, plan, unplan } = props;

    const [isEditing, setIsEditing] = useState(false);
    const [color, setColor] = useState('green');
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingAllowed, setIsDraggingAllowed] = useState(true);

    const handleChange = (e) => {
        console.info(e.target.value);
        setTaskName(e.target.value);
    }


    const handleDragStart = (e) => {
        setIsDragging(true)
        e.dataTransfer.setData('Type', "Task")
        e.dataTransfer.setData('Text', taskKey)
        e.dataTransfer.setData('Text2', currentTopic) //also name
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
        setColor('yellow')
        var type = e.dataTransfer.getData("Type")
        if (type == "Task") {
            var key = e.dataTransfer.getData("Text")
            var oldTopic = e.dataTransfer.getData("Text2")
            if (changeTopic) {
                changeTopic(key, oldTopic, currentTopic)
            }
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

    const duplicateDragHandlers = isDraggingAllowed? {draggable:true}:{}


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
                value={taskName}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                ref={inputRef}
            /> :
            //  <span style={{color : color}}>{taskName}</span>
            <><span style={{ color: color }}>{taskName}</span>
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
    taskName: PropTypes.string.isRequired,
    setTaskName: PropTypes.func,
    deleteTask: PropTypes.func,
    completed: PropTypes.bool.isRequired,
    completeTask: PropTypes.func
};


export default Task;