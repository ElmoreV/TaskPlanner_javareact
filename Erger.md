m = minor
M = Major

# Open:

## Legend

- :green_heart: : dragging/duplicate dragging issues
- :yellow_heart: : Bad UI/UX Design
- :blue_heart: : needs task filtering
- :heart: : Unimplemented information in data structure
- :orange_heart: :Leftover
- :purple_heart: : Related to subtasks

## Major issues

- The data is lost when something in React is changed - 1M

## Relaying information

- :yellow_heart: It is unclear where a duplicated task is already (is it already duplicated?) - 10m 
- :heart: Repeated tasks do not show last completion/cannot retain information about when the next time would be - 8m
- :yellow_heart: Not being able to collapse or fold all the topics with one button: 8m 
- :blue_heart: Hide completed items is not saved when changing views: 4m - bevroren
- :yellow_heart: When showing only uncompleted/repeated tasks: minimize/remove/concatenate topics that are irrelevant/empty - 3m
- :purple_heart: There is no way to create a task and it's subtasks. Topics shouldn't be supertasks. - 3m
- :yellow_heart: Not clearly seeing on what level a task is exactly (maybe needs guidance lines?) - 2m+
- :yellow_heart: Not being able to peek in a list of folded topics: 2m
- :blue_heart: Not being able to just have a list of all tasks (with filters): 2m
- :yellow_heart: Not being able to see statistics of the topic in the topic view - 2m
- :blue_heart: Ability to hide planned items - 2m
- :blue_heart: Filtering is not available when in the middle of a large list - 2m
- :heart: Do not know which Tasks are Blocked by other people- 2m
- :yellow_heart: The weely view doesn't show all the topics of the task at hand: 1m
- :blue_heart: Not being able to see what is scheduled and what not in the topic view - 1m
- :blue_heart: Not being able to show only repeated and only completed tasks: 2m
- I sometimes find a duplicate task that I made myself -2m
	+ The abiltiy to merge tasks?
- :yellow_heart: After folding/unfolding, the mouse is not over the same topic anymore: 1m
- :orange_heart: Not being able to search for a task (search bar) - 1m

## Modifying information

- :yellow_heart: Not being able to duplicate multiple tasks at once in Topic View (forgetting which tasks are already copied): 10m
- :green_heart: It takes a huge time to drag a task from the top to the bottom - 10m
	- Make dragging hide all other tasks instead (but it's not ideal, it still is annoying)
	- Sort the tasks one level down each time
	- Open folded topics by hovering over the topic
	- Maybe do a .. hide all tasks or something
	- Main issue, I cannot scroll during dragging
- :heart: It does not feel right to Complete or Delete tasks that are just impossible (due to not necessary, deadline, no resources, etc.) - 8m
- :orange_heart: Cannot order/sort the tasks/topics on the topic view - 7m
- Removing items from the planned list or completing an item, does not unschedule them - 5m
- :green_heart: Not being able to duplicate-drag tasks to other topics without stopping midway/taking a long time/being annoyed: 3m
- :purple_heart: Not being able to partially complete a task - 3m
- :yellow_heart: :blue_heart: Adding a task, while only showing repeated tasks, should add a repeated task: 3m
- :purple_heart: Not being able to have a main task and subtasks - 3m
- :green_heart: Dragging on the planning list has the wrong visual feedback when dragging downwards - 3m
- :heart: Cannot mark a task as Blocked - 2m
- :green_heart: When sorting all the new tasks - giving them a place - it was hard to find my way around. 2m
- :purple_heart: There is no way to have a planned task (3x sport in a week) and complete it partially - 2m
	+ e.g. sport_1 is completed, sport_2 missed deadline, sport_3 scheduled - 2m
- :orange_heart: Not being able to make a new root topic when the button is not in view: 1m
- :orange_heart: Text editing tends to slow down if you type more - 1m
- :yellow_heart: Delete and duplicate should be near each other. Completed and repeated should be near each other: 1m
-  :yellow_heart: There is no easy way to deduplicate a duplicated task - 1m
- :green_heart: Dragging a task (in planned list) below the entire list, should put it at the bottom. - 1m
- Inability to add comments to a (repeating) task - 1m
	+ Missing information: what time range has been checked


## Import/export

- Needing to save the markdown, yaml and json all separately - 21m
- The week planning is missing from the MarkDown - 5m
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
 - Bug: source_supertopic is undefined in moveTopic - gefixt
- :green_heart: Not being able to drag multiple items at once in the topic view - 16m - gefixt
- :green_heart: Not being able to drag multiple items at once in the planned view - 30m - gefixt
- :blue_heart: In the weekly view: hide completed tasks is always unchecked - 2m - gefixt
- :yellow_heart: Not being able to remove items from the weekly list on the weekly list: 4m - gefixt
- :orange_heart: Not being able to edit task text on the weekly view - 3m - gefixt
