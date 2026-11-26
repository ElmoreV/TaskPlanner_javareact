// A plain alias of number would allow task and tag IDs to be mixed. These
// phantom properties distinguish them during type checking; at runtime and in
// saved data, IDs remain numbers. Cast stored IDs at the typed input boundary.
export type TaskID = number & { readonly __brand: "TaskID" };
export type TagID = number & { readonly __brand: "TagID" };
