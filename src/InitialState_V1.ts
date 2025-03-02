import { FinishedState } from "./Tasks/TaskInterfaces.tsx";

const initialTopicsV1 = [
  {
    name: "Maintenance",
    id: 1,
    unfolded: false,
    subtopics: [
      { name: "Repair", id: 12, unfolded: false, subtopics: [] },
      { name: "Replace", id: 11, unfolded: false, subtopics: [] },
      { name: "Document", id: 13, unfolded: true, subtopics: [] },
    ],
  },
  {
    name: "Creativity",
    id: 2,
    unfolded: false,
    subtopics: [{ name: "Writing", id: 21, unfolded: false, subtopics: [] }],
  },
];

const initialTasksV1 = [
  {
    id: 0,
    name: "Repair bicycle",
    finishStatus: FinishedState.Completed,
    completed: true,
    scheduled: false,
    repeated: false,
    unfolded: true,
    subTaskIds: [],

    thisWeek: false,
    weekOrderIndex: 0,
    topics: [12],
    topicViewIndices: [1],
  },
  {
    id: 1,
    name: "Write Cover Letter",
    finishStatus: FinishedState.NotFinished,
    completed: false,
    scheduled: false,
    repeated: false,
    unfolded: true,
    subTaskIds: [0],

    thisWeek: false,
    weekOrderIndex: 0,
    topics: [21, 13],
    topicViewIndices: [1, 1],
  },
  {
    id: 2,
    name: "Check tax return",
    finishStatus: FinishedState.NotFinished,
    completed: false,
    scheduled: true,
    repeated: false,
    unfolded: true,
    subTaskIds: [1],

    thisWeek: true,
    weekOrderIndex: 2,
    topics: [1],
    topicViewIndices: [3],
  },
  {
    id: 5,
    name: "Create a NASS server",
    finishStatus: FinishedState.NotFinished,
    completed: false,
    scheduled: false,
    repeated: true,
    unfolded: true,
    subTaskIds: [2],

    thisWeek: true,
    weekOrderIndex: 1,
    topics: [1],
    topicViewIndices: [2],
  },
];

export { initialTopicsV1, initialTasksV1 };
