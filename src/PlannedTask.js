import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTopicTreeById } from './TopicHelper';
import TaskContent from './TaskContent'
const PlannedTask = (props) => {
    const { taskKey, taskName, setTaskName, deleteTask,
        completed, completeTask,
        scheduled, scheduleTask,
        currentTopic, changeTopic, planned, unplan, topics, taskTopics,
        selectedTasks, addToSelection, deleteFromSelection, selected, clearSelection,
        changeWeekOrderIndex, currentWeekOrderIndex,
        fancy,
    } = props;

    console.debug("Rendering PlannedTask")
    const [isEditing, setIsEditing] = useState(false);
    const [color, setColor] = useState('green');
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingAllowed, setIsDraggingAllowed] = useState(true);



    const handleChange = (e) => {
        console.info(e.target.value);
        if (setTaskName) { setTaskName(e.target.value); }
    }

    const toggleEdit = () => {
        setIsEditing(true);
        // TODO: Should actually clear the entire selection maybe?
        clearSelection()
        setIsDraggingAllowed(false);
        // TODO: set focus on text edit box

    }

    const handleDragStart = (e) => {
        setIsDragging(true)
        e.dataTransfer.setData('taskId', taskKey)
        e.dataTransfer.setData('sourceWeekOrderIndex', currentWeekOrderIndex)
        setColor('blue')
    }
    const handleDragEnd = () => {
        setIsDragging(false)
        setColor('green')
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.target.setAttribute('draggedOver', false)
        console.info('drop')
        setColor('maroon')
        var sourceTaskIds = []
        var sourceWeekOrderIndidces = []

        var sourceTaskId = Number(e.dataTransfer.getData("taskId"))
        var sourceWeekOrderIndex = Number(e.dataTransfer.getData("sourceWeekOrderIndex"))
        console.log(`Dropping from task with id=${sourceTaskId} with weekIndex=${sourceWeekOrderIndex} on task with id=${taskKey} with weekIndex=${currentWeekOrderIndex}`)
        sourceTaskIds.push(sourceTaskId)
        sourceWeekOrderIndidces.push(sourceWeekOrderIndex)
        if (selectedTasks && selectedTasks.length > 0) {
            selectedTasks.forEach((st) => {
                console.info(`Changing weekOrderIdx of task with id ${st.taskId} from wOrderIdx ${st.weekOrderIndex} to wOrderIdx ${currentWeekOrderIndex}`)
                sourceTaskIds.push(st.taskId)
                sourceWeekOrderIndidces.push(st.weekOrderIndex)
            })
        }
        if (changeWeekOrderIndex) {
            changeWeekOrderIndex(sourceTaskIds,
                sourceWeekOrderIndidces,
                currentWeekOrderIndex)
        }
        clearSelection()
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

    const moveToWeek = () => {
        if (unplan) { unplan() }
    }

    const handleBlur = () => {
        setIsDraggingAllowed(true);
        setIsEditing(false);

    }

    const captureClick = (func) => {
        const wrapper = (e) => {
            e.stopPropagation()
            return func()
        }
        return wrapper
    }

    let class_str = 'task'
    // Completion has precedence over planned
    if (completed) { class_str = 'taskCompleted' }
    else if (scheduled) { class_str = 'taskPlanned' }
    let selectStyle = {}
    if (selected) {
        selectStyle = {
            borderStyle: "dashed",
            borderWidth: "2px",
            margin: "0px"
        }
    }
    const dragHandlers = isDraggingAllowed ? { draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd } : {};
    const dropHandlers = isDragging ? {} : { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave };

    const selectHandlers = selected ? { onClick: captureClick(deleteFromSelection) } : { onClick: captureClick(addToSelection) }
    const textEditHandlers = {
        onChange: handleChange, onBlur: handleBlur, onClick: captureClick(() => { })
    }

    let topicPath = getTopicTreeById(topics, taskTopics[0])


    const inputRef = useRef(null);
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]); // Dependency array ensures this runs only when isEditing changes


    return (<>
        <TaskContent classStr={class_str}
            selectStyle={selectStyle}
            selectHandlers={selectHandlers}
            dragHandlers={dragHandlers}
            dropHandlers={dropHandlers}
            name={taskName}
            textEditHandlers={textEditHandlers}
            inputRef={inputRef}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            topicPath={topicPath}
            color={color}
            deleteTask={deleteTask}
            completed={completed}
            completeTask={completeTask}
            planned={true}
            unplan={unplan}
            scheduled={scheduled}
            scheduleTask={scheduleTask}
            textBarWidth="570px"
            fancy={fancy}
        />

    </>)

}

PlannedTask.propTypes = {
    taskName: PropTypes.string.isRequired,
    setTaskName: PropTypes.func,
    deleteTask: PropTypes.func,
    completed: PropTypes.bool.isRequired,
    completeTask: PropTypes.func
};


export default PlannedTask;