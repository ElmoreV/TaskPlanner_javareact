import { FinishedState } from "./TaskInterfaces";

// And the other data structures to hold them.
interface Tag {
  id: number;
  name: string;
  unfolded: boolean;
  childTagIds: number[]; // ordering is visual ordering
  parentTagIds: number[]; // derived from childTagIds
}

interface Task {
  id: number;
  name: string;
  finishStatus: FinishedState;
  scheduled: boolean;
  repeated: boolean;
  unfolded: boolean;
  childTaskIds: number[]; // ordering is visual ordering
  parentTaskIds: number[]; //derived from childTaskIds

  dueTime: Date | undefined;
  transitiveDueTime: Date | undefined;
  lastFinished: Date | undefined;
}

type TagTasksMap = {
  [tagId: number]: number[]; // array of task IDs
};

// Also the inverse of TagTasksMap, this should be derived from TagTasksMap
type TaskTagsMap = {
  [taskId: number]: number[]; // array of tag IDs
};

type TagMap = {
  [tagId: number]: Tag;
};
type TaskMap = {
  [taskId: number]: Task;
};

// V2_1 extensions
// type RootTagIds = number[];
// type RootTaskIds = number[];

export { Tag, Task, TagTasksMap, TagMap, TaskMap, TaskTagsMap };
