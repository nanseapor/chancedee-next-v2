"use client";

import { Timestamp } from "firebase/firestore";

export const formatFirebaseTimestamp = (createDate?: Timestamp) => {
  if (createDate) {
    // const formatted = createDate.toDate().toLocaleDateString("th-TH");
    console.log(createDate);
    const formatted = createDate.toString();
    return formatted;
  }
  return "-";
};

export const dateFormatTimestamp = (updateDate: Timestamp) => {
  const date = updateDate.toDate();
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
};

export const convertTimestampToDate = (timestamp: Timestamp) => {
  const ts = new Timestamp(timestamp.seconds, timestamp.nanoseconds);
  return ts.toDate();
};

export const formatDateFromMillis = (createDate?: number) => {
  if (createDate) {
    const formatted = new Date(createDate).toLocaleDateString("th-TH");
    return formatted;
  }
  return "-";
};
