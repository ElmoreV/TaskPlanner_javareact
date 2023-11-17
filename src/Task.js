import {useState} from 'react';

const Task = (props) => {
    const {taskName,setTaskName,deleteTask,completed,completeTask} = props;
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
    let class_str = 'task'
    if (completed)
    {class_str = 'taskCompleted'}
    return ( <div className={class_str} 
    onDoubleClick={toggleEdit}>
        {isEditing?
        <input type='text' 
            value ={taskName}
            onChange={handleChange}
            onBlur={handleBlur}/>:
     <span>{taskName}</span>
     }
     <button className='taskDelete' onClick={deleteTask && deleteTask}>Delete</button>
     {!completed?
     <button className='taskComplete' onClick={completeTask && completeTask}>Complete</button>:
     <button className='taskComplete' onClick={completeTask && completeTask}>Decomplete</button>}
     </div>);
}
 
export default Task;