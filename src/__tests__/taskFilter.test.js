import { filterTasks } from "../Filters/taskFilter";
import { createFilterSettings } from "../Filters/filterSettings";
import { getTransitivelyIrrelevantTaskIds } from "../Filters/filterGraph";
import { adaptV1FilterData, adaptV2FilterData } from "../Filters/filterData";
import { FinishedState } from "../Structure/TaskInterfaces";

const task = (id, extra = {}) => ({
  id,
  name: "Task " + id,
  topics: [],
  subTaskIds: [],
  finishStatus: 0,
  ...extra,
});
const tag = (id, name, subtopics = []) => ({ id, name, subtopics });
const tagTree = [
  tag(10, "Work", [tag(11, "Projects")]),
  tag(20, "Home"),
  tag(30, "Empty"),
];
const settings = ({
  tasks = {},
  tags = {},
  taskContext = "none",
  subtagContext = false,
  presentation = "relevant",
} = {}) =>
  createFilterSettings({
    match: { tasks, tags },
    context: { tasks: taskContext, tags: { includeSubtags: subtagContext } },
    presentation: { tags: presentation },
  });
const visibleIds = (records, isVisible) =>
  records.filter(isVisible).map(({ id }) => id);
const apply = (tasks, options, tags = tagTree, now) => {
  const data = adaptV1FilterData({ tasks, topics: tags });
  const result = filterTasks(data, settings(options), now);
  return {
    taskIds: visibleIds(data.tasks, result.isTaskVisible),
    tagIds: visibleIds(data.tags, result.isTagVisible),
  };
};
const ids = (result) => result.taskIds;
const sorted = (set) => [...set].sort((a, b) => a - b);

test("legacy completion is a fallback for unfinished or missing saved status", () => {
  const cases = [
    [FinishedState.NotFinished, true, FinishedState.Completed],
    [FinishedState.NotFinished, false, FinishedState.NotFinished],
    [undefined, true, FinishedState.Completed],
    [undefined, false, FinishedState.NotFinished],
    [FinishedState.Completed, false, FinishedState.Completed],
    [FinishedState.Irrelevant, true, FinishedState.Irrelevant],
    [FinishedState.Impossible, true, FinishedState.Impossible],
  ];
  for (const [finishStatus, completed, expected] of cases) {
    const result = adaptV1FilterData({
      tasks: [task(1, { finishStatus, completed })],
    });
    expect(result.tasks[0].status).toBe(expected);
  }
});

test("transitive irrelevance can be calculated independently of filter settings", () => {
  const data = adaptV1FilterData({
    tasks: [
      task(1, { finishStatus: 1, subTaskIds: [2] }),
      task(2, { subTaskIds: [3, 6] }),
      task(3),
      task(4, { subTaskIds: [3] }),
      task(5),
      task(6, { finishStatus: 2, subTaskIds: [7] }),
      task(7),
    ],
    topics: [],
  });
  const before = JSON.stringify(data);
  expect(sorted(getTransitivelyIrrelevantTaskIds(data.tasks))).toEqual([2, 7]);
  expect(JSON.stringify(data)).toBe(before);
});

test("five exclusive statuses support combinations, empty selection, legacy completion and stored-state precedence", () => {
  const tasks = [
    task(1),
    task(2, { finishStatus: 1, subTaskIds: [6, 8] }),
    task(3, { finishStatus: 2 }),
    task(4, { finishStatus: 3 }),
    task(5, { completed: true }),
    task(6, { subTaskIds: [7] }),
    task(7),
    task(8, { finishStatus: 1 }),
  ];
  const expected = new Map([
    ["unfinished", [1]],
    ["completed", [2, 5, 8]],
    ["irrelevant", [3]],
    ["impossible", [4]],
    ["transitivelyIrrelevant", [6, 7]],
  ]);
  for (const [status, matches] of expected)
    expect(ids(apply(tasks, { tasks: { statuses: [status] } }))).toEqual(
      matches
    );
  expect(
    ids(
      apply(tasks, {
        tasks: {
          statuses: ["unfinished", "transitivelyIrrelevant"],
        },
      })
    )
  ).toEqual([1, 6, 7]);
  expect(ids(apply(tasks, { tasks: { statuses: [] } }))).toEqual([]);
  expect(tasks[5].finishStatus).toBe(0);
});

