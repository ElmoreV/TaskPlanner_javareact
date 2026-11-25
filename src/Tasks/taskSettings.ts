import { View } from "../Structure/View";

type TaskFeature =
  | "fold"
  | "complete"
  | "finishStatus"
  | "rename"
  | "delete"
  | "addSubtask"
  | "plan"
  | "repeat"
  | "move"
  | "duplicate"
  | "deadline"
  | "selection"
  | "lastCompletion"
  | "tagEditing";

interface TaskViewConfig {
  features: readonly TaskFeature[];
}

export const TASK_CONFIG_BY_VIEW: Partial<Record<View, TaskViewConfig>> = {
  // Categorize (the legacy enum name says ALL_TASKS).
  [View.VIEW_ALL_TASKS]: {
    features: [
      "fold",
      "complete",
      "finishStatus",
      "rename",
      "delete",
      "addSubtask",
      "plan",
      "repeat",
      "move",
      "duplicate",
      "deadline",
      "selection",
      "lastCompletion",
    ],
  },
  [View.VIEW_TAG_ALL_TASKS]: {
    features: ["fold", "tagEditing"],
  },
};
