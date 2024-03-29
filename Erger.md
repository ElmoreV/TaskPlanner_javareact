m = minor
M = Major

# Open:

## Legend

## Major issues

- The data is lost when something in React is changed - 1M

## Relaying information

- It is unclear where a duplicated task is already (is it already duplicated?) -5m
- Hide completed items is not saved when changing views: 4m - bevroren
- Repeated tasks do not show last completion/cannot retain information about when the next time would be - 3m
- Not clearly seeing on what level a task is exactly (maybe needs guidance lines?) - 2m+
- Not being able to peek in a list of folded topics: 2m
- Not being able to just have a list of all tasks (with filters): 2m
- Not being able to collapse or fold all the topics with one button: 2m
- When showing only uncompleted/repeated tasks: minimize/remove/concatenate topics that are irrelevant/empty - 2m
- In the weekly view: hide completed tasks is always unchecked - 2m
- Not being able to see statistics of the topic in the topic view - 2m
- Ability to hide planned items - 2m
- The weely view doesn't show all the topics of the task at hand: 1m
- Not being able to see what is scheduled and what not in the topic view - 1m
- Not being able to show repeated and completed tasks: 1m
- Not being able to search for a task (search bar) - 1m
- After folding/unfolding, the mouse is not over the same topic anymore: 1m
- Do not know which Tasks are Blocked by other people- 1m
- It does not feel right to Complete or Delete tasks that are just impossible (due to not necessary, deadline, no resources, etc.) - 1m
- There is no way to create a task and it's subtasks. Topics shouldn't be supertasks. - 2m


## Modifying information

- Not being able to drag multiple items at once - 16m
- It takes a huge time to drag a task from the top to the bottom - 6m
	- Use hierarchical instead (but it's not ideal, it still is annoying)
	- Maybe do a .. hide all tasks or something
- Not being able to duplicate multiple tasks at once (forgetting which tasks are already copied): 6m
- Not being able to remove items from the weekly list on the weekly list: 4m
- Not being able to duplicate-drag tasks to other topics without stopping midway/taking a long time/being annoyed: 3m
- Not being able to partially complete a task - 3m
- Adding a task, while only showing repeated tasks, should add a repeated task: 3m
- Not being able to have a main task and subtasks - 2m
- When sorting all the new tasks - giving them a place - it was hard to find my way around. 2m
- Not being able to edit task text on the weekly view - 2m
- Cannot order the tasks/topics on the topic view - 3m
- Dragging on the planning list has the wrong visual feedback when dragging downwards - 2m
- Not being able to make a new root topic when the button is not in view: 1m
- Text editing tends to slow down if you type more - 1m
- Delete and duplicate should be near each other. Completed and repeated should be near each other: 1m
- There is no easy way to deduplicate a duplicated task - 1m
- Cannot mark a task as Blocked - 1m
- Cannot mark a task as Impossible - 1m
- Dragging a task (in planned list) below the entire list, should put it at the bottom.

## Import/export

- Needing to save the markdown, yaml and json all separately - 6m
- After saving a new document in .json, it does not remember the file name to save to the .yaml and .md files - 1m

# Gefixt

- Not being able to complete tasks on the weekly view: 1 - gefixt
- Not being able to mark a weekly task as 'planned in the daily view (or locally)' - 4m - gefixt
- Having to rename the file every time it is saved (the filename is not remembered on load): 11 - gefixt
- Not being able to load the file from the weekly list: 1 - gefixt
- Fearing to lose a task by not being able to make it repeatable: 3 - gefixt
- Not seeing the repeated tasks: 2 -gefixt
- Topic view task text is too long: 3m - gefixt (opnieuw)
- Not being able to order the Weekly View tasks - 2M - gefixt
- Not being able to clear all completed items from the weekly list: 2M - gefixt
- Not being able to extract the text from the Weekly View (export or Copy): 4M - gefixt
- The weekly view names are too large and go to the next line (but don't make the task bigger): 5m - gefixt
- Fearing that the knowledge that I completed a repeated task gets lost/ not showing that the json is not up to date. 5m - gefixt
	- Make hash at load, and during handling (so undoing a thing will reset it to load state). 
	- Can I make the load order-independent? Maybe sort the tasks by id, and the topics... should be ordered? Except for the subtopics-order. Also by ID.