test.each([1, 2, 3])(
  "finished state %s propagates irrelevance and an independent parent rescues a shared child",
  (status) => {
    const tasks = [
      task(1, { finishStatus: status, subTaskIds: [2] }),
      task(2, { subTaskIds: [3] }),
      task(3),
      task(4, { subTaskIds: [3] }),
      task(5, { finishStatus: 1, subTaskIds: [4] }),
    ];
    expect(ids(apply(tasks, { tasks: { statuses: ["unfinished"] } }))).toEqual(
      []
    );
    tasks[4].subTaskIds = [];
    expect(ids(apply(tasks, { tasks: { statuses: ["unfinished"] } }))).toEqual([
      3, 4,
    ]);
    expect(
      ids(
        apply(tasks, {
          tasks: { statuses: ["transitivelyIrrelevant"] },
        })
      )
    ).toEqual([2]);
    // The rescuing parent need not pass the search or tag conditions.
    expect(
      ids(
        apply(tasks, {
          tasks: { text: "3", statuses: ["unfinished"] },
        })
      )
    ).toEqual([3]);
  }
);

test("a finished intermediate interrupts an unfinished ancestor path, while parentless tasks stay exempt", () => {
  const tasks = [
    task(1, { subTaskIds: [2] }),
    task(2, { finishStatus: 1, subTaskIds: [3] }),
    task(3),
    task(4),
  ];
  expect(ids(apply(tasks, { tasks: { statuses: ["unfinished"] } }))).toEqual([
    1, 4,
  ]);
  expect(
    ids(
      apply(tasks, {
        tasks: { statuses: ["transitivelyIrrelevant"] },
      })
    )
  ).toEqual([3]);
});

test("task search uses case-insensitive word prefixes in any order", () => {
  const tasks = [
    task(1, { name: "Send project invoice" }),
    task(2, { name: "Resend invitation" }),
    task(3, { name: "Réparer vélo" }),
  ];
  expect(ids(apply(tasks, { tasks: { text: "INV pro" } }))).toEqual([1]);
  expect(ids(apply(tasks, { tasks: { text: "end" } }))).toEqual([]);
  expect(ids(apply(tasks, { tasks: { text: "vé ré" } }))).toEqual([3]);
});

test("task flags combine with each other and with search", () => {
  const tasks = [
    task(1, { repeated: true, thisWeek: true }),
    task(2, { repeated: true, scheduled: true }),
    task(3),
  ];
  expect(
    ids(
      apply(tasks, {
        tasks: { repeated: "yes", planned: "yes", scheduled: "no" },
      })
    )
  ).toEqual([1]);
  expect(ids(apply(tasks, { tasks: { repeated: "no" } }))).toEqual([3]);
  expect(ids(apply(tasks, { tasks: { repeated: "yes", text: "3" } }))).toEqual(
    []
  );
});

test("matching subtags broadens both tag and task matches", () => {
  const tasks = [
    task(1, { topics: [10] }),
    task(2, { topics: [11] }),
    task(3, { topics: [20] }),
    task(4),
  ];
  const expanded = apply(tasks, { tags: { selectedIds: [10] } });
  expect(ids(expanded)).toEqual([1, 2]);
  expect(expanded.tagIds).toEqual([10, 11]);
  expect(
    ids(apply(tasks, { tags: { selectedIds: [10], includeSubtags: false } }))
  ).toEqual([1]);
  expect(ids(apply(tasks, { tags: { selectedIds: [999] } }))).toEqual([]);
  expect(ids(apply(tasks, { tasks: { tagged: "yes" } }))).toEqual([1, 2, 3]);
  expect(ids(apply(tasks, { tasks: { tagged: "no" } }))).toEqual([4]);
  expect(
    ids(apply(tasks, { tasks: { tagged: "no" }, tags: { selectedIds: [10] } }))
  ).toEqual([]);
});

test.each([
  ["every", [4, 5]],
  ["any", [1, 2, 3, 4, 5]],
])("selected tags combine with %s matching", (matchMode, expected) => {
  const tasks = [
    task(1, { topics: [10] }),
    task(2, { topics: [11] }),
    task(3, { topics: [20] }),
    task(4, { topics: [10, 20] }),
    task(5, { topics: [11, 20] }),
    task(6),
  ];
  expect(
    ids(apply(tasks, { tags: { selectedIds: [10, 20], matchMode } }))
  ).toEqual(expected);
  expect(
    ids(
      apply(tasks, {
        tags: { selectedIds: [10, 20], matchMode, includeSubtags: false },
      })
    )
  ).toEqual(matchMode === "every" ? [4] : [1, 3, 4, 5]);
});

