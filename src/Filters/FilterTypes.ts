import type { ReactNode } from "react";
import type { FinishedState } from "../Structure/TaskInterfaces";
import type { View } from "../Structure/View";

// Readability aliases: IDs remain numbers in both storage formats.
export type TaskID = number;
export type TagID = number;

// Common data consumed by the filter, independent of the app's storage format.
export interface FilterTask {
  id: TaskID;
  name: string;
  status: FinishedState;
  childIds: readonly TaskID[];
  tagIds: readonly TagID[];
  planned: boolean;
  repeated: boolean;
  scheduled: boolean;
  dueTime?: Date | string | number | null;
}

export interface FilterTag {
  id: TagID;
  name: string;
  childIds: readonly TagID[];
}

export interface FilterData {
  tasks: readonly FilterTask[];
  tags: readonly FilterTag[];
}

export interface FilterTagWithPath extends FilterTag {
  path: string;
}

export type FilterChoice = "any" | "yes" | "no";
export type DueInterval =
  | "none"
  | "30min"
  | "2hrs"
  | "8hrs"
  | "1day"
  | "4day"
  | "1week"
  | "2week"
  | "4week"
  | "1month";

// Derived for filtering only; persisted tasks still use FinishedState.
export type TaskFilterStatus =
  | "unfinished"
  | "completed"
  | "irrelevant"
  | "impossible"
  | "transitivelyIrrelevant";
export type TaskContextMode = "none" | "ancestors" | "descendants" | "both";
export type TaskStructure =
  | "any"
  | "noSupertasks"
  | "noSubtasks"
  | "standalone";
export type DeadlineCondition =
  | { kind: "any" }
  | { kind: "missing" }
  | { kind: "within"; interval: Exclude<DueInterval, "none"> };

export interface FilterSettings {
  match: {
    tasks: {
      text: string;
      statuses: readonly TaskFilterStatus[];
      repeated: FilterChoice;
      planned: FilterChoice;
      scheduled: FilterChoice;
      structure: TaskStructure;
      deadline: DeadlineCondition;
      tagSource: "task" | "taskAndSupertasks";
      untaggedOnly: boolean;
    };
    tags: {
      selectedIds: readonly TagID[];
      pathQuery: string;
      includeSubtags: boolean;
    };
  };
  context: {
    tasks: TaskContextMode;
    tags: { includeSubtags: boolean };
  };
  presentation: { tags: "results" | "all" };
}

export interface FilterSettingsOverrides {
  match?: {
    tasks?: Partial<FilterSettings["match"]["tasks"]>;
    tags?: Partial<FilterSettings["match"]["tags"]>;
  };
  context?: {
    tasks?: TaskContextMode;
    tags?: Partial<FilterSettings["context"]["tags"]>;
  };
  presentation?: Partial<FilterSettings["presentation"]>;
}

export type FilterFeature =
  | "taskSearch"
  | "status"
  | "repeated"
  | "planned"
  | "scheduled"
  | "deadline"
  | "tagSelection"
  | "tagMatching"
  | "tagPathSearch"
  | "taskStructure"
  | "taskContext"
  | "tagContext"
  | "allTags";
export interface FilterViewConfig {
  features: readonly FilterFeature[];
  defaults: FilterSettings;
}

export interface FilterResult {
  matchedTaskIds: ReadonlySet<TaskID>;
  matchedTagIds: ReadonlySet<TagID>;
  contextTaskIds: ReadonlySet<TaskID>;
  contextTagIds: ReadonlySet<TagID>;
  displayTaskIds: ReadonlySet<TaskID>;
  displayTagIds: ReadonlySet<TagID>;
  selectableTags: readonly FilterTagWithPath[];
  isTaskVisible(task: Pick<FilterTask, "id">): boolean;
  isTagVisible(tag: Pick<FilterTag, "id">): boolean;
}

export interface TaskFilterController extends FilterResult {
  settings: FilterSettings;
  features: readonly FilterFeature[];
  setFilterSettingsWithDefaults(
    updateSettings: (previous: FilterSettings) => FilterSettings
  ): void;
  reset(): void;
}

export type FiltersByView = Partial<Record<View, FilterSettings>>;
export type FilterSettingsSetter = (
  updateSettings: (previous: FilterSettings | undefined) => FilterSettings
) => void;
export interface TaskFilterProps {
  filterSettings: FilterSettings | undefined;
  setFilterSettings: FilterSettingsSetter;
}
export interface FilterBarProps {
  taskFilter: TaskFilterController;
  children?: ReactNode;
}
