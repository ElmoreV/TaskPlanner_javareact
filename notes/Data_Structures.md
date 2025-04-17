# Overview

There are topics.
Topics have an id
Topics have a name.
Topics can have 0,1 or more children topics.
Topics can have 0 or 1 parent topics.
Topics can have no tasks as parents
Topics with 0 topics are root topics. 
Topic parents/children cannot form a cycle.

There are tasks.
Tasks have an id.
Tasks can have a name.
Tasks can have a state (Unplanned,Planned,Scheduled,Finished)
The state finished can be due to three grounds (Completed, Impossible, Irrelevant)
Tasks must have at least 1 or more parents
Tasks can have topics as parents
Tasks will be able to have tasks as parents.
Tasks can have no children topics. 
Tasks will have 0,1, or more children tasks in the future.

There is a planned list with only tasks. They will have an order.
Every planned/scheduled task has exactly one planned list index.
If a task is not scheduled/planned, the index should not have an effect (default = 0)

There is a topic view that shows:
- All topics show all their children.
- All tasks can be shown at least once, or more than once
- All topics can only be shown once.

topic:
[
    id:
    name:
    childIds: //this can be ordered
    childTopicIds:[]
    childTaskIds: [] // These cannot be interchanged..
    parentTopicId:
]
tasks:
[
    id:
    rest:
    parentTopicIds:[]
    parentTaskIds:[]
    childTaskIds:[]
    plannedListIndex:[]
]


tasktopic:
[
    id:xx
    type:'topic'|'task'
]

Just saving it as a tree would be the best. The order of the Ids will be the order of visualization.

Tasks and subtasks would definitely create the risk of making a cycle.
Tasks cannot be their own subtask.

Biggest problem is the visual order

Label nodes, but then if adding a node, it would need to shift every single node down everywhere.

There is a also the problem of mixing topics and tasks in the order. Maybe just not do this, and just order the tasks first.

Every task,supertopic combination would need to have a consistent order.

Every supertask has the exact same set of subtasks.


It makes more sense to have a separate index for every parent.


Option 1:

Every topic has it's own id and content
Every task has it's own id and content

The graph is a separate entity (of id's and links to other id's). This determines the order of showing.

Option 2:

It is entirely a DAG, also in data structure with links to other topics in the subtopics etc. etc. The display order is dependent on the order in the data strucutre.

Option 3: A hybrid. For the topics there is no issue, this is a tree.
For tasks, it gets difficult. 

I'm pretty sure I just have to work it out. And make testing so that it's higher level and I can change the underlying structure without problem.

Important key facts:
Only use id's or actual pointers to other objects.

# Optimality of the data structure

There are different actions that are performed, that would need to be optimized.

## Application/website/app

- Optimize for rendering time: read
- And optimize for code complexity.

## Storage

- Optimize for size and git version ability


## Migration of data structure v1 to v2

V1:
```javascript
//v1
  const [topics, setTopics] = useState([
    {
      name: "Maintenance", id: 1, unfolded: false, subtopics: [
        { name: "Repair", id: 12, unfolded: false, subtopics: [] },
        { name: "Replace", id: 11, unfolded: false, subtopics: [] },
        { name: "Document", id: 13, unfolded: true, subtopics: [] }

      ]
    },
    {
      name: "Creativity", id: 2, unfolded: false, subtopics: [
        { name: "Writing", id: 21, unfolded: false, subtopics: [] }
      ]
    }

  ]);

  const [tasks, setTasks] = useState([
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
  ])

```

V2:
```javascript
//v2
  const [tags, setTags] = useState({
    1:{
        id:1,
        name: "Maintenance",
        unfolded: false,
        childTagIds: [12,11,13] // order is important for render order
        parentTagIds: [] // order is not important
    },
    11:{
        id:11,
        name: "Replace",
        unfolded: false,
        childTagIds: []
        parentTagIds: [1]
    },    
    12:{
        id:12,
        name: "Repair",
        unfolded: false,
        childTagIds: []
        parentTagIds: [1]
    },  
    13:{  
        id:13,
        name: "Document",
        unfolded: true,
        childTagIds: []
        parentTagIds: [1]
    },
    2:{  
        id:2,
        name: "Creativity",
        unfolded: false,
        childTagIds: [21]
        parentTagIds: []
    },  
    21:{  
        id:21,
        name: "Writing",
        unfolded: false,
        childTagIds: []
        parentTagIds: [2]
    },  
  })

  const [tasks, setTasks] = useState({
    0:{
      id: 0,
      name: "Replace bicycle",
      finishStatus: FinishedState.Completed,
      completed: true,
      thisWeek: false,
      scheduled: false,
      repeated: false,
      unfolded: true,
      childTaskIds: [],
      parentTaskIds: [1],
    },
    1:{
      id: 1,
      name: "Write Cover Letter",
      finishStatus: FinishedState.NotFinished,
      completed: false,
      thisWeek: false,
      scheduled: false,
      repeated: false,
      unfolded: true,
      childTaskIds: [0], // Order is important for render order
      parentTaskIds: [2], // order is not important (yet)
    },
    2:{
      id: 2,
      name: "Check tax return",
      finishStatus: FinishedState.NotFinished,
      completed: false,
      thisWeek: true,
      scheduled: true,
      repeated: false,
      unfolded: true,
      childTaskIds: [1],
      parentTaskIds: [],
    },
    5:{
      id: 5,
      name: "Create a NASS server",
      finishStatus: FinishedState.NotFinished,
      completed: false,
      thisWeek: true,
      scheduled: false,
      repeated: false,
      unfolded: true,
      childTaskIds: [2],
      parentTaskIds: [],
    },
  })

// tagTasks[tag_id] = [task_id1, task_id2, task_id3]
// order is important!
const [tagTasks, setTagTasks] = useState([
  { 1: [5,2],
    2: [],
    11: [],
    12: [0],
    13: [1],
    21: [1],
  }
])

const [weekTaskIdList, setWeekTaskIdList] = useState([])


const [tasks, setTasks] = useState([
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
  ])
```