test("selected tags require every condition by default while relevant tags retain each scope", () => {
  expect(
    apply([task(1, { topics: [10] }), task(2, { topics: [20] })], {
      tags: { selectedIds: [10, 20], includeSubtags: false },
    })
  ).toEqual({ taskIds: [], tagIds: [10, 20] });
});

test("tag inheritance considers all task ancestors without creating new assignments", () => {
  const tasks = [
    task(1, { topics: [10], subTaskIds: [2] }),
    task(2, { subTaskIds: [4] }),
    task(3, { topics: [20], subTaskIds: [4] }),
    task(4),
  ];
  expect(
    ids(
      apply(tasks, {
        tags: { selectedIds: [10] },
        tasks: { tagSource: "taskAndSupertasks" },
      })
    )
  ).toEqual([1, 2, 4]);
  expect(
    ids(
      apply(tasks, {
        tags: { selectedIds: [20] },
        tasks: { tagSource: "taskAndSupertasks" },
      })
    )
  ).toEqual([3, 4]);
  expect(
    ids(
      apply(tasks, {
        tasks: { tagged: "no", tagSource: "taskAndSupertasks" },
      })
    )
  ).toEqual([]);
  expect(ids(apply(tasks, { tasks: { tagged: "no" } }))).toEqual([2, 4]);
  expect(
    ids(
      apply(tasks, {
        tasks: { tagged: "yes", tagSource: "taskAndSupertasks" },
      })
    )
  ).toEqual([1, 2, 3, 4]);
  expect(ids(apply(tasks, { tags: { selectedIds: [20] } }))).toEqual([3]);
  expect(tasks[3].topics).toEqual([]);
});

test("tag matches cannot bypass task conditions or expand subtags of extra assignments", () => {
  const tasks = [
    task(1, { name: "Send invoice", topics: [10, 20] }),
    task(2, { name: "Renovate office", topics: [10] }),
  ];
  const result = apply(
    tasks,
    {
      tags: { selectedIds: [10], includeSubtags: false },
      tasks: { text: "invoice" },
      subtagContext: true,
    },
    [
      tag(10, "Work", [tag(11, "Projects")]),
      tag(20, "Home", [tag(21, "Private")]),
    ]
  );
  expect(ids(result)).toEqual([1]);
  expect(result.tagIds).toEqual([10, 11, 20]);
});

test("empty matched tags survive independently of task results", () => {
  const result = apply([task(1)], {
    tags: { selectedIds: [30] },
    tasks: { text: "invoice" },
  });
  expect(ids(result)).toEqual([]);
  expect(result.tagIds).toEqual([30]);
});

test("subtag context adds tag structure without adding tasks assigned to those subtags", () => {
  const tasks = [task(1, { topics: [10] }), task(2, { topics: [11] })];
  const options = { tags: { selectedIds: [10], includeSubtags: false } };
  const result = apply(tasks, { ...options, subtagContext: true });
  expect(ids(result)).toEqual([1]);
  expect(result.tagIds).toEqual([10, 11]);
  expect(apply(tasks, options).tagIds).toEqual([10]);
});

test("presentation shows all tags without adding tasks assigned to those tags", () => {
  const tasks = [task(1, { topics: [11] }), task(2, { topics: [20] })];
  const options = { tags: { selectedIds: [11] } };
  const result = apply(tasks, { ...options, presentation: "all" });
  expect(result.tagIds).toEqual([10, 11, 20, 30]);
  expect(ids(result)).toEqual([1]);
  expect(apply(tasks, options)).toEqual({ taskIds: [1], tagIds: [10, 11] });
});

test("automatic keeps all folders while browsing with task filters or whitespace queries", () => {
  const tasks = [
    task(1, { topics: [11], finishStatus: 1 }),
    task(2, { topics: [20] }),
  ];
  expect(
    apply(tasks, {
      presentation: "automatic",
      tasks: { statuses: ["unfinished"], text: "  " },
      tags: { pathQuery: "  " },
    })
  ).toEqual({ taskIds: [2], tagIds: [10, 11, 20, 30] });
  expect(
    apply(tasks, { presentation: "automatic", tasks: { planned: "yes" } })
  ).toEqual({ taskIds: [], tagIds: [10, 11, 20, 30] });
});

