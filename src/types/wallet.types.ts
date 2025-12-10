export interface transactionType {
  transactionId: string;
  transactionOwner: string;
  transactionOrigin: string;
  transactionType: string;
  transactionAmount: number;
  transactionTime: number;
  remark?: string;
}

export type pocketType = {
  uid: string;
  currency: string;
  balance: number;
  latest: transactionType[];
};

export type currency = "coin" | "star";
