"use server";

import {
  getMasterData as _getMasterData,
  getMasterDataByCategory as _getMasterDataByCategory,
} from "../repositories/web-master-data";

export async function webMasterDataGet() {
  try {
    return await _getMasterData();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

export async function webMasterDataGetByCategory(category: string) {
  try {
    return await _getMasterDataByCategory(category);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}