test.each([
  [{ tasks: { text: "1" } }, [1], [10, 11]],
  [{ tags: { pathQuery: "Projects" } }, [1], [10, 11]],
  [{ tags: { selectedIds: [11] } }, [1], [10, 11]],
  [{ tasks: { text: "absent" } }, [], []],
  [{ tags: { pathQuery: "Empty" } }, [], [30]],
  [{ tags: { selectedIds: [30] } }, [], [30]],
])("automatic focuses search results for %p", (query, taskIds, tagIds) => {
  expect(
    apply([task(1, { topics: [11] }), task(2, { topics: [20] })], {
      ...query,
      presentation: "automatic",
    })
  ).toEqual({ taskIds, tagIds });
});

test.each([
  ["automatic", [10, 11, 30]],
  ["all", [10, 11, 20, 30]],
  ["relevant", [10, 11, 30]],
  ["withVisibleTasks", [10]],
])(
  "%s visibility handles empty matches and subtag context without changing task results",
  (presentation, tagIds) => {
    expect(
      apply([task(1, { topics: [10] }), task(2, { topics: [20] })], {
        presentation,
        tags: { selectedIds: [10, 30], includeSubtags: false, matchMode: "any" },
        subtagContext: true,
      })
    ).toEqual({ taskIds: [1], tagIds });
  }
);

test("strict visibility hides matching empty folders even when subtag context is enabled", () => {
  expect(
    apply([task(1, { topics: [11], finishStatus: 1 })], {
      presentation: "withVisibleTasks",
      tasks: { statuses: ["unfinished"] },
      tags: { selectedIds: [10] },
      subtagContext: true,
      taskContext: "both",
    })
  ).toEqual({ taskIds: [], tagIds: [] });
});

test.each([
  ["none", [2], [10, 11]],
  ["ancestors", [1, 2], [10, 11, 20]],
  ["descendants", [2, 3], [10, 11, 30]],
  ["both", [1, 2, 3], [10, 11, 20, 30]],
])(
  "strict visibility keeps supertag paths and includes %s task context",
  (taskContext, taskIds, tagIds) => {
    const tasks = [
      task(1, { topics: [20], finishStatus: 1, subTaskIds: [2] }),
      task(2, { topics: [11], subTaskIds: [3] }),
      task(3, { topics: [30], finishStatus: 1 }),
    ];
    expect(
      apply(tasks, {
        presentation: "withVisibleTasks",
        tasks: { text: "2", statuses: ["unfinished", "transitivelyIrrelevant"] },
        taskContext,
      })
    ).toEqual({ taskIds, tagIds });
  }
);

test.each([
  ["every", [3]],
  ["any", [2, 3]],
])(
  "persistent tag-path search combines with selections using %s matching",
  (matchMode, expected) => {
    const tasks = [
      task(1, { topics: [11] }),
      task(2, { topics: [20] }),
      task(3, { topics: [10, 20] }),
    ];
    const result = apply(tasks, { tags: { pathQuery: "proj" } });
    expect(ids(result)).toEqual([1]);
    expect(result.tagIds).toEqual([10, 11]);
    const acrossAssignments = apply(tasks, {
      tags: {
        selectedIds: [10],
        pathQuery: "home",
        includeSubtags: false,
        matchMode,
      },
    });
    expect(ids(acrossAssignments)).toEqual(expected);
    expect(acrossAssignments.tagIds).toEqual([10, 20]);
  }
);

test.each([
  ["none", [2]],
  ["ancestors", [1, 2, 5]],
  ["descendants", [2, 4]],
  ["both", [1, 2, 4, 5]],
])(
  "task context %s expands from original matches without pulling in siblings",
  (taskContext, expected) => {
    const tasks = [
      task(1, { subTaskIds: [2, 3] }),
      task(2, { subTaskIds: [4] }),
      task(3),
      task(4),
      task(5, { subTaskIds: [2] }),
    ];
    const result = apply(tasks, { tasks: { text: "2" }, taskContext });
    expect(ids(apply(tasks, { tasks: { text: "2" } }))).toEqual([2]);
    expect(ids(result)).toEqual(expected);
  }
);

