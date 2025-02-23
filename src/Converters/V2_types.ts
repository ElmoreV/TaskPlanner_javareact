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
    completed: boolean;
    scheduled: boolean;
    repeated: boolean;
    unfolded: boolean;
    childTaskIds: number[];
    parentTaskIds: number[];
}


type TagTasks = {
    [tagId: number]: number[]; // array of task IDs
};

type TagMap = {
    [tagId: number]: Tag;
};
type TaskMap = {
    [taskId: number]: Task;
}


export { Tag, Task, TagTasks, TagMap, TaskMap };