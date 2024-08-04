import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import TopicContent from './TopicContent';
const Topic = (props) => {
    const { name, updateTaskTopics, setTopicName, id,
        toggleFold, unfolded, foldAll, unfoldAll,
        addTask, addSubTopic, deleteTopic, moveTasks,
        selectedTasks,
        moveTopic, duplicateTask,
        fancy,
    } = props;
    console.debug("Rendering Topic")
    const folded_symbol = '>';
    const unfolded_symbol = 'v';

    const [isEditing, setIsEditing] = useState(false);

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
        // e.dataTransfer.setData('TopicName', currentTopic) //also name
    }
    const handleDragEnd = () => {
        setIsDragging(false)
    }

    const handleChange = (e) => {
        // If the value of the topic name is update:
        // update all tasks to be a member of the new topic name
        // update the topic name
        console.info(e.target.value);
        // updateTaskTopics(e.target.value);
        setTopicName(e.target.value);

    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.target.setAttribute('draggedOver', false)
        console.info('Drop on Topic')
        console.debug(e.target)
        var type = e.dataTransfer.getData("Type")
        console.info(type)
        if (type == "Task") {
            var task_id = Number(e.dataTransfer.getData("TaskId"))
            var oldTopicName = e.dataTransfer.getData("TopicName")
            var oldTopicId = Number(e.dataTransfer.getData("TopicId"))
            var oldSuperTaskId = Number(e.dataTransfer.getData("SuperTaskId"))

            console.debug(task_id)

            console.debug(oldTopicName) // name???
            console.debug(name)
            console.info(`Dropped task with id ${task_id} with old topic id ${oldTopicId} on topic with id ${id}`)


            let taskIds = []
            let oldTopicIds = []
            let oldSuperTaskIds = []

            taskIds.push(task_id)
            oldTopicIds.push(oldTopicId)
            oldSuperTaskIds.push(oldSuperTaskId)

            console.log(selectedTasks)
            if (selectedTasks && selectedTasks.length > 0) {
                selectedTasks.forEach((st) => {
                    console.info(`Changing topic of task with id ${st.taskId} from topic with id ${st.topicId} to topic with id ${id}`)
                    taskIds.push(st.taskId)
                    oldTopicIds.push(st.topicId)
                    oldSuperTaskIds.push(st.superTaskId)

                })
            }
            if (moveTasks) {
                // Always move the tasks to the top (index = 1)
                moveTasks(taskIds, oldTopicIds, oldSuperTaskIds, id, 1, null)
            }

        } else if (type == "Topic") {
            let source_id = Number(e.dataTransfer.getData("id"))
            console.info(`Dropped topic with id ${source_id} on this topic with id ${id}`)
            moveTopic(source_id, id)
        } else if (type == "TaskDuplicate") {
            var task_id = Number(e.dataTransfer.getData("TaskId"))
            console.info(`Duplicate dropped task with id ${task_id} on this topic with id ${id}`)
            let taskIds = []
            taskIds.push(task_id)
            if (selectedTasks && selectedTasks.length > 0) {
                selectedTasks.forEach((st) => {
                    console.info(`Duplicating task with id ${st.taskId} to topic with id ${id}`)
                    taskIds.push(st.taskId)
                })
            }

            duplicateTask(taskIds, id)
        } else {
            console.info("On a topic, you can only drop another topic or a task (not something else)")

        }
    }
    const handleDragOver = (e) => {
        e.preventDefault();

        // this is not perfect, because I always want the <div class='task'> to be the target..
        e.target.setAttribute('draggedOver', true);
    }
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.target.setAttribute('draggedOver', false);
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

    const handleFoldDoubleClick = (event) => {
        event.stopPropagation();
        console.log("Inside handle fold double click")
        if (unfolded) {
            foldAll(id)
        } else {
            unfoldAll(id)
        }

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


    return (<><TopicContent
        name={name}
        handleToggleFold={handleToggleFold}
        dragHandlers={dragHandlers}
        dropHandlers={dropHandlers}
        textEditHandlers={{ onChange: handleChange, onBlur: handleBlur, onKeyDown: handleKeyDown }}
        foldingSymbol={unfolded ? unfolded_symbol : folded_symbol}
        isEditing={isEditing}
        inputRef={inputRef}
        toggleEdit={toggleEdit}
        handleAddTaskClick={handleAddTaskClick}
        handleAddTopicClick={handleAddTopicClick}
        handleDeleteClick={handleDeleteClick}
        handleFoldDoubleClick={handleFoldDoubleClick}
        fancy={fancy}
    /></>)
}

Topic.propTypes = {
    name: PropTypes.string.isRequired,
    setTopicName: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    toggleFold: PropTypes.func.isRequired,
    unfolded: PropTypes.bool.isRequired,
    addTask: PropTypes.func.isRequired
};

export default Topic;