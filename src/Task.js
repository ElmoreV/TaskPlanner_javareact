import {useState} from 'react';
import PropTypes from 'prop-types';

const Task = (props) => {
    const {taskKey,taskName,setTaskName,deleteTask,completed,completeTask,currentTopic,changeTopic,planned,plan} = props;
    
    const [isEditing,setIsEditing] = useState(false);
    const [color,setColor] = useState('green');
    const [isDragging,setIsDragging] = useState(false);
    const [isDraggingAllowed,setIsDraggingAllowed]=useState(true);
    
    const handleChange=(e)=>{
        console.log(e.target.value);
        setTaskName(e.target.value);
    }

    const toggleEdit=()=>{
        setIsEditing(true);
        setIsDraggingAllowed(false);
        // TODO: set focus on text edit box

    }

    const handleDragStart = (e)=>{
        setIsDragging(true)
        e.dataTransfer.setData('Text',taskKey)
        e.dataTransfer.setData('Text2',currentTopic)
        setColor('blue')
    }
    const handleDragEnd = ()=>{
        setIsDragging(false)
        setColor('green')
    }

    const handleDrop = (e)=>{
        e.preventDefault()
        e.target.setAttribute('draggedOver',false)
        console.log('drop')
        setColor('yellow')
        var key = e.dataTransfer.getData("Text")
        var oldTopic = e.dataTransfer.getData("Text2")
        if (changeTopic){
        changeTopic(key,oldTopic,currentTopic)}
    }
    const handleDragOver = (e)=>{
        e.preventDefault();
        // this is not perfect, because I always want the <div class='task'> to be the target..
        e.target.setAttribute('draggedOver',true);
        setColor('red');
    }
    const handleDragLeave = (e)=>{
        e.preventDefault();
        e.target.setAttribute('draggedOver',false);
        setColor('gray');        
    }

    const moveToWeek = ()=>{
        plan()
    }

    const handleBlur = () => {
        setIsDraggingAllowed(true);
        setIsEditing(false);

    }
    let class_str = 'task'
    // Completion has precedence over planned
    if (completed)
    {class_str = 'taskCompleted'}
    else if (planned)
    {class_str = 'taskPlanned'}

    const dragHandlers = isDraggingAllowed?{draggable:true,onDragStart:handleDragStart,onDragEnd:handleDragEnd}:{};
    const dropHandlers = isDragging?{}:{onDrop:handleDrop,onDragOver:handleDragOver, onDragLeave:handleDragLeave};


    return ( <div className={class_str} 
    onDoubleClick={toggleEdit} 
    {...dragHandlers}
    {...dropHandlers}>
        {isEditing?
        <input type='text' 
            value ={taskName}
            onChange={handleChange}
            onBlur={handleBlur}/>:
    //  <span style={{color : color}}>{taskName}</span>
     <span style={{color : color}}>{taskName}</span>
     }
     {deleteTask && (<button className='taskDelete' onClick={deleteTask && deleteTask}>Delete</button>)}
    {!completed && completeTask && (<button className='taskComplete' onClick={completeTask}>Complete</button>)}
    {completed && completeTask && (<button className='taskComplete' onClick={completeTask}>Decomplete</button>)} 
     {plan && (<button className='moveToWeek' onClick={moveToWeek}> Plan for this week </button>)}
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