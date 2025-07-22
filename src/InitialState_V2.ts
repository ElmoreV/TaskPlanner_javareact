// InitialState_V2.ts

import { TagMap, TagTasksMap, TaskMap } from "./Structure/V2_types.ts";
import { FinishedState } from "./Structure/TaskInterfaces.tsx";

const initialTags: TagMap = {
  1: {
    id: 1,
    name: "Maintenance",
    unfolded: false,
    childTagIds: [12, 11, 13], // order is important for render order
    parentTagIds: [], // order is not important
  },
  11: {
    id: 11,
    name: "Replace",
    unfolded: false,
    childTagIds: [],
    parentTagIds: [1],
  },
  12: {
    id: 12,
    name: "Repair",
    unfolded: false,
    childTagIds: [],
    parentTagIds: [1],
  },
  13: {
    id: 13,
    name: "Document",
    unfolded: true,
    childTagIds: [],
    parentTagIds: [1],
  },
  2: {
    id: 2,
    name: "Creativity",
    unfolded: false,
    childTagIds: [21],
    parentTagIds: [],
  },
  21: {
    id: 21,
    name: "Writing",
    unfolded: false,
    childTagIds: [],
    parentTagIds: [2],
  },
};

const initialTasks: TaskMap = {
  0: {
    id: 0,
    name: "Replace bicycle",
    finishStatus: FinishedState.Completed,
    scheduled: false,
    repeated: false,
    unfolded: true,
    childTaskIds: [],
    parentTaskIds: [1],
  },
  1: {
    id: 1,
    name: "Write Cover Letter",
    finishStatus: FinishedState.NotFinished,
    scheduled: false,
    repeated: false,
    unfolded: true,
    childTaskIds: [0], // Order is important for render order
    parentTaskIds: [2], // order is not important (yet)
  },
  2: {
    id: 2,
    name: "Check tax return",
    finishStatus: FinishedState.NotFinished,
    scheduled: true,
    repeated: false,
    unfolded: true,
    childTaskIds: [1],
    parentTaskIds: [],
  },
  5: {
    id: 5,
    name: "Create a NASS server",
    finishStatus: FinishedState.NotFinished,
    scheduled: false,
    repeated: false,
    unfolded: true,
    childTaskIds: [2],
    parentTaskIds: [],
  },
};

// tagTasks[tag_id] = [task_id1, task_id2, task_id3]
// order is important!
const initialTagTasks: TagTasksMap = {
  1: [5, 2],
  2: [],
  11: [],
  12: [0],
  13: [1],
  21: [1],
};

const initialPlannedTaskIdList: number[] = [5, 2];

export { initialTags, initialTasks, initialTagTasks, initialPlannedTaskIdList };
