import { View } from "../Structure/View";
import { FilterFeature, FilterSettings, FilterSettingsOverrides, FilterViewConfig, TaskFilterStatus } from "./FilterTypes";

const ALL_STATUSES: readonly TaskFilterStatus[] = [
  "unfinished",
  "completed",
  "irrelevant",
  "impossible",
  "transitivelyIrrelevant",
];
export const createFilterSettings = (
  overrides: FilterSettingsOverrides = {}
): FilterSettings => {
  // Note: a change here should update Filter-feature-settings.md
  return {
    match: {
      tasks: {
        text: "",
        statuses: [...ALL_STATUSES],
        repeated: "any",
        planned: "any",
        scheduled: "any",
        structure: "any",
        deadline: { kind: "any" },
        tagSource: "task",
        tagged: "any",
        ...overrides.match?.tasks,
      },
      tags: {
        selectedIds: [],
        pathQuery: "",
        includeSubtags: true,
        matchMode: "every",
        ...overrides.match?.tags,
      },
    },
    context: {
      tasks: overrides.context?.tasks ?? "none",
      tags: { includeSubtags: false, ...overrides.context?.tags },
    },
    presentation: { tags: "relevant", ...overrides.presentation },
  };
};

const commonFilterFeatures: readonly FilterFeature[] = [
  "taskSearch",
  "status",
  "repeated",
  "scheduled",
  "deadline",
  "tagSelection",
  "tagMatching",
];


export const FILTER_CONFIG_BY_VIEW: Partial<Record<View, FilterViewConfig>> = {
  // Categorize (the legacy enum name says ALL_TASKS).
  // Note: a change here should update Filter-feature-settings.md
  [View.VIEW_ALL_TASKS]: {
    features: [
      ...commonFilterFeatures,
      "planned",
      "tagPathSearch",
      "taskContext",
      "tagContext",
      "tagVisibility",
    ],
    defaults: createFilterSettings({
      match: {
        tasks: { statuses: ["unfinished"],
          tagSource: "taskAndSupertasks"
         },
      },
      context: {tasks: "both"},
      presentation: { tags: "automatic" },
    }),
  },
  [View.VIEW_PLANNED_TASKS]: {
    features: commonFilterFeatures,
    defaults: createFilterSettings({
      match: {
        tasks: { statuses: ["unfinished"] },
      },
    }),
  },
  [View.VIEW_ADD_TASKS]: {
    features: [
      "taskSearch",
      "status",
      "repeated",
      "planned",
      "scheduled",
      "deadline",
    ],
    defaults: createFilterSettings(),
  },
  // All tasks list used for tagging.
  [View.VIEW_TAG_ALL_TASKS]: {
    features: [
      ...commonFilterFeatures,
      "planned",
      "taskStructure",
      "taskContext",
    ],
    defaults: createFilterSettings(),
  },
  [View.VIEW_TASK_GRAPH]: {
    features: [
      ...commonFilterFeatures,
      "planned",
      "taskStructure",
      "taskContext",
    ],
    defaults: createFilterSettings(),
  },
};


// Hidden features must also be neutralized, regardless of stored values/defaults.
export const neutralizeUnsupportedSettings = (
  settings: FilterSettings,
  features: readonly FilterFeature[]
): FilterSettings => {
  const effectiveSettings = createFilterSettings();
  if (features.includes("taskSearch"))
    effectiveSettings.match.tasks.text = settings.match.tasks.text;
  if (features.includes("status"))
    effectiveSettings.match.tasks.statuses = settings.match.tasks.statuses;
  if (features.includes("repeated"))
    effectiveSettings.match.tasks.repeated = settings.match.tasks.repeated;
  if (features.includes("planned"))
    effectiveSettings.match.tasks.planned = settings.match.tasks.planned;
  if (features.includes("scheduled"))
    effectiveSettings.match.tasks.scheduled = settings.match.tasks.scheduled;
  if (features.includes("deadline"))
    effectiveSettings.match.tasks.deadline = settings.match.tasks.deadline;
  if (features.includes("taskStructure"))
    effectiveSettings.match.tasks.structure = settings.match.tasks.structure;
  if (features.includes("tagSelection"))
    effectiveSettings.match.tags.selectedIds = settings.match.tags.selectedIds;
  if (features.includes("tagPathSearch"))
    effectiveSettings.match.tags.pathQuery = settings.match.tags.pathQuery;
  if (features.includes("tagMatching")) {
    effectiveSettings.match.tasks.tagSource = settings.match.tasks.tagSource;
    effectiveSettings.match.tasks.tagged = settings.match.tasks.tagged;
    effectiveSettings.match.tags.includeSubtags =
      settings.match.tags.includeSubtags;
    effectiveSettings.match.tags.matchMode = settings.match.tags.matchMode;
  }
  if (features.includes("taskContext"))
    effectiveSettings.context.tasks = settings.context.tasks;
  if (features.includes("tagContext"))
    effectiveSettings.context.tags.includeSubtags =
      settings.context.tags.includeSubtags;
  if (features.includes("tagVisibility"))
    effectiveSettings.presentation.tags = settings.presentation.tags;
  return effectiveSettings;
};