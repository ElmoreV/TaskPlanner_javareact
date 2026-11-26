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
  thisWeek: boolean; //true=planned
  repeated: boolean; 
  scheduled: boolean; //true = scheduled
  weekOrderIndex: number; //order in the planned list
  unfolded: boolean; 

  dueTime: Date | undefined;
  // Legacy field: no code recalculates and stores this value.
  transitiveDueTime: Date | undefined;
  lastFinished: Date | undefined;
}

export { V1_Topic, V1_Task };
