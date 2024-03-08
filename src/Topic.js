import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const Topic = (props) => {
    const { title, updateTaskTopics, setTopicName, id, toggleFold, unfolded, addTask, addSubTopic, deleteTopic, changeTopic, moveTopic } = props;

    const folded_symbol = '>';
    const unfolded_symbol = 'v';

    const [isEditing, setIsEditing] = useState(false);
    const [color, setColor] = useState('purple');

    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingAllowed, setIsDraggingAllowed] = useState(true);

    // Dragging
    // purple = initial state
    // blue = being dragged
    // green = stopped being dragged
    // yellow = dropped onto
    // red = dragged over
    // gray = dragged over but left

    const handleDragStart = (e) => {
        setIsDragging(true)
        e.dataTransfer.setData('Type', "Topic")
        e.dataTransfer.setData("id", id)
        // e.dataTransfer.setData('Text', taskKey)
        // e.dataTransfer.setData('Text2', currentTopic) //also name
        setColor('blue')
    }
    const handleDragEnd = () => {
        setIsDragging(false)
        setColor('green')
    }

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
        var type = e.dataTransfer.getData("Type")
        if (type == "Task") {
            var key = e.dataTransfer.getData("Text")
            var oldTopic = e.dataTransfer.getData("Text2")
            console.debug(key)

            console.debug(oldTopic) // title???
            console.debug(title)
            if (changeTopic) {
                changeTopic(key, oldTopic, title)
            }
        } else if (type == "Topic") {
            let source_id = Number(e.dataTransfer.getData("id"))
            console.info(`Dropped topic with id ${source_id} on this topic with id ${id}`)
            moveTopic(source_id, id)
        } else {
            console.info("On a topic, you can only drop another topic or a task (not something else)")
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


    const handleToggleFold = () => {
        if (!isEditing) {
            toggleFold(id);
        }
    };

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
    const dragHandlers = isDraggingAllowed ? { draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd } : {};

    const dropHandlers = isDragging ? {} : { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave };

    const handleKeyDown = (event) => {
        // Check if the Enter key was pressed
        if (event.key === 'Enter') {
            // Call handleBlur or directly implement logic to finish editing
            handleBlur();
            // Prevents the form from being submitted if your input is part of one
            event.preventDefault();
        }
    };
    const toggleEdit = () => {
        setIsDraggingAllowed(false);
        setIsEditing(true);

    }
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



    return (<div
        className='topic'
        onClick={handleToggleFold}
        {...dragHandlers}
        {...dropHandlers}
    >
        {unfolded ? unfolded_symbol : folded_symbol}
        {isEditing ?
            (<input type='text'
                value={title}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                ref={inputRef}
            />) :
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