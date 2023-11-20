import {useState} from 'react';

const Topic = (props) => {
    const {title,updateTaskTopics,setTopicName,id,toggleFold,unfold,addTask} = props;
 
    const folded_symbol = '>';
    const unfolded_symbol = 'v';

    const [isEditing,setIsEditing] = useState(false);

    const handleChange=(e)=>{
        // If the value of the topic title is update:
        // update all tasks to be a member of the new topic name
        // update the topic name
        console.log(e.target.value);
        updateTaskTopics(e.target.value);
        setTopicName(e.target.value);
        
    }

    const toggleEdit=()=>{
        setIsEditing(true);

    }
    const handleToggleFold = () =>
    {
        if (!isEditing){
            toggleFold(id);
        }
    };
    const handleBlur = () => {
        setIsEditing(false);
    }
    // const fn = 
/*onClick={()=>(toggleCollapse(id))}*/
    // If isEditing: disallow the onclick
    // 


    return ( <div className='topic' onClick={handleToggleFold} >
        {unfold?unfolded_symbol:folded_symbol}
        {isEditing?
        (<input type='text' 
            value ={title}
            onChange={handleChange}
            onBlur={handleBlur}/>):
     (<span onDoubleClick={toggleEdit}>{title}</span>)
     }
        
        <button className='topicAddTask'
        onClick={(e)=>(e.stopPropagation(),addTask())}>Add task</button>
         </div>);
}

export default Topic;