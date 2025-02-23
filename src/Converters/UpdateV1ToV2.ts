
// Type definitions for Tags and Tasks

import { FinishedState } from "../Tasks/TaskInterfaces";
import { V1_Task, V1_Topic } from "./V1_types";
import { TaskMap, TagMap, TagTasks, Task, Tag } from "./V2_types";

const convert_v1_to_v2 = (
    tasks: V1_Task[],
    topics: V1_Topic[]
) => {
    // Flatten the topics into a list of Tags
    let new_tag_map: TagMap = {}



    // Collects all flattened tasks,
    // this one is a doozy to convert.
    let new_task_map: TaskMap = {}
    tasks.forEach((task) => {
        new_task_map[task.id] = {
            id: task.id,
            name: task.name,
            finishStatus: task.finishStatus,
            completed: task.completed,
            scheduled: task.scheduled,
            repeated: task.repeated,
            unfolded: task.unfolded,
            childTaskIds: [...task.subTaskIds],
            parentTaskIds: []
        }
    })
    tasks.forEach((task) => {
        task.subTaskIds.forEach((subTaskId) => {
            new_task_map[subTaskId].parentTaskIds.push(task.id)
        })
    }

    )

    // Collects all topics/tags in the Task
    // data and create a map with Task ordering
    // as given in topicViewIndices.
    let new_tagTask_map: TagTasks = {}

    // Collect all tasks in thisWeek=True
    // and order them according to weekOrderIndex
    // How to handle collisions?
    let new_week_task_id_list: number[] = []
    return (new_task_map, new_tag_map,
        new_tagTask_map, new_week_task_id_list)
}