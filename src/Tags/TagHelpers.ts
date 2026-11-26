// TODO: needs full review

export interface TagPathSource {
  id: number;
  name: string;
  childIds: readonly number[];
}

// Tags form a tree. Keep input order and preserve empty names in full paths.
export const getTagPaths = (
  tags: readonly TagPathSource[]
): { id: number; path: string }[] => {
  // For taskFilter.ts - this creates tagsById again, and doesn't reuse the tagLinks
  const tagsById = new Map(tags.map((tag) => [tag.id, tag]));
  const parentIds = new Map<number, number>();
  tags.forEach((tag) => {
    tag.childIds.forEach((id) => {
      if (tagsById.has(id) && !parentIds.has(id)) parentIds.set(id, tag.id);
    });
  });

  return tags.map((tag) => {
    const names: string[] = [];
    const visitedIds = new Set<number>();
    let current: TagPathSource | undefined = tag;
    // Invalid cyclic input must still terminate.
    while (current && !visitedIds.has(current.id)) {
      visitedIds.add(current.id);
      names.push(current.name);
      const parentId = parentIds.get(current.id);
      current = parentId === undefined ? undefined : tagsById.get(parentId);
    }
    return { id: tag.id, path: names.reverse().join("/") };
  });
};