test("task context can include unchecked statuses and supplies actual tag assignments", () => {
  const tasks = [
    task(1, { finishStatus: 1, topics: [10], subTaskIds: [2] }),
    task(2, { topics: [20], subTaskIds: [3] }),
    task(3),
    task(4, { subTaskIds: [3] }),
  ];
  const result = apply(tasks, {
    tasks: { text: "3", statuses: ["unfinished"] },
    taskContext: "ancestors",
  });
  expect(ids(result)).toEqual([1, 2, 3, 4]);
  expect(result.tagIds).toEqual([10, 20]);
  const descendants = apply(tasks, {
    tasks: { text: "1", statuses: ["completed"] },
    taskContext: "descendants",
  });
  expect(ids(descendants)).toEqual([1, 2, 3]);
});

test("deadline conditions use current descendant deadlines, include overdue work and preserve the strict cutoff", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  const tasks = [
    task(1, { subTaskIds: [2], transitiveDueTime: "2099-01-01" }),
    task(2, { dueTime: "2026-11-10T12:15:00Z" }),
    task(3, { dueTime: "2026-11-09" }),
    task(4, { dueTime: "2026-11-10T12:30:00Z" }),
    task(5),
    task(6, { dueTime: new Date("2026-11-11") }),
  ];
  expect(
    ids(
      apply(
        tasks,
        { tasks: { deadline: { kind: "within", interval: "30min" } } },
        tagTree,
        now
      )
    )
  ).toEqual([1, 2, 3]);
  expect(
    ids(
      apply(tasks, { tasks: { deadline: { kind: "missing" } } }, tagTree, now)
    )
  ).toEqual([5]);
  expect(now.toISOString()).toBe("2026-11-10T12:00:00.000Z");
});

test("shared multi-level deadlines include completed and hidden subtasks without mutating input", () => {
  const tasks = [
    task(4, { dueTime: "2026-11-10T12:15:00Z", finishStatus: 1 }),
    task(2, { name: "Parent B", subTaskIds: [3], unfolded: false }),
    task(3, { subTaskIds: [4], finishStatus: 1, unfolded: false }),
    task(1, {
      name: "Parent A", dueTime: "2026-11-10T14:00:00Z",
      subTaskIds: [3, 99, 3], unfolded: false,
    }),
    task(5, { name: "Parent C" }),
  ];
  const data = adaptV1FilterData({ tasks, topics: [] });
  data.tasks.forEach((record) => {
    Object.freeze(record.childIds);
    Object.freeze(record);
  });
  Object.freeze(data.tasks);
  const result = filterTasks(data, settings({
    tasks: {
      text: "parent", statuses: ["unfinished"],
      deadline: { kind: "within", interval: "30min" },
    },
  }), new Date("2026-11-10T12:00:00Z"));
  expect(visibleIds(data.tasks, result.isTaskVisible)).toEqual([2, 1]);
  expect(tasks.every((record) => !("transitiveDueTime" in record))).toBe(true);
});

test.each([
  ["Date", new Date("2026-11-10T12:15:00Z"), true],
  ["ISO string", "2026-11-10T12:15:00Z", true],
  ["milliseconds", Date.parse("2026-11-10T12:15:00Z"), true],
  ["epoch", 0, true],
  ["undefined", undefined, false],
  ["null", null, false],
  ["invalid Date", new Date(NaN), false],
  ["invalid string", "not a date", false],
  ["NaN", NaN, false],
  ["Infinity", Infinity, false],
  ["out-of-range number", 9e15, false],
])("deadline normalization handles %s", (_label, dueTime, valid) => {
  const tasks = [task(1, { subTaskIds: [2], dueTime }), task(2)];
  const now = new Date("2026-11-10T12:00:00Z");
  expect(ids(apply(tasks, {
    tasks: { deadline: { kind: "within", interval: "30min" } },
  }, [], now))).toEqual(valid ? [1] : []);
  expect(ids(apply(tasks, {
    tasks: { deadline: { kind: "missing" } },
  }, [], now))).toEqual(valid ? [2] : [1, 2]);
});

test("invalid and null deadlines do not hide a valid descendant deadline", () => {
  const tasks = [
    task(1, { dueTime: new Date(NaN), subTaskIds: [2] }),
    task(2, { dueTime: null, subTaskIds: [3] }),
    task(3, { dueTime: "2026-11-10T12:15:00Z" }),
  ];
  expect(ids(apply(tasks, {
    tasks: { deadline: { kind: "within", interval: "30min" } },
  }, [], new Date("2026-11-10T12:00:00Z")))).toEqual([1, 2, 3]);
});

