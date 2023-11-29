import {useState} from 'react';
import PropTypes from 'prop-types';

const Task = (props) => {
    const {taskName,setTaskName,deleteTask,completed,completeTask,currentTopic} = props;
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

    const changeTopic = (oldTopic,newTopic)=>{
        //1. select this task
        //2. find old topic in topics
        //3. remove old topic in topics
        //4. add newTopic in topics
        //5. update tasks
        return;
    };

    const handleDrag = ()=>{
        setIsDragging(true)
        setColor('blue')
    }
    const handleDrag2 = ()=>{
        setIsDragging(false)
        setColor('green')
    }

    const handleDrop = (e)=>{
        console.log(e.target);
        e.target.setAttribute('draggedOver',false)
        console.log('drop')
        //here I need to figure out how to shuffle around the lists
        // everything I need to do:
        // remove from the Task: the topic out of which I am dragging it
        // add to the Task: the topic in which I have dropped it.
        setColor('yellow')
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
//        console.log(e.target);
  //      console.log('drop2')
        setColor('gray');        
    }

    const handleBlur = () => {
        setIsDraggingAllowed(true);
        setIsEditing(false);

    }
    let class_str = 'task'
    if (completed)
    {class_str = 'taskCompleted'}

    const dragHandlers = isDraggingAllowed?{draggable:true,onDragStart:handleDrag,onDragEnd:handleDrag2}:{};
    const dropHandlers = isDragging?{}:{onDrop:handleDrop,onDragOver:handleDragOver, onDragLeave:handleDragLeave};

    return ( <div className={class_str} 
    onDoubleClick={toggleEdit} 
    {...dragHandlers}
 //   draggable onDragStart={handleDrag} onDragEnd={handleDrag2} 
    {...dropHandlers}>
        {isEditing?
        <input type='text' 
            value ={taskName}
            onChange={handleChange}
            onBlur={handleBlur}/>:
     <span style={{color : color}}>{taskName}{currentTopic}</span>
     }
     <button className='taskDelete' onClick={deleteTask && deleteTask}>Delete</button>
     {!completed?
     <button className='taskComplete' onClick={completeTask && completeTask}>Complete</button>:
     <button className='taskComplete' onClick={completeTask && completeTask}>Decomplete</button>}
     </div>);
}

Task.propTypes = {
    taskName: PropTypes.string.isRequired,
    setTaskName: PropTypes.func.isRequired,
    deleteTask: PropTypes.func.isRequired,
    completed: PropTypes.bool.isRequired,
    completeTask: PropTypes.func.isRequired
};


export default Task;