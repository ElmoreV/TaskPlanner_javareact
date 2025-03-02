import structuredClone from "@ungap/structured-clone";
import {
  insertTaskInstanceIntoTopic,
  removeTaskInstanceFromTopic,
  generateEmptyTask,
  deleteEntireTask,
} from "../ModifyTaskTopicAdgElements";

//1. Prepare a tasks/topics example
const tasks = [
  {
    name: "Fiets repareren",
    id: 0,
    topics: [12],
    topicViewIndices: [1],
    completed: true,
    thisWeek: false,
    repeated: false,
    scheduled: false,
    weekOrderIndex: 1,
  },
  {
    name: "Outer Wilds",
    id: 1,
    topics: [21, 1],
    topicViewIndices: [1, 1],
    completed: false,
    thisWeek: false,
    repeated: false,
    scheduled: false,
    weekOrderIndex: 0,
  },
  {
    name: "Badkamer",
    id: 2,
    topics: [1],
    topicViewIndices: [3],
    completed: false,
    thisWeek: true,
    repeated: false,
    scheduled: true,
    weekOrderIndex: 2,
  },
  {
    name: "Backup opruimen",
    id: 5,
    topics: [1],
    topicViewIndices: [2],
    completed: false,
    thisWeek: false,
    repeated: true,
    scheduled: false,
    weekOrderIndex: 0,
  },
];
console.log(`Node Version: ${process.version}`);
var newTasks = structuredClone(tasks);
const setTasks = (newTasksToSet) => {
  newTasks = newTasksToSet;
};

const topics = [
  {
    name: "Onderhoud",
    id: 1,
    unfolded: false,
    subtopics: [
      { name: "Vervangen", id: 11, unfolded: false, subtopics: [] },
      { name: "Repareren", id: 12, unfolded: false, subtopics: [] },
    ],
  },
  {
    name: "Ontspanning",
    id: 2,
    unfolded: false,
    subtopics: [{ name: "Gamen", id: 21, unfolded: false, subtopics: [] }],
  },
];
var newTopics = structuredClone(topics);
const setTopics = (newTopicsToSet) => {
  newTopics = newTopicsToSet;
};

it("generateTask_should_work", () => {
  //Arrange
  let freshTasks = structuredClone(tasks);
  let freshTopics = structuredClone(topics);
  newTasks = structuredClone(tasks);
  newTopics = structuredClone(topics);
  let expectedTasks = [
    {
      name: "Fiets repareren",
      id: 0,
      topics: [12],
      topicViewIndices: [1],
      completed: true,
      thisWeek: false,
      repeated: false,
      scheduled: false,
      weekOrderIndex: 1,
    },
    {
      name: "Outer Wilds",
      id: 1,
      topics: [21, 1],
      topicViewIndices: [1, 1],
      completed: false,
      thisWeek: false,
      repeated: false,
      scheduled: false,
      weekOrderIndex: 0,
    },
    {
      name: "Badkamer",
      id: 2,
      topics: [1],
      topicViewIndices: [3],
      completed: false,
      thisWeek: true,
      repeated: false,
      scheduled: true,
      weekOrderIndex: 2,
    },
    {
      name: "Backup opruimen",
      id: 5,
      topics: [1],
      topicViewIndices: [2],
      completed: false,
      thisWeek: false,
      repeated: true,
      scheduled: false,
      weekOrderIndex: 0,
    },
    {
      name: "New Task 6!",
      id: 6,
      topics: [],
      topicViewIndices: [],
      completed: false,
      thisWeek: false,
      repeated: false,
      scheduled: false,
      weekOrderIndex: 0,
    },
  ];
  let expectedTask = {
    name: "New Task 6!",
    id: 6,
    topics: [],
    topicViewIndices: [],
    completed: false,
    thisWeek: false,
    repeated: false,
    scheduled: false,
    weekOrderIndex: 0,
  };
  //Act
  let newTask = generateEmptyTask(newTasks);
  //Assert
  expect(expectedTask).toEqual(newTask);
});

