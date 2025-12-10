export interface masterData {
  // collectionName: string;
  uid: string;
  code: string;
  label: string;
  icon?: string;
  sort?: number;
  reference?: string;
  members?: string[];
  isActive: boolean;
  updateAt: number;
  createAt: number;
  updateBy: string;
  createBy: string;
}

export interface masterInputs {
  // collectionName: string;
  label: string;
  code: string;
  reference?: string;
  members?: string[];
  idToken: string;
}

export interface masterDeleteInputs {
  collectionName: string;
  code: string;
  uid: string;
}

export interface masterQueryParams {
  collectionName: string;
  code?: string | null;
}

export interface masterReturnParams {
  collectionName: string;
  data: masterData[];
}

export interface masterQueryManyParams {
  collections: string[];
}

export interface MasterDataCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
