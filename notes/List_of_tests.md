# Tests

This is a list of tests that I should run in the UI to check the compatibility.

## Creation

- [x] Add task on a tag, creates a new task in that tag, on the top of the existing task list.
- [x] Add tag on a tag, creates a new tag in that tag, on the top of the existing tag list.
- [x] Add root ropic will create a new root tag on the top of the existing root tag list.

## Read

Show all tasks  
Show all tags  
Show duplicate tasks  
Show all names  
Show completion status  
Show planning status  
Show hover over  
Show clicking  
Show dragging cursor  
Show

## Modifying task/tag attributes

- [x] Double-clicking on a tasks name, will open a text edit for that task.
  - [x] Clicking outside of a open text edit, will update the name, and close the text edit.
  - [x] Pressing enter, will update the name, and close the text edit.
  - [ ] Pressing escape, will close the text edit, without updating the name.

Plan/unplan task  
Complete/uncomplete task

- [x] Double clicking on a tag name, will open a text edit for that tag.
  - [x] Clicking outside of a open text edit, will update the name, and close the text edit.
  - [x] Pressing enter, will update the name, and close the text edit.
  - [ ] Pressing escape, will close the text edit, without updating the name.

Fold/unfold tag

## Modifying tasks

- [x] Dragging task to task (inside a tag)
  - [x] if the task is not yet in the target tag, will move the task inside the target tag, just above the task on which it was dropped.
  - [x] if the task already has a duplicate in the target tag, will remove the task instance from the source tag.
- [x] Dragging task to tag
  - [x] if the task is not yet in the target tag, will move the task inside the target tag, at the top of the list
  - [x] if the task already has a duplicate in the target tag, will remove the task instance from the source tag.
- [ ] Dragging task to task (as a subtask in a task)
  - [x] if the task is not yet in the target supertask, will move the task inside the target supertask, just above the task on which it was dropped.
  - [ ] if the task already has a duplicate in the target supertask, will remove the task instance from the source.
- [ ] Dragging subtask to subtask
  - [ ] if the subtask is not yet in the target task, will move the subtask inside the target subtask, just above the subtask on which it was dropped.
  - [ ] if the subtask already has a duplicate in the target task, will do nothing
- Duplicate drag task to tag will

  - [x] if the task is not yet in the target tag, will duplicate the task inside the target tag, at the top of the list
  - [x] if the task already has a duplicate in the target tag, will do nothing

- [ ] Duplicate drag task to task (inside a tag) will:
  - [x] if the task is not yet in the target tag, will duplicate the task inside the target tag, just above the task on which it was dropped.
  - [ ] if the task already has a duplicate in the target tag, will do nothing
- Duplicate drag task to subtask
- [x] Dragging tag to tag will
  - [x] if the tag is a supertag of the target tag, will not move the tag
  - [x] if the tag is not in the target tag, will move the tag inside the target tag, at the end of the list
- [ ] Dragging task to root tag list
- [ ] Dragging tag to root tag list

## Selection

- Clicking on any task will select that task.
  - Clicking on a second task will also select that task
  - Clicking on the same task again will deselect that task
- Dragging a selection of tasks to a tag, will move all tasks in order to the top of that tag
  - If the task is already in the tag, it will be moved in the order that everything was selected
- Dragging a selection of tasks to a task, will move all selected tasks to the tag in which the task is, above the task on which it was dropped.
- Dragging a selection of tasks to subtasklist, will move all tasks in the subtasklist, in order, above the task on which it was dropped.
- Clicking outside any tag or task, will deselect all tasks
- If the selection is moved to a place where it isn't visible, deselect all tasks.
- If the selection is moved to a place where it is visible, keep all tasks selected.
- If the name edit of a task or tag name is activated, the selection will be deselected.

## Deleting

- Deleting tag
  - Deletes all subtags
  - Deletes all tasks that do not have another tag
  - Deletes all duplicates in different tags
- Deleting root tag
  - Deletes all subtags:
  - Deletes all tasks that do not have another tag
  - Deletes all subtasks of all tasks that were deleted, if they do not have another supertask or tag
- Deleting task
  - Deletes all subtasks that do not have another task
  - Deletes all duplicates in different tags or as subtasks of other tasks
