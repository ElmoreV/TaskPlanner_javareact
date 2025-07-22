//V1_types.js

import { FinishedState } from "./TaskInterfaces";

interface V1_Topic {
  name: string;
  id: number;
  unfolded: boolean;
  subtopics: V1_Topic[];
}

interface V1_Task {
  name: string;
  id: number;
  topics: number[];
  topicViewIndices: number[];
  subTaskIds: number[];
  completed: boolean;
  finishStatus: FinishedState;
  thisWeek: boolean;
  repeated: boolean;
  scheduled: boolean;
  weekOrderIndex: number;
  unfolded: boolean;

  dueTime: Date | undefined;
  transitiveDueTime: Date | undefined;
  lastFinished: Date | undefined;
}

enum V1_ClipboardItemType {
  Task,
  Topic,
}

interface V1_ClippedItem {
  type: V1_ClipboardItemType;
  id: number;
}

const V1_emptyClipboardState: V1_ClipboardItemType[] = [
  {
    type: V1_ClipboardItemType.Task,
    id: 0,
  },
  {
    type: V1_ClipboardItemType.Topic,
    id: 0,
  },
  {
    type: V1_ClipboardItemType.Topic,
    id: 1,
  },
];

export {
  V1_Topic,
  V1_Task,
  V1_ClipboardItemType,
  V1_ClippedItem,
  V1_emptyClipboardState,
};