it("insertTaskIntoTopic_should_work", () => {
  //Arrange
  let freshTasks = structuredClone(tasks);
  let freshTopics = structuredClone(topics);
  newTasks = structuredClone(tasks);
  newTopics = structuredClone(topics);
  let expectedTasks = [
    {
      name: "Fiets repareren",
      id: 0,
      topics: [12],
      topicViewIndices: [1],
      completed: true,
      thisWeek: false,
      repeated: false,
      scheduled: false,
      weekOrderIndex: 1,
    },
    {
      name: "Outer Wilds",
      id: 1,
      topics: [21, 1],
      topicViewIndices: [1, 1],
      completed: false,
      thisWeek: false,
      repeated: false,
      scheduled: false,
      weekOrderIndex: 0,
    },
    {
      name: "Badkamer",
      id: 2,
      topics: [1, 21],
      topicViewIndices: [3, 2],
      completed: false,
      thisWeek: true,
      repeated: false,
      scheduled: true,
      weekOrderIndex: 2,
    },
    {
      name: "Backup opruimen",
      id: 5,
      topics: [1],
      topicViewIndices: [2],
      completed: false,
      thisWeek: false,
      repeated: true,
      scheduled: false,
      weekOrderIndex: 0,
    },
  ];

  //Act
  newTasks = insertTaskInstanceIntoTopic(newTasks, 2, 21, 2);
  //Assert
  expect(newTasks).toEqual(expectedTasks);
});

it("insertTaskIntoTopicInFront_should_work", () => {
  //Arrange
  let freshTasks = structuredClone(tasks);
  let freshTopics = structuredClone(topics);
  newTasks = structuredClone(tasks);
  newTopics = structuredClone(topics);
  let expectedTasks = [
    {
      name: "Fiets repareren",
      id: 0,
      topics: [12],
      topicViewIndices: [1],
      completed: true,
      thisWeek: false,
      repeated: false,
      scheduled: false,
      weekOrderIndex: 1,
    },
    {
      name: "Outer Wilds",
      id: 1,
      topics: [21, 1],
      topicViewIndices: [2, 1],
      completed: false,
      thisWeek: false,
      repeated: false,
      scheduled: false,
      weekOrderIndex: 0,
    },
    {
      name: "Badkamer",
      id: 2,
      topics: [1, 21],
      topicViewIndices: [3, 1],
      completed: false,
      thisWeek: true,
      repeated: false,
      scheduled: true,
      weekOrderIndex: 2,
    },
    {
      name: "Backup opruimen",
      id: 5,
      topics: [1],
      topicViewIndices: [2],
      completed: false,
      thisWeek: false,
      repeated: true,
      scheduled: false,
      weekOrderIndex: 0,
    },
  ];

  //Act
  newTasks = insertTaskInstanceIntoTopic(newTasks, 2, 21, 1);
  //Assert
  expect(newTasks).toEqual(expectedTasks);
});

it("removeTaskFromTopic_should_work", () => {
  //Arrange
  let freshTasks = structuredClone(tasks);
  let freshTopics = structuredClone(topics);
  newTasks = structuredClone(tasks);
  newTopics = structuredClone(topics);
  let expectedTasks = [
    {
      name: "Fiets repareren",
      id: 0,
      topics: [12],
      topicViewIndices: [1],
      completed: true,
      thisWeek: false,
      repeated: false,
      scheduled: false,
      weekOrderIndex: 1,
    },
    {
      name: "Outer Wilds",
      id: 1,
      topics: [21, 1],
      topicViewIndices: [1, 1],
      completed: false,
      thisWeek: false,
      repeated: false,
      scheduled: false,
      weekOrderIndex: 0,
    },
    {
      name: "Badkamer",
      id: 2,
      topics: [],
      topicViewIndices: [],
      completed: false,
      thisWeek: true,
      repeated: false,
      scheduled: true,
      weekOrderIndex: 2,
    },
    {
      name: "Backup opruimen",
      id: 5,
      topics: [1],
      topicViewIndices: [2],
      completed: false,
      thisWeek: false,
      repeated: true,
      scheduled: false,
      weekOrderIndex: 0,
    },
  ];

  //Act
  newTasks = removeTaskInstanceFromTopic(newTasks, 2, 1);
  //Assert
  expect(newTasks).toEqual(expectedTasks);
});

// it('placeholder', () => {
//     expect(1).toEqual(1)
// });
