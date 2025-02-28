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
import { setTaskFinishStatusV1Semipure } from '../Tasks/TaskModifyFuncGensV1Pure.ts'
import { FinishedState } from '../Tasks/TaskInterfaces.tsx'


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
            setTasks(oldTasks => fn(oldTasks, ...args))
        },
        [fn, setTasks])
}



export default memo(function TaskContainer(props) {
    const { task, topic, superTask, tasks, setTasks, topics, selectedTasks, setSelectedTasks, fancy, } = props;

    const findTopicViewIdx = (topicId, task) => {
        return task.topicViewIndices[task.topics.findIndex(taskTopicId => taskTopicId == topicId)]
    }


    // const setTaskFinishStatusCallback = useCallback(
    //     (taskId: number, status: FinishedState) => {
    //         setTasks(oldTasks => setTaskFinishStatusV1Semipure(oldTasks, taskId, status))
    //     },
    //     [setTasks, setTaskFinishStatusV1Semipure]
    // )
    const setTaskFinishStatusCallback = useCallbackify(setTaskFinishStatusV1Semipure, setTasks)
    const setTaskNameCallback = useCallbackify(setTaskFinishStatusV1Semipure, setTasks)





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
        setTaskName={getSetTaskNameFuncV1(setTasks, tasks, task.id)}
        deleteTask={getDeleteTask(setTasks, tasks, task.id)}
        addSubTask={getAddNewSubTask(setTasks, tasks, task.id)}
        hasSubTasks={task.subTaskIds && task.subTaskIds.length > 0}
        completeTask={getCompleteTaskV1(setTasks, tasks, task.id)}
        plan={getPlanTaskForWeekV1(setTasks, tasks, task.id)}
        unplan={getUnplanTaskV1(setTasks, tasks, task.id)}
        toggleRepeatTask={getToggleRepeatTaskV1(setTasks, tasks, task.id)}
        addToSelection={() => addTaskToSelection(selectedTasks, setSelectedTasks, task.id, topic && topic.id, topic && findTopicViewIdx(topic.id, task), superTask && superTask.id)}
        deleteFromSelection={() => deleteTaskFromSelection(selectedTasks, setSelectedTasks, task.id, topic && topic.id, superTask && superTask.id)}
        selected={selectedTasks.find((st) => (st.taskId == task.id && (!topic || st.topicId == topic.id) && (!superTask || st.superTaskId == superTask.id))) ? true : false}
        selectedTasks={selectedTasks}
        moveTasks={getMoveTasks(topics, tasks, setTasks)}
        duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
        fancy={fancy}
        toggleFold={getToggleFoldTaskV1(setTasks, tasks)}
        setTasks={setTasks}
        tasks={tasks}
        unfolded={task.unfolded}
        setDueTime={getSetTaskDueTimeV1(setTasks, tasks, task.id)}
        currentDueTime={task.dueTime}
    />)
})
