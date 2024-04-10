
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
- [ ] Animate collapse and dropdown
- [ ] Design good way to limit task text in the task box
- [ ] Dragging: make outline of dragged-over-task/topic fat
- [ ] Improve collapse and dropdown icon
- [x] Make the tasks to have a good width. Naive: text-cutoff
- [ ] Prettify text input for tasks
- [ ] Not being able to collapse or fold all the topics with one button - 21m
- [ ] Add Ability to unfold a topic and all its subtopics in one go

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
- [ ] Add a color to indicate 'Blocked externally' (waiting for response)
- [ ] Add a color to indicate 'Impossible'
- [ ] The task remembers the last time it has been completed

#### Modifying information:

- [x] "Add task" button
- [x] "Delete task" button
- [x] "Task completion" button
- [x] Add a way to add the task to the current Weekly View
- [x] Allow new subtopics to be created
- [x] Allow root topics to be created
- [x] Create a way to remove task from weekly View
- [x] Editable task names
- [x] Make topic name editable (doubleclick)
- [x] Allow deletion of Topics
- [x] Add 'Is Repeated Task' button
- [ ] Ability to mark a task 'Blocked externally' (waiting for response)
- [ ] Ability to mark a task 'Impossible'

##### Dragging tasks:

- [ ] Make Topics draggeable to the Root Topic list
- [x] Make tasks draggeable to other task lists
- [ ] Ability to (duplicate) drag multiple tasks/topics at once
- [x] Make tasks draggeable to topics
- [x] Make topics draggable to other topics
- [x] Make Tasks duplicatable to multiple topics
- [ ] Drag tasks to change the order in task list
- [ ] Drag topics to sort them in the topic list
- [ ] Create sensible moments to clear the task selection (click outside the task)
- [x] Ability to select (multiple) tasks

## Weekly Tasks View:


### Aesthetic:

- [ ] Manage the text widths on the task bars

### Modifying information:

- [x] Add a button to mark the task as completed
- [ ] Add button to clear weekly view
- [x] Add button to clear all completed items
- [x] Allow reordering the weekly view tasks
- [ ] Ability to partially complete a task
- [ ] Improve navigation during drag-sorting the list
- [x] Add a way to remove the task from the weekly view on the weekly view
- [x] Add a way to mark a task as handled/scheduled (but not completed)

### Relaying information:

- [x] List all the tasks that are planned for this week
- [x] List the topic(s) +subtopic(s) that the task belongs to
- [x] Add a way to hide the completed items
- [ ] Show all topics for a task with multiple topics

## Daily Task View:

- [ ] Make tasks importable from Weekly View

## General:

- [x] Change schema terminology to id,name,...
- [x] Show if the loaded json file has meaninfully changed

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
- [x] Ability to select (multiple) tasks

#### Dependencies:

- [ ] Allow tasks to have dependencies
- [ ] Allow tasks to have multiplpe dependenceis
- [ ] Multiple dependencies can be OR or AND dependencies

### Aesthetics:

- [ ] Enable dark mode
- [ ] Remember the choice for HideCompletedItems for a View
- [x] Create minimal layout (dense/packed/not pretty)

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
- [x] Remember the name of the loaded file (so that it does not need to be renamed on every save)
- [ ] Add ability too peek into folded topics
- [ ] Show topics in a shortened way if possible.
- [ ] Prevent movement of topics after folding/unfolding + screen height change
- [ ] Allow to find all duplicates of a task at first task
- [ ] (Duplicate) dragging tasks should not be a 2-step process (make it easier to go to the right spot)
- [ ] Adding a task (when only showing repeated tasks) should add a repeated task
- [ ] Have the new root topic button available everywhere on the page
- [ ] Improve navigation during drag-sorting the list
- [ ] Delete button should be next to duplicate button
- [ ] Plan button, complete button and repeat button should be next to each other
- [x] When creating a new topic, leave it unfolded
- [ ] Make the lists more readable
- [ ] Make it easier to see the level at which you are at (guidance lines?)
- [ ] Have just a list of tasks, that we can put filters on (basically the weekly list is a list with filter: planned=True)
- [ ] If you save with a certain file name, remember this for use for later saving
- [x] Find a way to save markdown, yaml and json all at the same time
- [ ] Keep a list of UX issues when manually testing/using the software

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
- [ ] Isolate logic from content output as much as possible
- [ ] Isolate content output from visualization as much as possible
- [x] Refactor the TaskBar (the actual visible part) from the interaction part (the list item with all handlers)

