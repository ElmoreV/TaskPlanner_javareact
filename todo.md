
# Features:


## Database interaction:

- [x] Create simple example tasks/topics

### Migration to schema.v1:

- [x] Rendering
- [x] Export/Import
- [x] Adding/deleting/modifying tasks
- [x] Task.js
- [x] Adding/deleting/modifying topics
- [x] Topic.js
- [x] Default example
- [ ] PlannedTask.js

### Importing/Exporting:

- [x] Allow export of tasks as JSON
- [x] Allow import of tasks as JSON
- [x] Allow export of tasks as YAML
- [x] Allow import of tasks as YAML
- [x] Detection of JSON or YAML at import 
- [x] Save output in markdown
- [ ] Find a way to add task/topic id into the YAML
- [x] Prettify the output JSON to make it more git-friendly
- [ ] Add the completion of a task into the YAML
- [x] Add detection of JSON.v0 and JSON.v1 format
- [ ] Create a new text-based output, that is based on YAML
- [ ] Create different settings for the text/markdown based output (keep indent, show completed, show planned, and more?)
- [ ] Export the weekly list as a txt file (without topic information)
- [ ] Export the weekly list as a txt file (with condensed topic information)

#### Sanitize input:

- [ ] Check against duplicate keys
- [ ] Check against missing optional parameters (completed etc.)
- [ ] Check against missing required parameters (taskName, key)

### Data structure conversion:

- [x] (tasks,topics).v1 to (relational.tasks/topics)
- [ ] (tasks,topics).v1 to (hierarchical.topics+tasks)
- [x] (tasks,topics).v0 to (task,topics).v1
- [ ] (relational.tasks/topics) to (tasks,topics).v1
- [ ]  (hierarchical.topics+tasks) to (tasks,topics).v1
- [x] (task,topics).v1 to (tasks,topics).v0

## Per Topic View:


### Aesthetic:

- [ ] Prettify text input for tasks
- [ ] Improve collapse and dropdown icon
- [ ] "Delete task" icon
- [ ] "Add task" icon
- [ ] Animate collapse and dropdown
- [x] Make the tasks to have a good width. Naive: text-cutoff
- [ ] Dragging: make outline of dragged-over-task/topic fat
- [ ] Design good way to limit task text in the task box
- [ ] Add Ability to unfold a topic and all its subtopics in one go

### Functionality:


#### Relaying information:

- [x] Have topics and subtopics show up
- [x] Have tasks show up under the right topic
- [x] Allow the topics to drop down and collapse
- [x] Add icon (> or V) for drop down and collapse
- [x] Hide completed tasks
- [x] Make visible which Tasks are planned for this week
- [ ] Show how many tasks are completed/planned/open in a topic
- [ ] Minimize empty topics
- [ ] Enable filtering on repeated tasks (to uncomplete them manually)

#### Modifying information:

- [x] Editable task names
- [x] "Delete task" button
- [x] "Add task" button
- [x] "Task completion" button
- [x] Make topic name editable (doubleclick)
- [x] Make tasks draggeable to other task lists
- [x] Make tasks draggeable to topics
- [x] Make topics draggable to other topics
- [x] Allow deletion of Topics
- [ ] Drag tasks to change the order in task list
- [x] Make Tasks duplicatable to multiple topics
- [x] Allow new subtopics to be created
- [x] Allow root topics to be created
- [x] Add a way to add the task to the current Weekly View
- [x] Create a way to remove task from weekly View
- [ ] Make Topics draggeable to the Root Topic list
- [ ] Add 'Is Repeated Task' button

## Weekly Tasks View:


### Aesthetic:


### Modifying information:

- [ ] Add a way to remove the task from the weekly view on the weekly view
- [ ] Allow reordering the weekly view tasks
- [ ] Add button the clear weekly view
- [ ] Add button to clear all completed items

### Relaying information:

- [x] List all the tasks that are planned for this week
- [x] List the topic(s) +subtopic(s) that the task belongs to
- [x] Add a way to hide the completed items

## Daily Task View:

- [ ] Make tasks importable from Weekly View

## General:

- [x] Change schema terminology to id,name,...
- [ ] Show if the loaded json file has meaninfully changed

### Project management:

- [x] Gitify this project
- [x] Create this Todo-list in the TaskPlanner

### Unknowns:

- [ ] Understand useRef
- [ ] Understand FileReader

### Functionality:

- [x] When text doubleclicked: focus immediately on text input
- [x] When enter is pressed: finish editing
- [ ] Search engine for tasks/topics
- [ ] Create a history of updates (create undo button)
- [ ] Add comments to tasks/topics
- [ ] Open tasks/topics to have a task/topic card
- [ ] Add hyperlink suport to tasks/topics
- [ ] Allow for subtasks

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

- [ ] Scheduling
- [ ] Formally enabling all possibilities (what are all possibilities of repetition?)
- [ ] Add a repeated tag to tasks
- [ ] Enable filtering on repeated tasks (to uncomplete them manually)

## Priority module:

- [ ] Prioritize (order control)
- [ ] Automatic promotion (more important, deadline nears)
- [ ] Automatic demotion (less important, was too long ago)

# Constraints:


## UX/UI:

- [ ] Allow keyboard-only mode
- [ ] Make the lists more readable
- [ ] Choose better color schemes for tasks and topics
- [ ] Choose better color schemes for the feedback (drag/drop) events
- [ ] Allow hovering over topics to unfold them
- [x] When creating a new topic, leave it unfolded

## Maintainability:

- [x] Enable autoformatting
- [ ] Convert to TypeScript
- [ ] Standardize variable, function and classnames (underscore,etc.)

### Error handling:


### Documentation/logging:


### Testing:

- [ ] Import/export
- [ ] Conversion
- [ ] Add/deleting/modifying task
- [ ] Add/modify topic
- [x] Understand testing framework (jest)
- [ ] Delete topic

### Refactoring:

- [x] Refactor the TaskList.js into smaller files
- [ ] Refactor ModifyingFunctionGenerators into smaller files

## Performance:

- [x] Text edit should not lag, but it does now

## Reliability:


# Bugs/issues:

- [x] Topics with the same name give weird bugs
- [ ] Test tasks with empty string
- [x] Remove the empty lists from the YAML-export
- [ ] Properly handle escaped characters in YAML
- [ ] YAML cannot handle single quotes
- [x] When creating a new topic, leave it unfolded
- [x] Remove the yellow from the color-scheme for drag and drop (unreadable)
