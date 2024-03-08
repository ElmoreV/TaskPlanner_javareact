import { useState } from 'react';
import PropTypes from 'prop-types';

const Topic = (props) => {
    const { title, updateTaskTopics, setTopicName, id, toggleFold, unfolded, addTask, addSubTopic, deleteTopic, changeTopic } = props;

    const folded_symbol = '>';
    const unfolded_symbol = 'v';

    const [isEditing, setIsEditing] = useState(false);
    const [color, setColor] = useState('green');

    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingAllowed, setIsDraggingAllowed] = useState(true);

    // Dragging
    // yellow = dropped onto
    // red = dragged over
    // gray = dragged over but left

    const handleChange = (e) => {
        // If the value of the topic title is update:
        // update all tasks to be a member of the new topic name
        // update the topic name
        console.info(e.target.value);
        updateTaskTopics(e.target.value);
        setTopicName(e.target.value);

    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.target.setAttribute('draggedOver', false)
        console.info('drop')
        setColor('yellow')
        console.debug(e.target)
        var key = e.dataTransfer.getData("Text")
        var oldTopic = e.dataTransfer.getData("Text2")
        console.debug(key)
        console.debug(oldTopic) // title???
        console.debug(title)
        if (changeTopic) {
            changeTopic(key, oldTopic, title)
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

    const toggleEdit = () => {
        setIsEditing(true);

    }
    const handleToggleFold = () => {
        if (!isEditing) {
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

    const handleDeleteClick = (e) => {
        console.info('clock')
        e.stopPropagation();
        deleteTopic();
    };
    // const fn = 
    /*onClick={()=>(toggleCollapse(id))}*/
    // If isEditing: disallow the onclick
    // 
    const dropHandlers = isDragging ? {} : { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave };


    return (<div
        className='topic'
        onClick={handleToggleFold}
        {...dropHandlers}
    >
        {unfolded ? unfolded_symbol : folded_symbol}
        {isEditing ?
            (<input type='text'
                value={title}
                onChange={handleChange}
                onBlur={handleBlur} />) :
            (<span style={{ color: color }} onDoubleClick={toggleEdit}>{title}</span>)
        }
        <button className='topicAddTask'
            onClick={handleAddTaskClick}>Add task</button>
        <button className='topicAddTopic'
            onClick={handleAddTopicClick}>Add topic</button>
        <button className='topicDelete'
            onClick={handleDeleteClick}>Delete</button>

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