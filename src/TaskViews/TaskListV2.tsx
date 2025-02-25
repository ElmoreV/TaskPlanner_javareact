import { useState, useEffect } from 'react';
import React from 'react';
import { TagMap, TagTasksMap, Task, TaskMap } from '../Converters/V2_types';

const TaskListV2 = (props: TaskListPropsV2) => {
    const { tagMap, setTagMap,
        taskMap, setTaskMap,
        tagTaskMap, setTagTaskMap
    } = props;


    const showUntaggedTasks = () => {
        // 1. Find all tasks that are not tagged
        // 2. Find all of those that are 'root' tasks (no supertasks)
        // 2. Show them (and their subtasks)
        let taggedTaskIds = new Set<number>();

        for (const tagId in tagTaskMap) {
            const taskIds = tagTaskMap[tagId];
            taskIds.forEach(tid => taggedTaskIds.add(tid));
        }

        return (<div key="untagged-tasks">
            {Object.keys(taskMap)
                .filter(tid => !taggedTaskIds.has(Number(tid)))
                .filter(tid => taskMap[tid].parentTaskIds.length === 0)
                .map(taskId => (
                    recursiveShowTaskDAG(Number(taskId), undefined, undefined)
                ))
            }
        </div>
        )
    }

    const recursiveShowTaskDAG = (taskId: number, parentTaskId: number | undefined, parentTagId: number | undefined) => {
        return (
            <li key={"tk-" + (parentTagId) + "-" + (parentTaskId) + "-" + taskId}>
                Task: {taskId} : {taskMap[taskId].name}
            </li>
        )
    }

    const showTagDAG = () => {
        // 1. Find all root tags
        // 2. Show them (and their subtags)
        return Object.keys(tagMap)
            .filter(tagId => tagMap[tagId].parentTagIds.length === 0)
            .map(tagId => (
                recursiveShowTagDAG(Number(tagId))
            ))

    }

    const recursiveShowTagDAG = (tagId: number) => {
        return (
            <div key={"div-tg-" + tagId}>
                <li key={"tg-" + tagId}>
                    Tag: {tagId}:{tagMap[tagId].name}
                </li>
                <ul key={"tg-" + tagId + '-tags'}>
                    {tagMap[tagId].childTagIds.map((childTagId) => {
                        return recursiveShowTagDAG(childTagId)
                    })}
                </ul>
                <ul key={"tg-" + tagId + '-tasks'}>
                    {tagTaskMap[tagId].map(
                        (taskId) => recursiveShowTaskDAG(taskId, undefined, tagId)
                    )}
                </ul>
            </div>
        )
    }




    return (
        <div className='tag-task-dag' >
            <h1>Tag Task DAG </h1>
            <ul key='root-tags'>
                {showUntaggedTasks()}
                {showTagDAG()}
            </ul>
        </div>
    );
}

interface TaskListPropsV2 {
    tagMap: TagMap;
    setTagMap: (tagMap: TagMap) => void;
    taskMap: TaskMap;
    setTaskMap: (taskMap: TaskMap) => void;
    tagTaskMap: TagTasksMap;
    setTagTaskMap: (tagTaskMap: TagTasksMap) => void;
}

export { TaskListV2 };