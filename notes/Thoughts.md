# Interesting thoughts

## Properties of tasks

### General overview

See completion of a task as a search algorithm. There are many paths to take to an end point. And in completion of a task, there are many ways to complete a task. I first confused the way to complete a task and the goal of a task. They look and taste almost the same, but are different in some fundamental ways, which I try to find here.

Example goals that confuse me:

- "Improve yourself for 1 year"
- "Make the world a better place"
- "Sleep 8 hours every day"


Actions that confuse me:

- "Write for 2 hours"
- "Change for 2 hours?"


Dimensions of a task:

- What is the purpose of a task? Why is this task there? Does this generate value? What is the reward or punishment behind it? What is the motivation to do it?
- What would complete the task? What would fulfill a task?
- How to implement a task? What is the way to complete it?
- Is this task changing? Does the target or threshold change?
- How does it relate to planning or scheduling?
- How to tasks relate to improving systems?
- Do we know or believe that we can do it?


Description | Target-based | Threshold-based| Both |
------|--------|---------|-----|
|Question they answer:| Why do we do this?||How do we get there?|
|Synonym1|Outcomes|? |Systems|
|Synonym5|'end point'|'dead end'|'paths' or 'ways'|
|Synonym6|end|?|means|
|Synonym7|result|activity|activity|
|Can be scheduled|No|No|Yes|
| Can be exactly planned / controllable|No|Yes||
| Good for progressing|No | No |Yes|
| Good for planning | Yes | Yes|No|
| When completed: will add result/value|Yes|No|No|
| Can be improved| No| Yes|Yes|
|Analogy in work|Rewarded for result| Rewarded by the hour||
|Can be scheduled| No| Time spans||
|Time spent||||
|Complexity|The amount of unknown| The effort of doing it||
|Analogy: travelling|The end point B| The path from A to B||
|Interaction goal/action| One goal may need many actions| One action can serve many goals||
|Idk|A goal creates dependencies|An action can be improved||
|...|A goal is a test|The action is the skill needed.||
|Endless?||Possibly|Possibly||
|Continuous|Repeated|Always||
|Example 1|"A suitable API Framework is chosen"|"Researching the internet for a good API Framework"||
|Example 2|"The optimal shape for the ball is found."|"Finding the optimal shape for a ball by trial and error" ||
|Example 3| "The product is sold"|"Finding buyers for product"||


**Threshold-based/activity** 

- Needs a target to give a whole picture.
- Will never really be *done* unless a target (or time span) is connected to it.
- Working on this task will complete it. (Avoiding not working)
- Completion might be clear (I did the action 50% of the time planned), but progress is not (you will never reach target.)
 You can never say you will never cross the threshold. Just say it's unlikely.)
- Complexity here is the effort expended for doing the task
	+ I'm unsure about how this factors in
- There may be many ways/paths/implementations from A to B



**Goals**

- If you complete this, you are *done*.
- Working on this task may not complete it.
- Like: Being paid for the job finished
- Relatively unknown if reached within time/budget goal.
- Needs actions/processes to complete goal.
- Fits very well with a deadline
- Can either be all-or-nothing or percentages with subgoals or using some time/effort estimation.



### Purpose vs implementation

It's simple, the purpose is the supertask, the implementation is the subtask. 

Example:

- Buy a car
	+ Look around for a car for 2 hours online
		* Go on the internet
			- Walk around and search laptop
			- Find my laptop
			- Open laptop
			- Open browser
		* Go to car searching website
			- ....
		* ...
	+ Go to car dealer
	+ ...
	
Example 2:

- I want to continuously improve
	+ Reflect on systems and activities every week
		* Remember what I have done
		* ...


It can be done in a sentence:

"I need to reflect every week to continuously improve" or "I want to continuously improve, so I need to reflect ... every week."

#### Root goals

Root goals

Product-based work, will try to finish the product and make as many of the with a tradeoff (time/schedule/fast)/(budget/cheap/money)/(scope=quantity+quality=good).


#### Subtasks vs. supertasks

It can be easily misused to allow goals and actions to be intermixed.

It would need to be called subgoals and subprocesses/actions.

||Supertask|Subtask(s)|
|-|-|-|
||Gives purpose|Implementation|
||The End|The means|
||Epic|User story|
||User story|Tasks|
|Value|Generates value|Might not generate value|
|Production|Product|Process|


### Verifiability/testability of goals

||Goals|Actions|??|
|-|-|-|-|
| Clear on what to do| No | Yes||
| Clear when it is completed| Yes| No |Yes|
| Clear if it can be completed| No | No |No|



