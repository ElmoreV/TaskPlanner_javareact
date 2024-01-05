import {useState} from 'react';
import PropTypes from 'prop-types';

const Topic = (props) => {
    const {title,updateTaskTopics,setTopicName,id,toggleFold,unfolded,addTask,addSubTopic} = props;

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
    const handleAddTaskClick = (e) => {
        e.stopPropagation();
        addTask();
    };
    const handleAddTopicClick = (e) => {
        e.stopPropagation();
        addSubTopic();
    };
    // const fn = 
/*onClick={()=>(toggleCollapse(id))}*/
    // If isEditing: disallow the onclick
    // 


    return (<div className='topic' onClick={handleToggleFold} >
            {unfolded?unfolded_symbol:folded_symbol}
            {isEditing?
                (<input type='text' 
                value ={title}
                onChange={handleChange}
                onBlur={handleBlur}/>):
                (<span onDoubleClick={toggleEdit}>{title}</span>)
            }
            <button className='topicAddTask'
                onClick={handleAddTaskClick}>Add task</button>
            <button className='topicAddTopic'
                onClick={handleAddTopicClick}>Add topic</button>
         </div>);
}

Topic.propTypes = {
    title: PropTypes.string.isRequired,
    setTopicName: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    toggleFold: PropTypes.func.isRequired,
    unfolded: PropTypes.bool.isRequired,
    addTask: PropTypes.func.isRequired
};

export default Topic;