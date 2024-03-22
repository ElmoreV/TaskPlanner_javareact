
# Features:


## Database interaction:

- [x] Create simple example tasks/topics

### Migration to schema.v1:

- [x] Adding/deleting/modifying tasks
- [x] Adding/deleting/modifying topics
- [x] Default example
- [x] Export/Import
- [x] Rendering
- [x] Task.js
- [x] Topic.js
- [ ] PlannedTask.js

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
- [ ] Find a way to add task/topic id into the YAML
- [x] Prettify the output JSON to make it more git-friendly
- [x] Save output in markdown
- [x] Export the weekly list as a txt file (without topic information)

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
- [x] Have tasks show up under the right topic
- [x] Have topics and subtopics show up
- [x] Hide completed tasks
- [x] Make visible which Tasks are planned for this week
- [ ] Minimize empty topics
- [ ] Show how many tasks are completed/planned/open in a topic
- [ ] Ability to ony show repeated AND completed tasks
- [x] Enable filtering on repeated tasks (to uncomplete them manually)

#### Modifying information:

- [x] "Add task" button
- [x] "Delete task" button
- [x] "Task completion" button
- [x] Add a way to add the task to the current Weekly View
- [x] Allow new subtopics to be created
- [x] Allow root topics to be created
- [x] Create a way to remove task from weekly View
- [ ] Drag tasks to change the order in task list
- [x] Editable task names
- [ ] Make Topics draggeable to the Root Topic list
- [x] Make tasks draggeable to other task lists
- [x] Make topic name editable (doubleclick)
- [x] Make tasks draggeable to topics
- [x] Make topics draggable to other topics
- [x] Allow deletion of Topics
- [x] Make Tasks duplicatable to multiple topics
- [x] Add 'Is Repeated Task' button

## Weekly Tasks View:


### Aesthetic:

- [ ] Manage the text widths on the task bars

### Modifying information:

- [x] Add a button to mark the task as completed
- [ ] Add a way to remove the task from the weekly view on the weekly view
- [ ] Add button to clear weekly view
- [x] Add button to clear all completed items
- [x] Allow reordering the weekly view tasks
- [ ] Add a way to mark a task as handled/scheduled (but not completed)
- [ ] Ability to partially complete a task
- [ ] Improve navigation during drag-sorting the list

### Relaying information:

- [x] List all the tasks that are planned for this week
- [ ] Show all topics for a task with multiple topics
- [x] List the topic(s) +subtopic(s) that the task belongs to
- [x] Add a way to hide the completed items

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
- [ ] Ability to (duplicate) drag multiple tasks/topics at once
- [ ] Ability to select tasks

#### Dependencies:

- [ ] Allow tasks to have dependencies
- [ ] Allow tasks to have multiplpe dependenceis
- [ ] Multiple dependencies can be OR or AND dependencies

### Aesthetics:

- [ ] Create minimal layout (dense/packed/not pretty)
- [ ] Enable dark mode
- [ ] Remember the choice for HideCompletedItems for a View

## Timing:


### Impossibilities:

- [ ] Not before, not during, not after (deadline)

### Duration (estimated?):

- [ ] Instant
- [ ] Time span

### Repetition:

- [ ] Formally enabling all possibilities (what are all possibilities of repetition?)
- [ ] Scheduling
- [x] Add a repeated tag to tasks
- [x] Enable filtering on repeated tasks (to uncomplete them manually)

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
- [ ] Make the lists more readable
- [x] Remember the name of the loaded file (so that it does not need to be renamed on every save)
- [ ] Make it easier to see the level at which you are at (guidance lines?)
- [ ] Add ability too peek into folded topics
- [ ] Have just a list of tasks, that we can put filters on (basically the weekly list is a list with filter: planned=True)
- [ ] Show topics in a shortened way if possible.
- [ ] Prevent movement of topics after folding/unfolding + screen height change
- [ ] Allow to find all duplicates of a task at first task
- [ ] (Duplicate) dragging tasks should not be a 2-step process (make it easier to go to the right spot)
- [ ] Adding a task (when only showing repeated tasks) should add a repeated task
- [ ] Have the new root topic button available everywhere on the page
- [ ] Improve navigation during drag-sorting the list
- [ ] Delete button should be next to duplicate button
- [ ] Plan button, complete button and repeat button should be next to each other
- [ ] If you save with a certain file name, remember this for use for later saving
- [x] When creating a new topic, leave it unfolded
- [ ] Keep a list of UX issues when manually testing/using the software
- [ ] Find a way to save markdown, yaml and json all at the same time

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
- [x] Understand testing framework (jest)
- [ ] Keep a list of UX issues when manually testing/using the software

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
- [ ] YAML cannot handle single quotes
- [x] When creating a new topic, leave it unfolded
