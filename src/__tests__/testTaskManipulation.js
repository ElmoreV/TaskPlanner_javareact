import structuredClone from "@ungap/structured-clone";
import { getDeleteTopic } from "../ModifyFuncGeneratorsV1";

//1. Prepare a tasks/topics example
const tasks = [
  {
    name: "Fiets repareren",
    id: 0,
    topics: [12],
    completed: true,
    thisWeek: false,
  },
  {
    name: "Outer Wilds",
    id: 1,
    topics: [21, 1],
    completed: false,
    thisWeek: false,
  },
  { name: "Badkamer", id: 2, topics: [1], completed: true, thisWeek: false },
  {
    name: "Backup opruimen",
    id: 5,
    topics: [1],
    completed: false,
    thisWeek: false,
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

it("deleteTopic_invalid_topic_id", () => {
  //Arrange
  let freshTasks = structuredClone(tasks);
  let freshTopics = structuredClone(topics);
  newTasks = structuredClone(tasks);
  newTopics = structuredClone(topics);
  let invalidId = 240;
  //Act
  getDeleteTopic(setTopics, freshTopics, setTasks, freshTasks, invalidId)();
  expect(newTopics).toEqual(topics);
  expect(newTasks).toEqual(tasks);
});

//2. Call different functions
it("deleteTopic_happy_path", () => {
  //Arrange
  let freshTasks = structuredClone(tasks);
  let freshTopics = structuredClone(topics);
  newTasks = structuredClone(tasks);
  newTopics = structuredClone(topics);
  let validId = 1;
  //Act
  getDeleteTopic(setTopics, freshTopics, setTasks, freshTasks, validId)();
  //Assert
  expect(newTopics).toEqual([
    {
      name: "Ontspanning",
      id: 2,
      unfolded: false,
      subtopics: [{ name: "Gamen", id: 21, unfolded: false, subtopics: [] }],
    },
  ]);
  expect(newTasks).toEqual([
    {
      name: "Outer Wilds",
      id: 1,
      topics: [21],
      completed: false,
      thisWeek: false,
    },
  ]);
});

import { getAddSubtopic } from "../ModifyFuncGeneratorsV1";

it("addSubtopic_good", () => {
  //Arrange
  let freshTopics = structuredClone(topics);
  newTopics = structuredClone(topics);
  //Act

  getAddSubtopic(setTopics, freshTopics, freshTopics[0])();
  expect(newTopics).toEqual([
    {
      name: "Onderhoud",
      id: 1,
      unfolded: false,
      subtopics: [
        { name: "New Topic 22", id: 22, unfolded: true, subtopics: [] },
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
  ]);
});

it("addSubtopic_invalidSupertopic", () => {
  //Arrange
  let freshTopics = structuredClone(topics);
  newTopics = structuredClone(topics);
  //Act

  getAddSubtopic(setTopics, freshTopics, {})();
  expect(newTopics).toEqual([
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
  ]);
});

// it('changeTaskTopic_validtask_to_validtopic', () => {
//     //Arrange
//     let freshTasks = structuredClone(tasks)
//     newTasks = structuredClone(tasks)
//     //Act

//     getChangeTaskTopic(setTasks, tasks)(5, 1, 11)
//     expect(newTasks).toEqual(
//         [
//             { name: "Fiets repareren", id: 0, topics: [12], completed: true, thisWeek: false },
//             { name: "Outer Wilds", id: 1, topics: [21, 1], completed: false, thisWeek: false },
//             { name: "Badkamer", id: 2, topics: [1], completed: true, thisWeek: false },
//             { name: "Backup opruimen", id: 5, topics: [11], completed: false, thisWeek: false },
//         ]
//     )

// })

// it('changeTaskTopic_invalidtask_to_validtopic', () => {
//     //Arrange
//     let freshTasks = structuredClone(tasks)
//     newTasks = structuredClone(tasks)
//     //Act

//     getChangeTaskTopic(setTasks, tasks)(404, 1, 11)
//     expect(newTasks).toEqual(tasks)
// })

// it('changeTaskTopic_validtask_to_invalidtopic', () => {
//     //Arrange
//     let freshTasks = structuredClone(tasks)
//     newTasks = structuredClone(tasks)
//     //Act
//     getChangeTaskTopic(setTasks, freshTasks)(5, 1, 201)
//     //Assert
//     //TODO: this is clearly a mistake
//     expect(newTasks).toEqual(        [
//         { name: "Fiets repareren", id: 0, topics: [12], completed: true, thisWeek: false },
//         { name: "Outer Wilds", id: 1, topics: [21, 1], completed: false, thisWeek: false },
//         { name: "Badkamer", id: 2, topics: [1], completed: true, thisWeek: false },
//         { name: "Backup opruimen", id: 5, topics: [11], completed: false, thisWeek: false },
//     ]
// )
// })

// it('changeTaskTopic_validtask_from_invalidtopic', () => {
//     //Arrange
//     let freshTasks = structuredClone(tasks)
//     newTasks = structuredClone(tasks)
//     //Act
//     getChangeTaskTopic(setTasks, freshTasks)(5, 202, 1)
//     //Assert
//     expect(newTasks.toString()).toEqual(tasks.toString())
// })

// it('changeTaskTopic_validtask_to_invalidtopic', () => {
//     //Arrange
//     let freshTasks = structuredClone(tasks)
//     newTasks = structuredClone(tasks)
//     //Act
//     getChangeTaskTopic(setTasks, freshTasks)(5, 202, 404)
//     //Assert
//     expect(newTasks.toString()).toEqual(tasks.toString())
// })
