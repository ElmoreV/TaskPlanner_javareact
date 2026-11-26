Hello Agent, here you can put all your notes and communication with the other chat sessions. Feel free to edit this file, even if I say you cannot edit any files (really, I mean it, when I say don't edit code files, you can edit this text file.). :)

I will put some notes before, since there is some confusion sometimes.

# User notes

Filtering should only reduce/keep the amount of tags/tasks shown. It should never display tags under tasks or tasks under tags that weren't there initially.
Please do NOT change things when I don't ask for it. You clearly can't understand my wishes first try, even I cannot. I give you way too little information to make an unambiguous implementation. EVERY implementation detail that is not clear SHOULD be routed by me first. Otherwise you will fail your task by definition.
Please do not use aria-xx or add many small tooltips or extra text underneath all of my stuff. It's a lot of clutter. I will ask you to do this explicitly, if I want to. You could suggest it to me as a method to clarify this, but I will always need to explicitly ask or approve it.

# Agent notes (below is never read or edited by user)

## Working preferences

- Explain refactor proposals through each caller's available inputs and required
  outputs, using a comparison table and concrete code examples where useful.
- Keep README.md focused on installation, building and information that helps a
  person choose the taskplanner. Put implementation and review notes here.
- Do not use Python for this work. Use patches and the project's tooling.
- Use taskFilter for the useTaskFilter result, preserving JavaScript's .filter.
- Use supertasks/subtasks and supertags/subtags in user-facing terminology.
- Use Tag naming in version-agnostic code, including shared TaskContent; retain
  Topic naming in unambiguously V1 code, including TaskContainer. This is the
  agreed naming direction, not authorization for unrelated renaming.
- Keep filter controls minimal: no helper text, explanatory tooltips or
  aria-describedby unless requested. Check in before adding unrequested UI elements.

## Data model and tag paths

- Tags/topics form a tree: each tag has zero or one immediate supertag and zero
  or more subtags. Multiple parents and cycles are not valid tag relationships.
- Tasks form a directed acyclic graph (DAG), so a task can have multiple
  supertasks and multiple subtasks.
- A tag can have zero or more tasks; a task can have zero or more tags. Each
  task/tag membership is unique in both directions.
- Full tag paths preserve empty names as empty segments: Work, an unnamed
  subtag and Frontend produce Work//Frontend.
- getTagPaths in Tags/TagHelpers.ts accepts normalized id/name/childIds records
  and returns only id/path. getTopicRecordsV1 in Topics/TopicHelperV1.ts handles
  V1 flattening; the filter, task tag popup preparation and V1 path lookup reuse
  these helpers. The popup adds name and immediate parentId separately.
- Importing TopicHelperV1 into filterData exposes existing strict TypeScript
  errors in older topic helpers. The user explicitly left their typing fixes
  for a separate project; do not expand this refactor to fix them.

## Task component integration

TaskContainer requires a view configured in TASK_CONFIG_BY_VIEW in src/Tasks/taskSettings.ts. Its feature list selects the callbacks passed to Task; setAppData only supplies the updater. Categorize retains its existing actions, selection and last-completion display. AllTasksList enables folding and tag editing and supplies setAppData for the container's callbacks. The picker sends onTopicChange(topicId, assigned) for a single membership. TaskContainer uses useCallbackifyTopics with setTaskTopicV1Pure in ADG/ModifyFuncGeneratorsV1Idempotent.ts. That helper checks task/topic existence and current membership, copies task objects and membership arrays, and delegates to the existing atomic insert/remove operations. New memberships insert at position 1; unrelated and unknown memberships are preserved. `parentTaskPaths` supplies ancestor labels, `tags` supplies tag chips, and `selectableTags` supplies picker options. `Task` and `TaskContent` omit controls when their callbacks are absent.

## Task and tag filters

One shared bar is configured by FILTER_CONFIG_BY_VIEW in useTaskFilter.ts. Settings
are complete snapshots with three groups: matching, context and presentation.
The app keeps independent snapshots per view in React state. Filter settings
are not saved in task exports or browser storage.

### Matching

match.tasks contains task text, status categories, repeated/planned/scheduled
choices, task structure, deadline, tag source and the tagged choice.
match.tags contains selected tag IDs, persistent path search and whether
subtags satisfy matching.

Task names match case-insensitive word prefixes in any order. Selected tag IDs
combine with OR. Selected-ID and path conditions combine with AND for tasks;
different effective assignments can satisfy each condition. A directly matched
tag itself must satisfy both active tag conditions. With no explicit tag
condition there are no direct tag matches and no tag restriction on tasks.
One tag input serves both path filtering and picking. When tagPathSearch is
enabled, typing updates the persistent pathQuery and also finds suggestions.
Selecting a suggestion adds its ID to selectedIds and clears the text query.
When a view enables only tagSelection, typing just finds suggestions and
selecting a suggestion establishes the filter condition.

#### Five filter statuses

Each task has one derived filter status:

- Completed, Irrelevant and Impossible retain their stored status.
- Otherwise an unfinished task is Transitively irrelevant if all parents are
  finished or transitively irrelevant.
- Other unfinished tasks are Unfinished; parentless tasks are exempt.

The relevance calculation uses the full graph, not the already-filtered tasks.
Any uninterrupted unfinished parent path can rescue a shared task. A finished
intermediate task interrupts that path. No stored task status is changed.
Selecting no statuses produces no task matches.

Categorize and Planned initially select Unfinished and Transitively irrelevant,
preserving their existing inclusion of unfinished work. AllTasks, TaskGraph and
Add initially select all five. There are no independent hide-status checkboxes.

The Status menu groups the five exclusive categories under Unfinished and
Finished. A group checkbox selects or clears all its categories and shows a
native indeterminate state for a partial selection. The ordinary unfinished
category has no extra visible child checkbox; Transitively irrelevant does.
Finished has visible Irrelevant, Impossible and Completed children. Toggling
Transitively irrelevant alone preserves the ordinary unfinished selection.
Finished is an aggregate UI control, not an additional engine status.

The user selects earlier commits while reviewing. The current checkout uses
string filter statuses again; do not restore the separately discussed enum
experiment during unrelated edits. The user explicitly rejected an enum/string
union. If returning to the enum design, TypeScript has no enum inheritance:
ordinary members must explicitly reuse FinishedState values, with a comment
explaining manual maintenance.
TaskMatchCriteria and TagMatchCriteria are shared interfaces in FilterTypes.ts,
used by both FilterBar and the engine; keep their shapes defined in one place.
Approved readability review changes: use arrow functions in the five filter
files, direct graph/context types, read-only helper inputs, explicit task
rejection checks and descriptive ID-set names. SelectableFilterTag contains only
id/path. Keep per-view features/defaults in FILTER_CONFIG_BY_VIEW; the unused
optional hook configuration override was removed, and tests use real views.
Reviews 1, 11 and 13 are approved: adapters project only canonical filter fields,
deadlineTimestamp/deadlineFilterWindowSeconds explain units, and partial update
helpers are named patchTaskMatchCriteria/patchTagMatchCriteria. Review 14 is now
approved and implemented: tag additions/removals derive selectedIds from the
updater's previous settings so queued edits compose. Other patch calls remain
unchanged.

getTransitivelyIrrelevantTaskIds independently calculates the derived IDs from
complete normalized tasks. Callers may supply prebuilt task links to reuse them;
otherwise it builds its own. getTaskFilterStatuses only assigns filter categories.
adaptV1FilterData/adaptV2FilterData handle the two storage formats. Nonzero saved
finishStatus takes precedence; otherwise the legacy completed flag is a fallback.

TaskID and TagID are branded numeric types imported directly from Structure/IDs.ts
by each consumer; do not re-export them from FilterTypes.ts. They prevent accidental mixing during type checking;
saved IDs remain numbers. Cast them at the filter and parent-path input boundaries;
other legacy code retains its existing numeric types. TaskID|TagID documents graph
helpers shared by both namespaces.
GraphLinks<TaskID> and GraphLinks<TagID> hold separate children and parents Maps.
createGraphLinks derives both directions from childIds; every known record has
an entry in both Maps, including an empty array for roots/leaves.
collectReachableIds follows only the supplied adjacency Map and returns its full
transitive closure including the starting IDs. Its explicit queue visits each
ID once, so cycles and shared branches terminate.
relevantUnfinishedTaskIds starts with unfinished roots and follows only unfinished
subtasks. It is independent of text/tag matching and preserves the existing
alternative-parent rescue rule.

Deadline conditions are mutually exclusive: any, missing, or within an existing
interval. The effective deadline is the earliest valid deadline of the task and
its descendants, including hidden or completed descendants. Overdue tasks
qualify and the existing strict interval cutoff remains unchanged.

Task structure filters use real supertask/subtask links, including folded or filtered tasks.
Tags can come from the task alone or also every supertask; the
tagged/untagged choice uses that selected source. Inherited assignments never
become saved assignments.

### Context and presentation

One Display popup contains task context, tag visibility and subtag context. It
appears when taskContext, tagContext or tagVisibility is supported; each control
keeps its own capability check. Context and presentation remain separate in settings.

Task context independently expands ancestors and/or descendants of original
task matches. Adding an ancestor does not pull in siblings. Matching conditions,
including unchecked statuses, are not reapplied to context. Folding remains
unchanged.

Tag results consist of:

1. Direct tag matches.
2. Actual tags assigned to displayed tasks.
3. Subtags of matched tags when tag context requests them.
4. Supertag paths needed by those tags.

Extra task assignments and structural relatives are tag context, not direct tag
matches. Adding tag context does not add tasks using those tags.

The Categorize-only Show tags dropdown has four presentation modes: automatic,
all, relevant and withVisibleTasks. Categorize defaults to automatic, which shows
all tags while browsing and relevant tags while searching. Nonblank task text,
nonblank tag path text or any selected tag activates searching; status and other
task filters alone do not. getEffectiveTagVisibility resolves the mode for both
the engine and bar without changing the stored preference. Clearing a search
therefore returns to browsing automatically. Other views retain neutral relevant
visibility and hide this control.

Relevant visibility uses the tag results described above, retaining empty tag
matches and requested subtag context. All visibility adds every tag without
adding tasks. withVisibleTasks uses only actual assignments of displayed tasks
and their supertag paths, ignoring empty tag matches and subtag context. Task
context is applied before determining tag visibility. Folding does not affect
emptiness; no highlighting or automatic unfolding is added.

Show subtags in results is disabled when all tags are shown, when strict
withVisibleTasks visibility hides empty subtags, or when no tag text/selection
provides a starting point. The saved checkbox value is preserved while disabled.
Task matching through subtags remains independent.

### Integration

Keep changes small. The user discarded the split into module-level stage helpers
because its signatures and result types added too many lines. Do not restore it.
Both task-context directions start from the original matchedTaskIds, preventing
sibling expansion. Tag context uses displayed tasks; presentation-only tags are
added last.

adaptFilterData translates V1 legacy storage or V2 task/tag maps into FilterData.
It is derived input, not another React store. useTaskFilter memoizes it by the
appData reference so typing in a filter does not repeat storage adaptation. Keep complete application data for
editing, ordering and relationship lookups.

A view supplies its stored filterSettings snapshot (undefined before its first change) and setFilterSettings:

    const taskFilter = useTaskFilter(
      appData, view, filterSettings, setFilterSettings
    );

    <FilterBar taskFilter={taskFilter}>{/* Existing view actions */}</FilterBar>
    {tasks.filter(taskFilter.isTaskVisible).map(renderTask)}

Categorize also uses taskFilter.isTagVisible. FilterResult exposes only
isTaskVisible, isTagVisible and selectableTags. Matching/display ID sets remain
internal; separate context-only sets are unnecessary and are not calculated.
Tests enumerate visible task/tag IDs through the same predicates as the views.

filterTasks creates isTaskVisible and isTagVisible in its returned FilterResult.
They check whether the supplied object's ID is in displayTaskIds or displayTagIds.
useTaskFilter spreads that filterResult into its controller, which the views
store in their local taskFilter variable. There is no separate visibility store.

Updates are immutable functions so neighboring nested settings survive:

    taskFilter.setFilterSettingsWithDefaults(previous => ({
      ...previous,
      match: {
        ...previous.match,
        tasks: { ...previous.match.tasks, text: "invoice" }
      }
    }));

Both edits and Reset send updater functions to the view's storage callback.
setFilterSettingsWithDefaults supplies the view defaults when that callback's
previous snapshot is undefined. Reset uses an updater that returns the view
defaults directly; App does not need to distinguish functions from values.
Both App versions pass setCurrentViewFilterSettings directly to their active
view. It updates the map entry for the view captured by that render, including
when React queues the update. There is no repeated per-view callback wrapper.

Each view's configuration declares features and default settings together.
createFilterSettings accepts overrides with the same structure as the settings:

    defaults: createFilterSettings({
      match: {
        tasks: { statuses: ["unfinished", "transitivelyIrrelevant"] }
      },
      presentation: { tags: "automatic" }
    })

Unspecified criteria keep the common defaults. Lists and deadline conditions
replace the corresponding criterion; they are not concatenated or recursively
merged. No view-specific boolean arguments or rules are needed in the factory.

Reset restores the current view's defaults. Unsupported features are both
hidden and neutralized. neutralizeUnsupportedSettings starts from fresh neutral
settings and copies each supported feature's criteria to their explicit setting
paths. Stored settings are unchanged, and neutral values are defined only in
createFilterSettings. Configurations enable task structure in AllTasks and TaskGraph,
task context in Categorize/AllTasks/TaskGraph, and tag context/presentation in
Categorize. Styling lives in the existing task-list-header rules in index.css;
native details/summary elements provide collapsible settings without a custom
group component. Planned retains its existing membership, ordering and folding.

### Verification

The root tsconfig.json supports the app build without enabling strict checks
for legacy imports. Keep strict mode opt-in in src/Filters/tsconfig.json, which
extends the root config. Do not make the root extend the strict config again:
normal git stash leaves untracked configs in place, so strict checks would
affect committed legacy Timing.ts after its pending type annotations are stashed.
Keep the existing filter entry scope; adding all legacy source files to this
check also includes unfinished prototypes and mixed JavaScript/TypeScript.

Run the strict filter type check:

    bun node_modules/typescript/bin/tsc --project src/Filters/tsconfig.json

Run the focused engine, bar and view suites:

    CI=true bun --bun node_modules/react-scripts/bin/react-scripts.js test --watchAll=false --runInBand --runTestsByPath src/Tags/TagHelpers.test.js src/Filters/taskFilter.test.js src/Filters/FilterBar.test.js src/TaskViews/AllTasksList.test.js src/TaskViews/TaskGraphView.test.js src/TaskViews/taskGraphLayout.test.js

Node/npm equivalents work in a Node-enabled environment.

### Readable controls

- The single tag input filters paths immediately in views with tagPathSearch,
  and finds selectable tag suggestions in views with tagSelection. Picking a
  suggestion stores its exact ID and clears the text query. The two conditions
  remain separate in settings because exact selections survive renames and
  path searches can match several tags without selecting IDs.
- UI vocabulary uses Search tasks / Search tags, Include tasks with subtags,
  Also match tags on supertasks, Results only, and Show tasks. Menus are Status,
  Task filters, Tag matching and Display; the button says Clear filters.
  The task structure control is labelled Task relation; tag visibility is Show tags.
  Show subtags in results adds tag structure without adding task results.
  The transitivelyIrrelevant status is labelled Automatically irrelevant in UI.
  Keep the current layout; grouping controls into Task names / Tags / Tag status /
  Show tasks sections remains a possible later layout change.
- Also match tags on supertasks toggles tagSource between task and
  taskAndSupertasks. The Has tags choice in Task filters replaces untaggedOnly with
  match.tasks.tagged: FilterChoice (any = All tasks, yes = Tagged only,
  no = Untagged only), using that same tag source. Both settings remain under
  the existing tagMatching capability.
- Each task flag has explicit choices such as All tasks / Planned only /
  Unplanned only. The internal any/yes/no values retain their existing meaning.
- Task structure selects all tasks, tasks without supertasks, tasks without
  subtasks, or standalone tasks.
- Status is a collection of selected category names. Presence in that collection
  drives each category checkbox. Group checkboxes aggregate their categories.
- setFilterSettingsWithDefaults is the single fallback boundary for a missing
  view snapshot. App stores by view; the hook supplies that view's defaults.
  Standard onChange attributes remain on the actual form controls.

