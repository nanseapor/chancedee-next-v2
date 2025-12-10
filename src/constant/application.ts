export enum MasterJobApplicationStatuses {
  withdraw = "withdraw", // ยกเลิกการสมัคร
  accepted = "accepted", // รอนัดสัมภาษณ์
  rejected = "rejected", // ถูกปฏิเสธ
  read = "read", // เปิดอ่านแล้ว
  new = "applied", // สมัครใหม่
  scheduled = "scheduled", // นัดสัมภาษณ์
  cancelled = "cancelled", // ยกเลิกการนัดสัมภาษณ์
  confirmed = "confirmed",
  declined = "declined",
  closed = "closed",
  system = "systemclosed",
}