This is basically: is it clear when it is completed? There are some ways to do this.
Is the goal very clearly defined? What is the definition of every word?

#### Target values


#### Thresholds


Goals are complete when conditions are met.

Conditions can be:

- continuous (measuring an objective (value) or subjective (opinion) metric along a time span)
- discrete (measuring a metric at a snapshot)

Every goal can be completely decomposed in continuous or densely repeated discrete subgoals. 

Deadline is another thing: it described when it's impossible to complete.



Goals can be completed:

- Timing: unspecified - when all the subtasks are done
- *Timing: cont. limited - when a subtask has been going on for as long as the time span'*
- Timing: cont. infinity - when all subtasks are being completed until its impossible

Theorem:

Every goal will eventually be reduced to a condition based/threshold based goal.




#### Static and changing goals


There is something fishy here. There is something about goals and actions and infinity/neverending that doesn't seem right. There is a part of meaning and purpose in there. A part of doing vs. wanting. A parts of the process as the goal. Never the goal as the process. Is there an overarching framework? Is the RL framework a good framework for this?

What I was seeing were 2 things:

- The achieving of a target value vs. the avoiding of a threshold/a limit/failing a condition.
- The threshold value being static or changing.


- 'Goals' were the achieving of a threshold/target
	+ Add a button to the UI (target = verifiable: I can click button)
	+ Improve cardio by 3% every week (target = now*103%)
	+ The product is sold (target = transaction completed)
- 'Actions' were the avoiding of a threshold/limit
	+ 
	+ Improve cardio every week (avoid the *changing* threshold of good you were are cardio before)
	+ Improve anything (avoid the ***changing*** threshold of being worse than before)
	
- Some were confusing, because they are kind of both.
	+ Sleep for 8 hours
		* Target to reach: 8 hours
		* Threshold to avoid: being awake
	+ Stay working on this task for 2 hours (avoid the 'don't work' threshold)
		* Target to reach: 2 hours
		* Threshold to avoid: not working
	+ Researching internet to search a good framework
		* Target to reach: find a good framework
		* Threshold to avoid: not researching internet
				
I have the feeling that avoiding threshold tasks and changing threshold tasks are the most tiring/exhausting.
It depends, if avoiding the threshold is the status quo (don't work, don't do drugs), it's relatively easy. However, during an addiction, actually the (don't do drugs) is the more difficult threshold to avoid. So threshold-based tasks that you are already above naturally are easy. Threshold based tasks that you do not meet are definitely more difficult. First you need to hit a target and then keep it.

##### Improvability

To create improvement, you must be able to quantify it in some way. Even just a "I don't know how this would be done" to "I know how it could be done" is an improvement.

This is the trackable part. It can be a specific value, an ordinal value (a ranking of understanding), a step towards understanding, or even just one of the many conditions to be achieved.

TODO: How do I decompose progression vs. improvement?


### Progression (how to measure)

#### TODO

### Plannability?

### Schedulability?

### Duration

#### TODO

#### Complexity

Complexity makes the amount of time and effort spent more difficult to estimate. It might not be longer, but the actual time may just be more off from the estimated time.

### Motivation/effort

Some tasks are just more difficult to do

- Require focus
- Require effort
- Are not mentally stimulating
- Take too long without seeing results.

#### Reward/Punishment

- Satisfaction
- Completion of a supertask
- If there is no higher goal, the task is useless, or a core goal.

### Repetition

- Repeated - when the subtasks are done every time
- Repeated inf. - when the subtasks are done every time until it's impossible.


Can be:

- Continuous limited (until done/ reach target)
- *Continuous limited (time span/ will not reach target)*
- Continuous infinity (until impossible / never reach target)

Repeated limited (every week, for a year):
- Repeated (every week until done)
- Repeated + cont. limited (Monday for 2h, every week)

Repeated unlimited (every week, until impossible):
- Repeated unlimited (every day, do this)
- Repeated unlimited + deadline (before Monday, every week)
- Repeated unlimited + cont. limited (Monday for 2h, every week)


Or a hybrid

Examples:

