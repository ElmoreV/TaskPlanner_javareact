# Features per view


| View (internal) | View (UI) | Active features |
| --- | --- | --- |
| `View.VIEW_ALL_TASKS` | 2. Categorize| `taskSearch`, `status`, `repeated`, `scheduled`, `deadline`, `tagSelection`, `tagMatching`, `planned`, `tagPathSearch`, `taskContext`, `tagContext`, `tagVisibility` |
| `View.VIEW_TAG_ALL_TASKS` |All tasks | `taskSearch`, `status`, `repeated`, `scheduled`, `deadline`, `tagSelection`, `tagMatching`, `planned`, `taskStructure`, `taskContext` |
| `View.VIEW_TASK_GRAPH` | Task graph | `taskSearch`, `status`, `repeated`, `scheduled`, `deadline`, `tagSelection`, `tagMatching`, `planned`, `taskStructure`, `taskContext` |
| `View.VIEW_ADD_TASKS` | 1. Add | `taskSearch`, `status`, `repeated`, `planned`, `scheduled`, `deadline` |
| `View.VIEW_PLANNED_TASKS` | 4. Prioritize | `taskSearch`, `status`, `repeated`, `scheduled`, `deadline`, `tagSelection`, `tagMatching` |

`commonFilterFeatures` contains `taskSearch`, `status`, `repeated`, `scheduled`, `deadline`, `tagSelection`, and `tagMatching`. Only the five views above are configured in `FILTER_CONFIG_BY_VIEW`; passing a different view to `useTaskFilter` throws an error.

# Settings per feature



| Feature | Setting name (internal) | Setting name (UI) / available options |
| --- | --- | --- |
| `taskSearch` | `match.tasks.text` | **Search tasks** — text input |
| `status` | `match.tasks.statuses` | **Status** — Unfinished (group); Automatically irrelevant; Finished (group); Irrelevant; Impossible; Completed |
| `repeated` | `match.tasks.repeated` | **Task filters → Repeats** — All tasks, Repeating only, Non-repeating only |
| `planned` | `match.tasks.planned` | **Task filters → Planned** — All tasks, Planned only, Unplanned only |
| `scheduled` | `match.tasks.scheduled` | **Task filters → Scheduled** — All tasks, Scheduled only, Unscheduled only |
| `deadline` | `match.tasks.deadline` (`kind`, and `interval` when `kind = "within"`) | **Task filters → Deadline** — Any deadline; No deadline; Within 30 minutes / 2 hours / 8 hours / 1 day / 4 days / 1 week / 2 weeks / 4 weeks / 1 month |
| `tagSelection` | `match.tags.selectedIds` | **Search tags** — select matching tag suggestions; selected tags appear as removable buttons |
| `tagPathSearch` | `match.tags.pathQuery` | **Search tags** — text input that directly filters by tag-path substring |
| `tagMatching` | `match.tasks.tagged` | **Task filters → Has tags** — All tasks, Tagged only, Untagged only |
| `tagMatching` | `match.tags.matchMode` | **Tag matching → Show tasks that match** — Every tag, Any tag |
| `tagMatching` | `match.tags.includeSubtags` | **Tag matching → Include tasks with subtags** — checkbox (on/off) |
| `tagMatching` | `match.tasks.tagSource` | **Tag matching → Also match tags on supertasks** — checkbox (on/off) |
| `taskStructure` | `match.tasks.structure` | **Task filters → Task relation** — All tasks, Without supertasks, Without subtasks, Without supertasks or subtasks |
| `taskContext` | `context.tasks` | **Display → Show tasks** — Results only, Results and all supertasks, Results and all subtasks, Results, all supertasks and all subtasks |
| `tagContext` | `context.tags.includeSubtags` | **Display → Show subtags in results** — checkbox (on/off) |
| `tagVisibility` | `presentation.tags` | **Display → Show tags** — Automatic, All tags, Relevant tags, Tags with visible tasks |


**Shared controls:** `tagSelection` and `tagPathSearch` use the same **Search tags** input. With `tagPathSearch` active, typing updates `match.tags.pathQuery` immediately; without it, typing only searches suggestions locally, and selecting a suggestion updates `match.tags.selectedIds`.

**Shared menu:** The **Tag matching** menu appears when *any* of `tagMatching`, `tagSelection`, or `tagPathSearch` is enabled. The **Task filters** menu and **Display** menu also group controls from multiple features; the feature column above identifies which feature governs each individual control.


## Default settings

### Defaults that differ by view

