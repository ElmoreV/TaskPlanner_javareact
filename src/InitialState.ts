import { FinishedState } from "./Tasks/TaskInterfaces.tsx";

const initialTopics = [
    {
        name: "Maintenance", id: 1, unfolded: false, subtopics: [
            { name: "Replace", id: 11, unfolded: false, subtopics: [] },
            { name: "Repair", id: 12, unfolded: false, subtopics: [] },
            { name: "Document", id: 13, unfolded: true, subtopics: [] }

        ]
    },
    {
        name: "Creativity", id: 2, unfolded: false, subtopics: [
            { name: "Writing", id: 21, unfolded: false, subtopics: [] }
        ]
    }

]

const initialTasks = [
    {
        name: "Repair bicycle", id: 0, topics: [12], topicViewIndices: [1], completed: true,
        finishStatus: FinishedState.Completed,
        thisWeek: false, repeated: false, scheduled: false, weekOrderIndex: 1,
        subTaskIds: [], unfolded: true
    },
    {
        name: "Write Cover Letter", id: 1, topics: [21, 13], topicViewIndices: [1, 1], completed: false,
        finishStatus: FinishedState.NotFinished,
        thisWeek: false, repeated: false, scheduled: false, weekOrderIndex: 0,
        subTaskIds: [0], unfolded: true
    },
    {
        name: "Check tax return", id: 2, topics: [1], topicViewIndices: [3], completed: false,
        finishStatus: FinishedState.NotFinished,
        thisWeek: true, repeated: false, scheduled: true, weekOrderIndex: 2,
        subTaskIds: [1], unfolded: true
    },
    {
        name: "Create a NASS server", id: 5, topics: [1], topicViewIndices: [2], completed: false,
        finishStatus: FinishedState.NotFinished,
        thisWeek: false, repeated: true, scheduled: false, weekOrderIndex: 0,
        subTaskIds: [2], unfolded: true
    },
]

export { initialTopics, initialTasks };