import { FinishedState } from "../Tasks/TaskInterfaces";

interface V1_Topic {
  title: string;
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

export { V1_Topic, V1_Task };
