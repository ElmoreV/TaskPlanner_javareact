import { memo, useCallback } from 'react'
import {
    getDeleteTask,
    getAddNewSubTask,
    getDuplicateTask,
    getMoveTasks,
} from '../ADG/ModifyFuncGeneratorsV1.ts'
import {
    getCompleteTaskV1,
    getToggleRepeatTaskV1,
    getPlanTaskForWeekV1,
    getSetTaskNameFuncV1,
    getSetTaskFinishStatusV1,
    getUnplanTaskV1,
    getToggleFoldTaskV1,
    getSetTaskDueTimeV1,
} from '../Tasks/TaskModifyFuncGensV1.ts'
import Task from './Task.tsx'
import {
    scheduleTaskV1Semipure,
    setTaskFinishStatusV1Semipure, toggleFoldTaskV1Semipure,
    toggleRepeatTaskV1Semipure,
    planTaskForWeekV1Semipure,
    unplanTaskV1Semipure,
    setTaskNameV1Semipure,
    setTaskDueTimeV1Semipure,
    completeTaskV1Semipure,
} from '../Tasks/TaskModifyFuncGensV1Pure.ts'
import { FinishedState } from '../Tasks/TaskInterfaces.tsx'
import { V1_Task } from '../Converters/V1_types.ts'


class SelectedCategoryTask {
    constructor(taskId, topicId, topicViewIndex, superTaskId) {
        this.taskId = taskId
        this.topicId = topicId
        this.topicViewIndex = topicViewIndex
        this.superTaskId = superTaskId
    }
}


const addTaskToSelection = (selectedTasks, setSelectedTasks, taskId, topicId, topicViewIndex, superTaskId) => {
    let newSelectedTasks = [...selectedTasks]
    newSelectedTasks.push(new SelectedCategoryTask(taskId, topicId, topicViewIndex, superTaskId))
    setSelectedTasks(newSelectedTasks)
}
const deleteTaskFromSelection = (selectedTasks, setSelectedTasks, taskId, topicId, superTaskId) => {
    let newSelectedTasks = [...selectedTasks]
    newSelectedTasks = newSelectedTasks.filter((selTask) => !(selTask.taskId == taskId && selTask.topicId == topicId && selTask.superTaskId == superTaskId))
    setSelectedTasks(newSelectedTasks)
}

const useCallbackify = (fn, setTasks) => {
    return useCallback(
        (...args) => {
            return setTasks(oldTasks => fn(oldTasks, ...args))
        },
        [fn, setTasks])
}

// const useCallbackify = (fn, setTasks) => {
//     return (...args) => { return setTasks(oldTasks => fn(oldTasks, ...args)) }
// }



export default function TaskContainer(props) {
    const { task, topic, superTask, setTasks, topics, selectedTasks, setSelectedTasks, fancy, } = props;

    const findTopicViewIdx = (topicId: number, task: V1_Task) => {
        return task.topicViewIndices[task.topics.findIndex(taskTopicId => taskTopicId == topicId)]
    }

    const scheduleTaskCallback = useCallbackify(scheduleTaskV1Semipure, setTasks)
    const toggleFoldTaskCallback = useCallbackify(toggleFoldTaskV1Semipure, setTasks)
    const toggleRepeatTaskCallback = useCallbackify(toggleRepeatTaskV1Semipure, setTasks)
    const completeTaskCallback = useCallbackify(completeTaskV1Semipure, setTasks)
    const setTaskFinishStatusCallback = useCallbackify(setTaskFinishStatusV1Semipure, setTasks)
    const planTaskCallback = useCallbackify(planTaskForWeekV1Semipure, setTasks)
    const unplanTaskCallback = useCallbackify(unplanTaskV1Semipure, setTasks)
    const setTaskNameCallback = useCallbackify(setTaskNameV1Semipure, setTasks)
    const setTaskDueTimeCallback = useCallbackify(setTaskDueTimeV1Semipure, setTasks)

    return (<Task name={task.name}
        id={task.id}
        completed={task.completed}
        taskFinishStatus={task.finishStatus}
        planned={task.thisWeek}
        repeated={task.repeated}
        taskTopics={task.topics}
        taskLastCompletion={task.lastFinished}
        setTaskFinishStatus={setTaskFinishStatusCallback}
        currentTopicViewIndex={topic && findTopicViewIdx(topic.id, task)}
        currentTopicName={topic && topic.name}
        currentTopicId={topic && topic.id}
        currentSuperTaskId={superTask && superTask.id}
        setTaskName={setTaskNameCallback}
        // deleteTask={getDeleteTask(setTasks, tasks, task.id)}
        // addSubTask={getAddNewSubTask(setTasks, tasks, task.id)}
        hasSubTasks={task.subTaskIds && task.subTaskIds.length > 0}
        completeTask={completeTaskCallback}
        plan={planTaskCallback}
        unplan={unplanTaskCallback}
        toggleRepeatTask={toggleRepeatTaskCallback}
        // addToSelection={() => addTaskToSelection(selectedTasks, setSelectedTasks, task.id, topic && topic.id, topic && findTopicViewIdx(topic.id, task), superTask && superTask.id)}
        // deleteFromSelection={() => deleteTaskFromSelection(selectedTasks, setSelectedTasks, task.id, topic && topic.id, superTask && superTask.id)}
        // selected={selectedTasks.find((st) => (st.taskId == task.id && (!topic || st.topicId == topic.id) && (!superTask || st.superTaskId == superTask.id))) ? true : false}
        // selectedTasks={selectedTasks}
        // moveTasks={getMoveTasks(topics, tasks, setTasks)}
        // duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
        fancy={fancy}
        toggleFold={toggleFoldTaskCallback}
        setTasks={setTasks}
        // tasks={tasks}
        unfolded={task.unfolded}
        setDueTime={setTaskDueTimeCallback}
        currentDueTime={task.dueTime}
    />)
}