test("deadline and relationship edits replace previous effective results", () => {
  const tasks = [
    task(1, { subTaskIds: [2], transitiveDueTime: "2099-01-01" }),
    task(2, { dueTime: "2026-11-10T14:00:00Z" }),
  ];
  const query = { tasks: { deadline: { kind: "within", interval: "30min" } } };
  const now = new Date("2026-11-10T12:00:00Z");
  expect(ids(apply(tasks, query, [], now))).toEqual([]);
  const edited = tasks.map((record) => record.id === 2
    ? { ...record, dueTime: "2026-11-10T12:15:00Z" } : record);
  expect(ids(apply(edited, query, [], now))).toEqual([1, 2]);
  const disconnected = edited.map((record) => record.id === 1
    ? { ...record, subTaskIds: [] } : record);
  expect(ids(apply(disconnected, query, [], now))).toEqual([2]);
  expect(ids(apply(edited, query, [], now))).toEqual([1, 2]);
  expect(ids(apply(edited.filter((record) => record.id !== 2), {
    tasks: { deadline: { kind: "missing" } },
  }, [], now))).toEqual([1]);
  expect(tasks[0].transitiveDueTime).toBe("2099-01-01");
});

test.each([[2], [1]])("deadline calculation reports task cycles through %s", (childId) => {
  const tasks = [task(1, { subTaskIds: [childId] }), task(2, { subTaskIds: [1] })];
  for (const deadline of [{ kind: "missing" }, { kind: "within", interval: "30min" }]) {
    expect(() => apply(tasks, { tasks: { deadline } }, []))
      .toThrow(Error);
  }
  expect(tasks[0].subTaskIds).toEqual([childId]);
});

test.each([
  ["any", [1, 2, 3]],
  ["noSupertasks", [1, 3]],
  ["noSubtasks", [2, 3]],
  ["standalone", [3]],
])(
  "structure %s uses full relationships, including folded and filtered tasks",
  (structure, expected) => {
    const tasks = [
      task(1, { subTaskIds: [2], finishStatus: 1, unfolded: false }),
      task(2),
      task(3),
    ];
    expect(ids(apply(tasks, { tasks: { structure } }))).toEqual(expected);
  }
);

test("non-deadline traversal handles cycles and missing IDs without changing frozen inputs", () => {
  const tasks = [
    task(1, { subTaskIds: [2, 99], topics: [10, 999], dueTime: "2026-11-01" }),
    task(2, { subTaskIds: [1] }),
  ];
  const tags = [tag(10, "Cycle")];
  tags[0].subtopics.push(tags[0]);
  const input = adaptV1FilterData({ tasks, topics: tags });
  const freeze = (value, seen = new Set()) => {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    Object.values(value).forEach((child) => freeze(child, seen));
    Object.freeze(value);
  };
  const query = settings({
    tasks: {
      tagSource: "taskAndSupertasks",
    },
    taskContext: "both",
    subtagContext: true,
  });
  freeze(input);
  freeze(query);
  const result = filterTasks(input, query, new Date("2026-11-10"));
  expect(visibleIds(input.tasks, result.isTaskVisible)).toEqual([1, 2]);
  expect(visibleIds(input.tags, result.isTagVisible)).toEqual([10]);
  expect(tasks[0].subTaskIds).toEqual([2, 99]);
  expect(tasks[1].finishStatus).toBe(0);
});