| View | Default `match.tasks.statuses` | Default `presentation.tags` |
| --- | --- | --- |
| `VIEW_ALL_TASKS` (Categorize) | `unfinished`, `transitivelyIrrelevant` | `automatic` |
| `VIEW_PLANNED_TASKS` | `unfinished`, `transitivelyIrrelevant` | `relevant` (feature hidden) |
| `VIEW_ADD_TASKS` | All five statuses | `relevant` (feature hidden) |
| `VIEW_TAG_ALL_TASKS` | All five statuses | `relevant` (feature hidden) |
| `VIEW_TASK_GRAPH` | All five statuses | `relevant` (feature hidden) |

### Shared defaults (`createFilterSettings`)

| Setting(s) | Default |
| --- | --- |
| `match.tasks.text`, `match.tags.pathQuery` | `""` (empty) |
| `match.tags.selectedIds` | `[]` (none selected) |
| `match.tasks.repeated`, `.planned`, `.scheduled`, `.structure`, `.tagged` | `"any"` |
| `match.tasks.deadline` | `{ kind: "any" }` |
| `match.tasks.tagSource` | `"task"` |
| `match.tags.matchMode` | `"every"` |
| `match.tags.includeSubtags` | `true` |
| `context.tasks` | `"none"` |
| `context.tags.includeSubtags` | `false` |

## Potentially conflicting or surprising interactions

| Settings involved | Interaction / potential conflict |
| --- | --- |
| `match.tasks.tagged = "no"` **and** a nonempty `match.tags.selectedIds` or `match.tags.pathQuery` | **Actual contradiction:** the task must have no *effective* tags, but the tag-selection/query condition requires at least one effective matching tag. No task can match both. |
| `match.tags.matchMode` + `match.tags.selectedIds` + `match.tags.pathQuery` | **Every tag** requires each separately selected tag **AND** at least one tag matching the path query (if present). **Any tag** requires any selected tag **OR** one tag matching the path query. Empty conditions are ignored. |
| `match.tags.includeSubtags` vs. `context.tags.includeSubtags` | These similarly named checkboxes do **different jobs**: **Include tasks with subtags** changes which *tasks* match; **Show subtags in results** adds *tags to the display* and does not change task matching. |
| `context.tasks` vs. any task-matching setting | `ancestors`, `descendants`, or `both` adds related tasks to the display **even if those additional tasks fail the filters**. Only `none` limits visible tasks strictly to matches. |
| `match.tasks.tagSource = "taskAndSupertasks"` + `match.tasks.tagged` or tag criteria | Tag checks use the task's own tags **plus** all supertasks' tags, including the **Has tags** setting. A task with no own tags can count as tagged. |
| `presentation.tags = "automatic"` + search fields | Automatic displays **all tags** when task text, tag path query, and selected tag IDs are all empty; otherwise **relevant tags**. Other active filters (such as status or deadline) do not independently switch it to relevant mode. |
| `presentation.tags` + `context.tags.includeSubtags` | **Show subtags in results** is enabled only when effective tag visibility is `relevant` **and** there is an active tag selection/query. In `all` or `withVisibleTasks` mode, this checkbox is disabled and does not add context subtags. |
| `match.tags.matchMode = "every"` + `presentation.tags = "relevant"` | “Relevant tags” uses the **union of tags satisfying individual tag conditions**, plus tags of visible tasks and their ancestors. It can display tags even when **no task satisfies every condition**. Tag visibility does not mean the entire task filter matched. |
| `tagSelection` + `tagPathSearch` | Selecting a suggested tag **clears `match.tags.pathQuery`** (`selectTagForFilter`). Any typed tag-query condition is removed at that moment and must be re-entered to combine it with the selected tags. |
| `tagSelection` / `tagPathSearch` without `tagMatching` in a hypothetical future view | The Tag matching menu **would still show** its three controls because of the UI's OR condition, but `neutralizeUnsupportedSettings()` would reset `matchMode`, `includeSubtags`, `tagSource`, and `tagged` unless `tagMatching` is enabled. **No currently configured view has this mismatch.** |
| `presentation.tags = "withVisibleTasks"` + `match.tasks.tagSource = "taskAndSupertasks"` | Tags displayed by **Tags with visible tasks** are taken from the visible tasks' **direct** tag assignments (and tag ancestors), not from the inherited effective tag set used for matching. The list of displayed tags can therefore differ from tags used to match a task. |

### Useful rules of thumb

- **Matching** options determine `matchedTaskIds`; different task filters generally combine with **AND**.
- **Task context** expands those matching tasks into `displayTaskIds`, potentially adding nonmatching relatives.
- **Tag presentation/context** determines which tags are visible; it does not necessarily track task matches one-to-one.
- **Tag query** is a case-insensitive substring of the tag's full path; **task text search** instead matches every query word against the beginning of a task-name word.