## Performance:

- [ ] Text edit should not lag, but it does now

## Reliability:


# Bugs/issues:

- [ ] Properly handle escaped characters in YAML
- [x] Remove the empty lists from the YAML-export
- [x] Remove the yellow from the color-scheme for drag and drop (unreadable)
- [ ] Test tasks with empty string
- [x] Topics with the same name give weird bugs
- [ ] YAML cannot handle single quotes
- [x] When creating a new topic, leave it unfolded

# Annoyances:


## Major/crashes/bugs:

- [ ] Make the sorting of the weekly planning not change the topic view order - 1M
- [ ] The data is lost when something in react is changed - 1M
- [x] Bug: source_supertopic is undefined in moveTopic - gefixt

## Relaying information:

- [ ] When showing only uncompleted/repeated tasks: minimize/remove/concatenate topic (paths) that are irrelevant/empty - 3m
- [ ] Not clearly seeing on what level a task is exactly (maybe needs guidance lines?) -2m+
- [ ] Not being able to peek in a list of folded topics: 2m
- [ ] Not being able to see statistics of the topic in the topic view - 2m
- [ ] I sometimes find a duplicate task that I made myself (The abiltiy to merge tasks?) -3m 
- [ ] There is a missing intent to progress towards a goal, but the task is not 'working on ... for 2 hours' but just 'finish this', and I make it repeated, which is also not the right way to do it. - 2m   'Working towards xx for 2 hours' is a subtask of 'Finish xx', so it should be fixed with subtasks
- [ ] The weekly view doesn't show all the topics of the task at hand: 1m
- [ ] After folding/unfolding, the mouse is not over the same topic anymore: 1m
- [ ] Not being able to search for a task (search bar) - 1m
- [ ] When I add a new root topics, do I want to add it at the end or the front? Do I want it in focus? - 1m
- [ ] Missing a way to sort the tasks by some other order (e.g. topic) temporarily - 1m
- [x] The weekly view names are too large and go to the next line (but don't make the task bigger): 5m - gefixt
- [x] Not seeing the repeated tasks: 2 -gefixt
- [x] No dark mode - 1m -gefixt
- [ ] Topic text is not handled right and makes the buttons go crazy - 1m
- [ ] Text width on a narrow screen is not handled well (text width not respected) - 5m
- [ ] Not being able to collapse or fold all the topics with one button - 21m
- [ ] Repeated tasks do not show last completion/cannot retain information about when the next time would be -14m+
- [ ] It is unclear where a duplicated task is already (is it already duplicated?) -10m

### Filtering:

- [ ] Hide completed items is not saved when changing views: 4m - frozen
- [ ] Not being able to just have a list of all tasks (with filters): 2m
- [ ] Ability to hide planned items - 2m
- [ ] Filtering is not available when in the middle of a large list - 2m
- [ ] Do not know which Tasks are Blocked by other people- 2m
- [ ] Not being able to show only repeated and only completed tasks: 2m
- [ ] Not being able to see what is scheduled and what not in the topic view - 1m
- [x] In the weekly view: hide completed tasks is always unchecked - 2m - gefixt

## Modifying information:

- [ ] Not being able to duplicate-drag tasks to other topics without stopping midway/taking a long time/being annoyed: 3m
- [ ] Adding a task, while only showing repeated tasks, should add a repeated task: 3m
- [ ] Dragging on the planning list has the wrong visual feedback when dragging downwards - 3m
- [ ] When sorting all the new tasks - giving them a place - it was hard to find my way around. 2m
- [ ] Text editing tends to slow down if you type more - 2m
- [ ] Dragging does suddenly stop if using a laptop drag. Maybe edge of screen? - 2m
- [ ] Selection also unselects when stopping dragging, which is also unexpected - 2m
- [ ] Not being able to make a new root topic when the button is not in view: 1m
- [ ] Delete and duplicate should be near each other. Completed and repeated should be near each other: 1m
- [ ] There is no easy way to deduplicate a duplicated task - 1m
- [ ] Dragging a task (in planned list) below the entire list, should put it at the bottom. - 1m
- [ ] Cannot spawn another task from a task completed in the weekly/planned list (completing the task made another todo) - 1m
- [ ] No possibility to create a new task in the planned list/Spontaneous ideas that should be categorized later -2m
- [ ] Cannot split a task into multiple tasks in the weekly list - 1m
- [ ] Cannot uncomplete/plan multiple selected items at once -1m
- [ ] Enter does not finish text input in planned list - 1m
- [x] Not being able to complete tasks on the weekly view: 1 - gefixt
- [x] Not being able to clear all completed items from the weekly list: 2M - gefixt
- [x]  Not being able to remove items from the weekly list on the weekly list: 4m - gefixt
- [x] Not being able to edit task text on the weekly view - 3m - gefixt
- [x] Not being able to mark a weekly task as 'planned in the daily view (or locally)' - 4m - gefixt
- [x] Topic view task text is too long: 3m - gefixt (opnieuw)
- [ ] Removing items from the planned list or completing an item, does not unschedule them - 14m
- [ ] Not being able to duplicate multiple tasks at once in Topic View (forgetting which tasks are already copied): 12m

### It takes a huge time to drag a task from the top to the bottom - 13m :

- [ ] Make dragging hide all other tasks instead (but it's not ideal, it still is annoying)
- [ ] Manually sort the tasks one level down each time
- [ ] Open folded topics by hovering over the topic
- [ ] Maybe do a .. hide all tasks or something
- [ ] Main issue, I cannot scroll during dragging
- [ ] Read: https://blog.logrocket.com/ux-design/organizing-categorizing-content-information-architecture/

### Missing data structure:

- [ ] There is no way to create a task and it's subtasks. Topics shouldn't be supertasks/goals. -11m
- [ ] There is no way to have a planned task (3x sport in a week) and complete/schedule it partially - 4m      e.g. sport_1 is completed, sport_2 missed deadline, sport_3 scheduled -9m
- [ ] Cannot mark a task as Blocked - 3m
- [ ] I'm doing the same process/ collection of tasks over and over, make them quickly plannable - 3m
- [ ] Inability to add comments to a (repeating) task - 1m      Missing information: what time range has been checked
- [x] Fearing to lose a task by not being able to make it repeatable: 3 - gefixt
- [x] Not being able to drag multiple items at once in the topic view - 16m - gefixt
- [x] ot being able to drag multiple items at once in the planned view - 30m - gefixt
- [ ] Cannot order/sort the tasks/topics on the topic view - 23m
- [ ] It does not feel right to Complete or Delete tasks that are just irrelevant (due to not necessary, deadline, no resources, etc.) - 12m

## Import/export:

- [ ] The week planning is missing from the MarkDown - 6m
- [ ] After saving a new document in .json, it does not remember the file name to save to the .yaml and .md files - 1m
- [x] Having to rename the file every time it is saved (the filename is not remembered on load): 11 - gefixt
- [x] Not being able to load the file from the weekly list: 1 - gefixt
- [x] Not being able to extract the text from the Weekly View (export or Copy): 4M - gefixt
- [x] not showing that the json is not up to date. 5m - gefixt      Make hash at load, and during handling (so undoing a thing will reset it to load state).     Can I make the load order-independent? Maybe sort the tasks by id, and the topics... should be ordered? Except for the subtopics-order. Also by ID.
- [x] Needing to save the markdown, yaml and json all separately - 30m - gefixt?
- [ ] Cannot partially add a markdown/json file to a topic (create the tree there from the json/merge two jsons) - 1m
- [ ] Cannot export the tree within a topic  - 0m

# Uncategorized:

- [ ] The UI does not look professional -1m
- [ ] The Dark Mode does not work correctly -1m
- [ ] There needs to be some feedback on when something was done (an event log) - 1m
- [ ] Make UI look professional
- [ ] Make Dark mode work
- [ ] Adding processes as tasks (this is again a type of supertask/subtask)
- [ ] Track different activities (need daily planning + completion timings)

