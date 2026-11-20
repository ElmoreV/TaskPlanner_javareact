import { useMemo } from "react";
import { adaptFilterData } from "./filterData";
import { createFilterSettings, filterTasks } from "./taskFilter";
import type { FilterSource } from "./filterData";
import type {
  FilterFeature,
  FilterSettings,
  FilterViewConfig,
  FilterSettingsSetter,
  TaskFilterController,
} from "./FilterTypes";
import { View } from "../Structure/View";

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
  [View.VIEW_ALL_TASKS]: {
    features: [
      ...commonFilterFeatures,
      "planned",
      "tagPathSearch",
      "taskContext",
      "tagContext",
      "allTags",
    ],
    defaults: createFilterSettings({
      match: {
        tasks: { statuses: ["unfinished", "transitivelyIrrelevant"] },
      },
      presentation: { tags: "all" },
    }),
  },
  [View.VIEW_PLANNED_TASKS]: {
    features: commonFilterFeatures,
    defaults: createFilterSettings({
      match: {
        tasks: { statuses: ["unfinished", "transitivelyIrrelevant"] },
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
const neutralizeUnsupportedSettings = (
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
  }
  if (features.includes("taskContext"))
    effectiveSettings.context.tasks = settings.context.tasks;
  if (features.includes("tagContext"))
    effectiveSettings.context.tags.includeSubtags =
      settings.context.tags.includeSubtags;
  if (features.includes("allTags"))
    effectiveSettings.presentation.tags = settings.presentation.tags;
  return effectiveSettings;
};

export const useTaskFilter = (
  appData: FilterSource,
  view: View,
  filterSettings: FilterSettings | undefined,
  setFilterSettings: FilterSettingsSetter
): TaskFilterController => {
  const viewConfig = FILTER_CONFIG_BY_VIEW[view];
  if (!viewConfig)
    throw new Error("View " + View[view] + " does not define filter features.");
  const normalizedFilterData = useMemo(
    () => adaptFilterData(appData),
    [appData]
  );
  const { filterResult, effectiveSettings } = useMemo(() => {
    const effectiveSettings = neutralizeUnsupportedSettings(
      filterSettings ?? viewConfig.defaults,
      viewConfig.features
    );
    return {
      filterResult: filterTasks(normalizedFilterData, effectiveSettings),
      effectiveSettings,
    };
  }, [normalizedFilterData, filterSettings, viewConfig]);
  return {
    ...filterResult,
    settings: effectiveSettings,
    features: viewConfig.features,
    setFilterSettingsWithDefaults: (updateSettings) =>
      setFilterSettings((previous) =>
        updateSettings(previous ?? viewConfig.defaults)
      ),
    reset: () => setFilterSettings(() => viewConfig.defaults),
  };
};
