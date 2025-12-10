import type { Filter } from "firebase-admin/firestore";

export const fetchDataByFilter = async <T>(
  filter: Filter | undefined,
  fetchFunction: (filter?: Filter) => Promise<T[] | null>,
): Promise<T[] | null> => (filter ? fetchFunction(filter) : null);
