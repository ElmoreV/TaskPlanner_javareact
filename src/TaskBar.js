import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';


// This will be the layout that can be customized, with different event handlers
// To decouple layout and the logic between the handlers.
const TaskBar = (props) => {
    // const { id, name, setTaskName, deleteTask,
    //     completed, completeTask,
    //     currentTopicName, currentTopicId, changeTopic,
    //     planned, plan, unplan,
    //     repeated, toggleRepeatTask,
    //     duplicateTask } = props;

    // const [isEditing, setIsEditing] = useState(false);
    // const [color, setColor] = useState('green');
    // const [isDragging, setIsDragging] = useState(false);
    // const [isDraggingAllowed, setIsDraggingAllowed] = useState(true);
    // let isDuplicateDragging = false;

    //completed, planned, repeated
    //, dragHandlers, dropHandlers, duplicateDragHandlers
    // isEditing, textEditHandlers, toggleEdit
    // inputRef, name, color
    // deleteTask
    // completeTask
    // plan, moveOutOfWeek, moveToWeek
    // toggleRepeatTask, 


    let class_str = 'task'
    // Completion has precedence over planned
    if (completed) { class_str = 'taskCompleted' }
    else if (planned) { class_str = 'taskPlanned' }
    else if (repeated) { class_str = 'taskRepeated' }


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
        <span className="taskText">
            {isEditing ?
                <input type='text'
                    value={name}
                    width="430px"
                    {...textEditHandlers}
                    ref={inputRef}
                /> :
                //  <span style={{color : color}}>{name}</span>
                <span style={{ color: color }}>{name}</span>

            }
        </span>
        <>
            {deleteTask && (<button className='taskDelete' onClick={deleteTask && deleteTask}>Delete</button>)}
            {!completed && completeTask && (<button className='taskComplete' onClick={completeTask}>Complete</button>)}
            {completed && completeTask && (<button className='taskComplete' onClick={completeTask}>Decomplete</button>)}
            {plan && planned && (<button className='moveToWeek' onClick={moveOutOfWeek}> Unplan for this week </button>)}
            {plan && !planned && (<button className='moveToWeek' onClick={moveToWeek}> Plan for this week </button>)}
            {toggleRepeatTask && repeated && (<button className='makeRepeated' onClick={toggleRepeatTask}> Repeated </button>)}
            {toggleRepeatTask && !repeated && (<button className='makeRepeated' onClick={toggleRepeatTask}> Not repeated </button>)}

            <span className='buttonDuplicate' {...duplicateDragHandlers}>+ Duplicate +</span>
        </>
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