test("V1 and V2 adapters produce equivalent visibility and selectable tag paths", () => {
  const tasks = [
    task(1, { topics: [10], subTaskIds: [2], thisWeek: true, finishStatus: 1 }),
    task(2, { topics: [11], repeated: true, dueTime: "2026-11-01" }),
  ];
  const v1 = adaptV1FilterData({ tasks, topics: tagTree });
  const v2 = adaptV2FilterData({
    taskMap: Object.fromEntries(
      tasks.map((entry) => [
        entry.id,
        { ...entry, childTaskIds: entry.subTaskIds },
      ])
    ),
    tagMap: {
      10: { id: 10, name: "Work", childTagIds: [11] },
      11: { id: 11, name: "Projects", childTagIds: [] },
      20: { id: 20, name: "Home", childTagIds: [] },
      30: { id: 30, name: "Empty", childTagIds: [] },
    },
    tagTasksMap: { 10: [1], 11: [2] },
    plannedTaskIdList: [1],
  });
  expect(v2.tasks).toEqual(v1.tasks);
  expect(v2.tags).toEqual(v1.tags);
  for (const options of [
    {},
    { tasks: { planned: "yes" } },
    { tags: { selectedIds: [10] } },
    { tags: { selectedIds: [11] }, taskContext: "ancestors" },
    { tasks: { statuses: ["transitivelyIrrelevant"] } },
    { tasks: { deadline: { kind: "within", interval: "1day" } } },
    { presentation: "all", subtagContext: true },
    { presentation: "automatic" },
    { presentation: "automatic", tasks: { text: "2" } },
    { presentation: "automatic", tags: { selectedIds: [10] } },
    { presentation: "withVisibleTasks", tags: { selectedIds: [30] } },
    { presentation: "withVisibleTasks", taskContext: "both" },
  ]) {
    const query = settings(options);
    const first = filterTasks(v1, query);
    const second = filterTasks(v2, query);
    expect(visibleIds(v2.tasks, second.isTaskVisible)).toEqual(
      visibleIds(v1.tasks, first.isTaskVisible)
    );
    expect(visibleIds(v2.tags, second.isTagVisible)).toEqual(
      visibleIds(v1.tags, first.isTagVisible)
    );
    expect(second.selectableTags).toEqual(first.selectableTags);
  }
});

test.each(["V1", "V2"])("%s tag-path search preserves empty name segments", (version) => {
  const tasks = [task(1, { topics: [12] })];
  const data = version === "V1"
    ? adaptV1FilterData({
        tasks,
        topics: [tag(10, "Work", [tag(11, "", [tag(12, "Frontend")])])],
      })
    : adaptV2FilterData({
        taskMap: { 1: { ...tasks[0], childTaskIds: [] } },
        tagMap: {
          10: { id: 10, name: "Work", childTagIds: [11] },
          11: { id: 11, name: "", childTagIds: [12] },
          12: { id: 12, name: "Frontend", childTagIds: [] },
        },
        tagTasksMap: { 12: [1] },
      });
  const result = filterTasks(data, settings({ tags: { pathQuery: "work//front" } }));
  expect(result.selectableTags).toEqual([
    { id: 10, path: "Work" },
    { id: 11, path: "Work/" },
    { id: 12, path: "Work//Frontend" },
  ]);
  expect(visibleIds(data.tasks, result.isTaskVisible)).toEqual([1]);
  expect(visibleIds(data.tags, result.isTagVisible)).toEqual([10, 11, 12]);
});

test("the transitive toggle adds exactly the inactive unfinished set across every four-task DAG", () => {
  const possibleLinks = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ];
  for (let graphMask = 0; graphMask < 64; graphMask += 1) {
    for (let completedMask = 0; completedMask < 16; completedMask += 1) {
      const tasks = Array.from({ length: 4 }, (_, id) =>
        task(id, {
          finishStatus: completedMask & (1 << id) ? 1 : 0,
        })
      );
      const parents = tasks.map(() => []);
      possibleLinks.forEach(([parent, child], bit) => {
        if (graphMask & (1 << bit)) {
          tasks[parent].subTaskIds.push(child);
          parents[child].push(parent);
        }
      });
      const blocked = [];
      const ordinary = [];
      const transitivelyIrrelevant = [];
      for (const current of tasks) {
        blocked[current.id] =
          parents[current.id].length > 0 &&
          parents[current.id].every(
            (id) => tasks[id].finishStatus !== 0 || blocked[id]
          );
        if (current.finishStatus === 0)
          (blocked[current.id] ? transitivelyIrrelevant : ordinary).push(
            current.id
          );
      }
      // Reverse storage order to avoid relying on a topologically sorted input.
      tasks.reverse();
      const ordinaryResult = apply(tasks, {
        tasks: { statuses: ["unfinished"] },
      });
      const withTransitive = apply(tasks, {
        tasks: {
          statuses: ["unfinished", "transitivelyIrrelevant"],
        },
      });
      expect(sorted(ordinaryResult.taskIds)).toEqual(ordinary);
      expect(sorted(withTransitive.taskIds)).toEqual(
        [...ordinary, ...transitivelyIrrelevant].sort((a, b) => a - b)
      );
      expect(
        sorted(
          withTransitive.taskIds.filter(
            (id) => !ordinaryResult.taskIds.includes(id)
          )
        )
      ).toEqual(transitivelyIrrelevant);
    }
  }
});
