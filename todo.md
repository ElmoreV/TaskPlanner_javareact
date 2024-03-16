
# Features:


## Database interaction:

- [x] Create simple example tasks/topics

### Migration to schema.v1:

- [x] Adding/deleting/modifying tasks
- [x] Adding/deleting/modifying topics
- [x] Default example
- [x] Export/Import
- [ ] PlannedTask.js
- [x] Rendering
- [x] Task.js
- [x] Topic.js

### Importing/Exporting:

- [x] Add detection of JSON.v0 and JSON.v1 format
- [ ] Add the completion of a task into the YAML
- [x] Allow export of tasks as JSON
- [x] Allow export of tasks as YAML
- [x] Allow import of tasks as JSON
- [x] Allow import of tasks as YAML
- [x] Allow import/export in both topic and weekly view
- [ ] Create a new text-based output, that is based on YAML
- [ ] Create different settings for the text/markdown based output (keep indent, show completed, show planned, and more?)
- [x] Detection of JSON or YAML at import 
- [ ] Export the weekly list as a txt file (with condensed topic information)
- [ ] Export the weekly list as a txt file (without topic information)
- [ ] Find a way to add task/topic id into the YAML
- [x] Prettify the output JSON to make it more git-friendly
- [x] Save output in markdown

#### Sanitize input:

- [ ] Check against duplicate keys
- [ ] Check against missing optional parameters (completed etc.)
- [ ] Check against missing required parameters (taskName, key)

### Data structure conversion:

- [ ]  (hierarchical.topics+tasks) to (tasks,topics).v1
- [ ] (relational.tasks/topics) to (tasks,topics).v1
- [x] (task,topics).v1 to (tasks,topics).v0
- [x] (tasks,topics).v0 to (task,topics).v1
- [ ] (tasks,topics).v1 to (hierarchical.topics+tasks)
- [x] (tasks,topics).v1 to (relational.tasks/topics)

## Per Topic View:


### Aesthetic:

- [ ] "Add task" icon
- [ ] "Delete task" icon
- [ ] Add Ability to unfold a topic and all its subtopics in one go
- [ ] Animate collapse and dropdown
- [ ] Design good way to limit task text in the task box
- [ ] Dragging: make outline of dragged-over-task/topic fat
- [ ] Improve collapse and dropdown icon
- [x] Make the tasks to have a good width. Naive: text-cutoff
- [ ] Prettify text input for tasks

### Functionality:


#### Relaying information:

- [x] Add icon (> or V) for drop down and collapse
- [x] Allow the topics to drop down and collapse
- [x] Enable filtering on repeated tasks (to uncomplete them manually)
- [x] Have tasks show up under the right topic
- [x] Have topics and subtopics show up
- [x] Hide completed tasks
- [x] Make visible which Tasks are planned for this week
- [ ] Minimize empty topics
- [ ] Show how many tasks are completed/planned/open in a topic

#### Modifying information:

- [x] "Add task" button
- [x] "Delete task" button
- [x] "Task completion" button
- [x] Add 'Is Repeated Task' button
- [x] Add a way to add the task to the current Weekly View
- [x] Allow deletion of Topics
- [x] Allow new subtopics to be created
- [x] Allow root topics to be created
- [x] Create a way to remove task from weekly View
- [ ] Drag tasks to change the order in task list
- [x] Editable task names
- [x] Make Tasks duplicatable to multiple topics
- [ ] Make Topics draggeable to the Root Topic list
- [x] Make tasks draggeable to other task lists
- [x] Make tasks draggeable to topics
- [x] Make topic name editable (doubleclick)
- [x] Make topics draggable to other topics

## Weekly Tasks View:


### Aesthetic:


### Modifying information:

- [x] Add a button to mark the task as completed
- [ ] Add a way to remove the task from the weekly view on the weekly view
- [ ] Add button the clear weekly view
- [ ] Add button to clear all completed items
- [x] Allow reordering the weekly view tasks

### Relaying information:

- [x] Add a way to hide the completed items
- [x] List all the tasks that are planned for this week
- [x] List the topic(s) +subtopic(s) that the task belongs to

## Daily Task View:

- [ ] Make tasks importable from Weekly View

## General:

- [x] Change schema terminology to id,name,...
- [ ] Show if the loaded json file has meaninfully changed

### Project management:

- [x] Create this Todo-list in the TaskPlanner
- [x] Gitify this project

### Unknowns:

- [ ] Understand FileReader
- [ ] Understand useRef

### Functionality:

- [ ] Add comments to tasks/topics
- [ ] Add hyperlink suport to tasks/topics
- [ ] Allow for subtasks
- [ ] Create a history of updates (create undo button)
- [ ] Open tasks/topics to have a task/topic card
- [ ] Search engine for tasks/topics
- [x] When enter is pressed: finish editing
- [x] When text doubleclicked: focus immediately on text input

#### Dependencies:

- [ ] Allow tasks to have dependencies
- [ ] Allow tasks to have multiplpe dependenceis
- [ ] Multiple dependencies can be OR or AND dependencies

### Aesthetics:

- [ ] Create minimal layout (dense/packed/not pretty)
- [ ] Enable dark mode

## Timing:


### Impossibilities:

- [ ] Not before, not during, not after (deadline)

### Duration (estimated?):

- [ ] Instant
- [ ] Time span

### Repetition:

- [x] Add a repeated tag to tasks
- [x] Enable filtering on repeated tasks (to uncomplete them manually)
- [ ] Formally enabling all possibilities (what are all possibilities of repetition?)
- [ ] Scheduling

## Priority module:

- [ ] Automatic demotion (less important, was too long ago)
- [ ] Automatic promotion (more important, deadline nears)
- [ ] Prioritize (order control)

# Constraints:


## UX/UI:

- [ ] Add a way to easier move/duplicate tasks to far-away topics (better drag handling or cut/copy/paste)
- [ ] Add ability to peek into a list of folded topics
- [ ] Allow hovering over topics to unfold them
- [ ] Allow keyboard-only mode
- [ ] Choose better color schemes for tasks and topics
- [ ] Choose better color schemes for the feedback (drag/drop) events
- [ ] Keep a list of UX issues when manually testing/using the software
- [ ] Make the lists more readable
- [x] Remember the name of the loaded file (so that it does not need to be renamed on every save)
- [x] When creating a new topic, leave it unfolded

## Maintainability:

- [ ] Convert to TypeScript
- [x] Enable autoformatting
- [ ] Standardize variable, function and classnames (underscore,etc.)

### Error handling:


### Documentation/logging:


### Testing:

- [ ] Add/deleting/modifying task
- [ ] Add/modify topic
- [ ] Conversion
- [ ] Delete topic
- [ ] Import/export
- [ ] Keep a list of UX issues when manually testing/using the software
- [x] Understand testing framework (jest)

### Refactoring:

- [ ] Refactor ModifyingFunctionGenerators into smaller files
- [x] Refactor the TaskList.js into smaller files

## Performance:

- [x] Text edit should not lag, but it does now

## Reliability:


# Bugs/issues:

- [ ] Properly handle escaped characters in YAML
- [x] Remove the empty lists from the YAML-export
- [x] Remove the yellow from the color-scheme for drag and drop (unreadable)
- [ ] Test tasks with empty string
- [x] Topics with the same name give weird bugs
- [x] When creating a new topic, leave it unfolded
- [ ] YAML cannot handle single quotes
