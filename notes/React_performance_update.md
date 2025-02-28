# Important concepts:

## Memo: 

Only re-render this component if its props actually changed (based on a shallow comparison/’pointer’ comparison or exact value comparison).
Comparison = Object.is(a,b)
So:
	- All prop values are the same references
	- All prop values are the same primitives

Usage:

```js
export default memo(
	function ComponentToMemoize (props){
	// ….
	}
)
```

## Recreation of functions in JS:

- If you create an inline function/anonymous function when passing a prop, it will create a new 'reference' every render.

### Bad example for memoized: create new function on render
```js
export default memo (
	function MemoizedSubcomponent(props)
	{
		//...
	}
)

------

function Component(props)
{
	// this function is created anew when Component is rendered
	const agreeWithMe = () => {return true;}
	<Subcomponent
		{/* will always be different, memoization is useless */}
		reviewWork = {agreeWithMe} 	>
	
}
```

### Good example for memoized: create function outside of component

```js
export default memo (
	function MemoizedSubcomponent(props)
	{
		//...
	}
)

------
// this function is created once, when this file is imported

const agreeWithMe = () => {return true;}
function Component(props)
{

	<Subcomponent
		{/* will mostly be the same, memoization is successful */}
		reviewWork = {agreeWithMe} 	>
	
}
```

### Bad example for the memoized: create function factory outside of component

```js
export default memo (
	function MemoizedSubcomponent(props)
	{
		//...
	}
)

------
// this function is created once, when this file is imported
const getAgreeWithMe = () =>{
	// This function however will be created every time getAgreeWithMe is called
	const agreeWithMe = () => {
		return true;
	}
	return agreeWithMe
}

function Component(props)
{

	<Subcomponent
		{/* will change every time, memoization is useless */}
		reviewWork = {getAgreeWithMe()} 	>
	
}
```

### Good example for the memoized

```js
export default memo (
	function MemoizedSubcomponent(props)
	{
		//...
	}
)

------
// this function is created once, when this file is imported

function Component(props)
{
	// useCallback will prevent recreating function
	// unless the dependencies have changed
	const agreeWithMe = useCallback(
		() => {return true;},
		[/*dependencies*/]
	)

	<Subcomponent
		{/* function is cached, memoization is successful */}
		reviewWork = {agreeWithMe} 	>
	
}
```

## Recreation of arrays

- Temporary arrays are also recreated in component renders, then the arrays will also be different.

## Use setTasks with updater functions instead of directly setting a value

There are two methods of using the setTasks function:

### Example: set state by value
```
// This function should be pure to prevent weird bugs.
function updateTasks(oldTasks) {
	newTasks = [...oldTasks]
	newTasks[0].priority += 1
	return newTasks
}

const newTasks = updateTasks(oldTasks)
setTasks(newTasks)
```

### Example: set state by updater function
```
// This function MUST be pure, otherwise it will bug out.
function updateTasks(oldTasks) {
	newTasks = [...oldTasks]
	newTasks[0].priority += 1
	return newTasks
}

setTasks(oldTasks -> updateTasks(oldTasks))
```

## Combining all ideas

We want to skip re-rendering the Task component that uses a single task in the tasks-Array, if this task is not changed (but others can be changed without changing this one)

Problems that arise:

- We pass the tasks array to the Task component to allow it to change it so that we can update the state if we need to
- The tasks variable/prop is changed every time *any* Task is changed.
- the component is re-rendered every time it is called
- even when memoized, the component is re-rendered whenever the tasks array is changed by setTasks
- even when the tasks array is not passed, but other functions are created that take this tasks array inside of their closure, the functions are different
- every time a new function is created and passed, it is different in the view of memoization

The solution is:

1. Memoize the component anyway
2. Find a way to not pass tasks as a prop
3. Do not pass recreated functions as a prop
4. Use useCallback to only recreate functions when it's needed
5. Do not make the useCallback depend on the tasks-state
6. Make the useCallback independent of tasks by using an updater-function in setTasks instead.

### Bad example: using a useCallback dependent on tasks

```js
const updateTaskCallback = useCallback(
	(taskId, ...) =>{
		const newTasks = [... tasks];
		const taskToChange = newTasks.find(t => t.id === taskId)
		if (taskToChange) {taskToChange.completed = True}
		setTasks(newTasks);
	},
	[tasks,setTasks] // we should not have tasks as a dependency
)
```




## Other ideas from Mr. GPT

### Splitting state of Tasks into array of States of [TaskState, TaskState, TaskState]

- I'm somehow disgusted by this.

### Only pass taskID and not the whole tasks object.

- This might be able to be done..., but I need to add modification functions for interactivity.