- "I want to get a Spanish B2 certificate"
- *"I want to practice Spanish 2 hours" (time span)*
- "I want to practice Spanish until I die" (until impossible)
- "I want to practice Spanish every Monday" (repeated + time span

### Organization/person/group

who benefits from the goal fullfillment?

### SMART goals

Smart goals are a way to solve goals, but it conflates a couple of parameters:


- Specific (testable: true/false result. Not a maybe result.)
- Measurable/trackable
- Attainable/achievable/realistic/reasonable/resourced (realistic given the resources (skills/budget/time))
- Relevant/strategic (purposeful/contextual)
- Time-limited/based/oriented/bound/sensitive/frame

- Responsibility/assignable/agreed
- Emotions: aggressive/ambitious/motivating

- Results-based vs. action-oriented

- 


## Relations between tasks

### Dependencies (internal + external)

- Direct dependency, cannot do one without the first having happened (by protocol or causally)
- Correlation (one will complete easier when the other has been done, e.g. automating one part)
- Anticorrelation (if one is completed, the other one is less important/unnecessary)
- Mutually exclusive (if one will be done, the other one will be impossible (some contrained resource, like money, time, etc.)


#### Internal

Internal dependencies: tasks are dependent on each before they are ready to start.

The dependencies I know of are:

- Branching paths: doing one path might make the other path unrewarded work
	+ To get a girlfriend, you either
		* go outside and find a girlfriend
		* go online and find an online girlfriend
- Causal dependencies: completing one task is necessary for the other task
	+ You first need to go outside to hug a tree
- Diminishing returns: doing the other task first would be more efficient (organizing/planning/automation)
	+ Automating task planning, would reduce the time spent planning tasks, but you need to first develop the task planning
- Informational dependencies: one task might be irrelevant if the other task is done
	+ If I understand how to make a wheel, I don't need to reinvent it
- 

Async tasks:

- Task 2 cannot be started when Task 1 is not finished (Singleton resource from task 1)
- Task 2 cannot be finished until Task 1 is finished (Resource from task 1 dependent)
- Task 2 cannot be started when Task 1 is not started (Resource from task 1 dependent.)
- Task 2 cannot be finished when Task 1 is not started. (Must not reach target tasks)

- Also a way of asynchronous tasking will make the dependence weirder (partial task frees up another task.)




#### External

External dependencies: tasks are dependent on resources (physical, digital or informational) of another person until they are ready to start.





### Categorization


#### Topics vs. Super/subtasks

It seems like every task will have a certain influence on certain other tasks. These interrelations are often captured in topics. If there is some overarching goal or process, you could also subdivide it in there.



- The main goal/purpose it is working towards
	- Working = goal of other people to get money for yourself to do interesting stuff on the side/have a retirement
- What is the activity you are doing (cycling, programming, planning, sleeping, gaming, reading, mindmapping, buying something)
- Who is involved? (parents, friends, only you, colleagues)
- What condition is necessary for it to be done (near a computer, outside, inside, during the day, during the night, near my tools, shops need to be open, high/low motivation, high/low stress)

So to categorize tasks, there are different possibilities:
1. Overarching Goals
2. Overarching System or Process
2. People that benefit from this task
3. Tasks that are dependent on each other (the second one relies on the completion of the first)
4. Correlated tasks (improving one automatically improves the other)
5. Type of action the task requires (learning/reading/going shopping)
6. People involved in the task
8. Location where task can be completed.

#### Root topics

This are the most abstract topics that are available. There seems to be a bit of a conflict between a root topic and a root goal. Root topics can be a part of:

- A largest group of people it affects
- The biggest system that is involved
- The general action it involves (intake/output/etc.)
- The root goal that it progresses towards.

### Priorities

### Multitasking

### Concurrent task execution

## Task workflows

### Planning


### Scheduling

I define scheduling as allocating time to do anything that works towards completing a goal. That makes it a threshold-sub-goal. (Do not work on anything else for x amount of time.) 

#### When can a goal be scheduled?

#### Unexpected events


### How can I do meta-planning well in the taskplanner? Continuous task-list? What would be a good flow?


#### Replanning

1. Clear all completed(is also unscheduled) items from the planned list
2. Unschedule all (really unscheduled) items
3. Unplan/resort a few tasks from the bottom of the planned list
3. Add all task and time-planning tasks from the list
4. Collect all tasks
5. Prioritize tasks by sorting them
6. Schedule tasks

#### Rescheduling

1. Items that were not completed: unschedule or Impossible them
2. Reprioritize them
3. Reschedule tasks for until next Replanning

#### Explanation

Note: scheduling is only a thing for a time-span. You can schedule a day, a week. But after a while, the schedule is ruined. What do you do? You create a new schedule, but some tasks are still scheduled, some are not. Do you reschedule everything? You need an end horizon for this maybe. How do you handle repeated items within the time span?

The planning view is a snapshot of what needs to be done. The topic view is a snapshot of how or why it needs to be done. The scheduling would be a when does it need to be done. The scheduling part is the most volatile view, then the planning view, then the topic view.


### How is 'improving a process' formulated as a task?

#### TODO

# Still needs to be incorporated

## Confusion between types of tasks

Description | Target-based | Threshold-based| Both |
------|--------|---------|-----|
|Question they answer:| Why do we do this?||How do we get there?|
|Synonym1|Outcomes|? |Systems|
|Synonym2|Products|?|Process|
|Synonym3|'Tasks'|? |'User stories'|
|Synonym4|Value| Punishment|Implementation|
|Synonym5|'end point'|'dead end'|'paths' or 'ways'|
|Synonym6|end|?|means|
|Synonym7|result|activity|activity|
| Purpose / make sense | Gives the purpose | |Gives the way there |
|Can be scheduled|No|No|Yes|
| Can be exactly planned / controllable|No|Yes||
| Clear on what to do| No | Yes||
| Clear when it is completed| Yes| No |Yes|
| Clear if it can be completed| No | No |No|
| Good for progressing|No | No |Yes|
| Good for planning | Yes | Yes|No|
| When completed: will add result/value|Yes|No|No|
| Can be improved| No| Yes|Yes|
|Relation to change|Change|Can change |Change|
|Analogy in work|Paid for result| Paid by the hour||
|Way to complete it | Planning it and doing the actions | Doing it ||
|Can be scheduled| No| Time spans||
|Can be made obsolete|Deadline|Possible time spans||
|Time spent||||
|Complexity|The amount of unknown| The effort of doing it||
|Analogy: travelling|The end point B| The path from A to B||
|Interaction goal/action| One goal may need many actions| One action can serve many goals||
|Idk|A goal creates dependencies|An action can be improved||
|...|A goal is a test|The action is the skill needed.||
|Endless?||Possibly|Possibly||
|Continuous|Repeated|Always||
|Example 1|"A suitable API Framework is chosen"|"Researching the internet for a good API Framework"||
|Example 2|"The optimal shape for the ball is found."|"Finding the optimal shape for a ball by trial and error" ||
|Example 3| "The product is sold"|"Finding buyers for product"||


**Threshold-based/activity** 

- Needs a target to give a whole picture.
- Will never really be *done* unless a target (or time span) is connected to it.
- Working on this task will complete it. (Avoiding not working)
- Completion might be clear (I did the action 50% of the time planned), but progress is not (you will never reach target.)
 You can never say you will never cross the threshold. Just say it's unlikely.)
- Complexity here is the effort expended for doing the task
	+ I'm unsure about how this factors in
- There may be many ways/paths/implementations from A to B



**Goals**

- If you complete this, you are *done*.
- Working on this task may not complete it.
- Like: Being paid for the job finished
- Relatively unknown if reached within time/budget goal.
- Needs actions/processes to complete goal.
- Fits very well with a deadline
- Can either be all-or-nothing or percentages with subgoals or using some time/effort estimation.



## Impossible tasks
Goal/Action
|Can be made obsolete|Deadline|Possible time spans||


What ways can a task become impossible to do?

- Outside of the possible times (season, time of day, month)
- Conditions are not available (no rain, no sun)
- People unavailable

There is also the possilbity of a task becoming irrelevant

- Higher goal has changed

# The psychology of Task Planning.

1. Distinguish between urgent and important tasks
2. Don't do tasks that just spent time on your todo list
3. Celebrate your completed tasks

There are a bunch of micro-tasks that all take just a couple of minutes, but turn out to take a lot of time collectively. Is it better to do them after each other? Or to spread them out?

Source:
http://webcache.googleusercontent.com/search?q=cache:https://medium.com/age-of-awareness/the-3-lists-you-should-be-making-f22a47a52bd7&strip=0&vwsrc=1&referer=medium-parser
Source for more:
https://gretchenrubin.com/articles/how-to-tackle-a-nagging-task-power-hour/




# Systems/processes vs. goals.

Are processes just a series of goals to keep in mind? Or how does this work? What are processes??

What are the differences between the user stories and tasks?


User stories:
As a [individual] I want [intent] so that [higher purpose]

The individual is the one who benefits from the goal being completed. The intent is the goal of the individual. The higher purpose is the supergoal.


Understand https://www.atlassian.com/agile/project-management/user-stories

1. Userstories define a goal, who the goal is meant for, and the supergoal.
2. Definition of done/acceptance criteria: How to test if it is done? What are the targets, conditions or threshold? Define with who the goal is for.

A process is a series of steps. Basically a series of tasks to complete.

A system is a collection of processes? What makes a system different from processes?
Processes seem to be synchronous/sequential.

Systems are asynchronous. So maybe contain multiple steps that run simultaneously.

A process does not solve the end goal. Systems solve the end goal?

Open and closed systems: contained and no interaction or interacting outside of the boundaries.

Systems are interconnected...

Processes are input->process->output

Systems are inputs+outputs+feedback+processes.

Read:  “The Fifth Discipline” by Peter M Senge. 1990.

A systems diagram can also show values, and their influence on other factors (positive/negative) + delays.

https://www.educative.io/blog/software-architecture-diagramming-and-patterns

Diagrams have different purposes for different people. This factors into the "For whom and why do we make this documentation?"


Back to systems and processes.

Processes are a sequence of tasks, and will be finished when it reaches the output.

Two processes that are the same can run simultaneously.

A system is not necessary that multiple similar processes run. But that two orthogonal processes run? What makes a process different from another process? 
- Different goal?
- different person?
- 50% information exchange?


#### Goals vs. implementation

- Goal: we don't know how to do it. And we don't know if we can do it.
- Task: we know that we can do it.

#### States of the task

- Unplanned 
- Planned
- Planned & Scheduled
- Verifying completeness (if this takes time)
- Finished



## Who does it matters

Depending on how you phrase the task, the criteria of having it done is different.

1. The bathroom needs to be cleaned once every 2 weeks.
2. I need to clean the bathroom every 4 weeks. (my roommate will clean it every 4 weeks in between.)



## How to reduce cognitive load while planning OR how to only see the most important tasks.

1. We need to see only the most important things. When we are not busy with something, we should be able to plan/schedule it but not worry about the details yet. Especially when it's blocked by another task.
2. Of course, it's good to have an overview of everything that would be good to have. You need to have some way to relax, but the exact implementation would be free.


## Timing, what would the lowest set of instructions be to get the most amount of reliability?

Assumptions: the units of time that people care about are
- Day
- Month (is not always 30 days)
- Week
- Year
- Day of week (business days vs weekends)

People do not care about
- Hour, minute, second

I want to have a system that can handle all of the schedules.
Each scheduling event is a set of days given some offset. 

It might be:

- Every x days (tasks that do not remove everything that is generated)
- x days after last completion (maintenance tasks that remove everything that is generated)
- Every x days, which doubles?
- Completely custom schedule (with memorization tasks)

But yeah, it's not just a set of dates. It's a set of dates with some conditions.

It needs to be able to do lot's of different schedules based on all different combinations.
But also needs to be consistent?

In this case, there is also a difference between automatic task execution and manual (fallible) task execution.

Maybe just start with the easy ones:
- Every x days
- x days after last completion


# What would the perfect UI look like?

What task can you focus on?

- Collecting tasks from another source
- Importing tasks
- Categorizing/tagging tasks
- Generating subtasks
- Evaluating/modifying tasks
- Selecting tasks
- Prioritising tasks
- Updating task list with progress
- Seeing everything you did in the past.
- Time planning of tasks
- Cleaning up task list.



## 1. Collecting new tasks/importing new tasks (Current tree view/full view)

- Have a way to quickly add new tasks
- Have a way to quickly add a batch of new tasks

## 2. Categorizing/tagging tasks (currently Tree view/full view)

- Easy search for a tag/topic/task
- Easily tag tasks
- Easily categorize tasks

- Especially categorize tasks without categories.


## 3. Selecting tasks (current Tree view/full view + a bit of )

- Needs to be able to filter really good and really quick.

A task is ripe to be done when:

1. It should be done after a certain time (like cleaning)
2. It should be done before a certain time (e.g. deadline)
2. It is important
3. It is a task on which an important task is dependent.
4. It is a subtask of an important task
3. It is already scheduled (event)
4. The conditions are right. (opportunity)
4. It needs to be done, might as well do it now.
5. There is just a want to do it. (interest)

A task might be skipped if:

1. It takes a lot of energy
2. It takes a lot of time
3. The conditions aren't right.
3. It doesn't add something of value
4. Something else has a higher priority
5. It is impossible
6. The task has changed/might change.

## 4. Prioritising tasks

## 5. Updating tasks/completing tasks (Currently list view)

- When completed: update tasks/generate new tasks/etc. etc.
- When conditions change/priorities change: change priorities

## 6. Time planning tasks (Not implemented yet)


## 7. Task management

- Deleting/Sorting/editing tasks in general.