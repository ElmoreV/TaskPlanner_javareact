import { FinishedState } from "../Tasks/TaskInterfaces";

// And the other data structures to hold them.
interface Tag {
    id: number;
    name: string;
    unfolded: boolean;
    childTagIds: number[];
    parentTagIds: number[];
}

interface Task {
    id: number;
    name: string;
    finishStatus: FinishedState;
    scheduled: boolean;
    repeated: boolean;
    unfolded: boolean;
    childTaskIds: number[];
    parentTaskIds: number[];

    dueTime: Date | undefined;
    transitiveDueTime: Date | undefined;
    lastFinished: Date | undefined;
}


type TagTasksMap = {
    [tagId: number]: number[]; // array of task IDs
};

// Also the inverse of TagTasksMap
type TaskTagsMap = {
    [taskId: number]: number[]; // array of tag IDs
}

type TagMap = {
    [tagId: number]: Tag;
};
type TaskMap = {
    [taskId: number]: Task;
}


export { Tag, Task, TagTasksMap, TagMap, TaskMap, TaskTagsMap };