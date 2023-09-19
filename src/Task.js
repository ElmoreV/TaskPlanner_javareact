import {useState} from 'react';

const Task = (props) => {
    const {taskName,setTaskName,deleteTask} = props;
    const [isEditing,setIsEditing] = useState(false);
    const handleChange=(e)=>{
        console.log(e.target.value);
        setTaskName(e.target.value);
    }

    const toggleEdit=()=>{
        setIsEditing(true);

    }

    const handleBlur = () => {
        setIsEditing(false);
    }

    return ( <div className='task' 
    onDoubleClick={toggleEdit}>
        {isEditing?
        <input type='text' 
            value ={taskName}
            onChange={handleChange}
            onBlur={handleBlur}/>:
     <span>{taskName}</span>
     }
     <button className='taskDelete' onClick={deleteTask && deleteTask}>Delete</button>
     </div>);
}
 
export default Task;