import { getTagPaths } from "../Tags/TagHelpers";
import {
  getTopicPathByTopicIdV1,
  getTopicRecordsV1,
} from "../Topics/TopicHelperV1";
import { getSelectableTags } from "../Tasks/TaskTagHelpers";

test("full paths preserve input order, distinguish equal names and leave input unchanged", () => {
  const tags = [
    { id: 3, name: "Frontend", childIds: [] },
    { id: 1, name: "Work", childIds: [2] },
    { id: 2, name: "Programming", childIds: [3] },
    { id: 4, name: "Home", childIds: [5] },
    { id: 5, name: "Frontend", childIds: [] },
  ];
  tags.forEach((tag) => {
    Object.freeze(tag.childIds);
    Object.freeze(tag);
  });
  Object.freeze(tags);

  expect(getTagPaths(tags)).toEqual([
    { id: 3, path: "Work/Programming/Frontend" },
    { id: 1, path: "Work" },
    { id: 2, path: "Work/Programming" },
    { id: 4, path: "Home" },
    { id: 5, path: "Home/Frontend" },
  ]);
});

test.each([
  [["Work", "", "Frontend"], "Work//Frontend"],
  [["", "Programming", "Frontend"], "/Programming/Frontend"],
  [["Work", "Programming", ""], "Work/Programming/"],
  [["", "", ""], "//"],
])("empty tag names remain path segments: %j", (names, expected) => {
  const tags = names.map((name, index) => ({
    id: index,
    name,
    childIds: index < names.length - 1 ? [index + 1] : [],
  }));
  expect(getTagPaths(tags)[2]).toEqual({ id: 2, path: expected });
});

test("V1 popup options retain names and immediate parents, and path lookup preserves empty names", () => {
  const topics = [
    {
      id: 10,
      name: "Work",
      subtopics: [
        {
          id: 11,
          name: "",
          subtopics: [{ id: 12, name: "Frontend", subtopics: [] }],
        },
      ],
    },
    { id: 20, name: "Home", subtopics: [] },
  ];
  const before = JSON.stringify(topics);
  expect(getTopicRecordsV1(topics)).toEqual([
    { id: 10, name: "Work", childIds: [11] },
    { id: 11, name: "", childIds: [12] },
    { id: 12, name: "Frontend", childIds: [] },
    { id: 20, name: "Home", childIds: [] },
  ]);
  expect(getSelectableTags(topics)).toEqual([
    { id: 10, name: "Work", path: "Work", parentId: null },
    { id: 11, name: "", path: "Work/", parentId: 10 },
    { id: 12, name: "Frontend", path: "Work//Frontend", parentId: 11 },
    { id: 20, name: "Home", path: "Home", parentId: null },
  ]);
  expect(getTopicPathByTopicIdV1(topics, 12)).toBe("Work//Frontend");
  expect(getTopicPathByTopicIdV1(topics, 11)).toBe("Work/");
  expect(getTopicPathByTopicIdV1(topics, 999)).toBe("");
  expect(getTopicPathByTopicIdV1([], 12)).toBe("");
  expect(JSON.stringify(topics)).toBe(before);
});
