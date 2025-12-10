/**
 * @type modifiedDateDate - ข้อมูลวันที่สร้างและแก้ไข (Shared type)
 * @prop {string} createBy - สร้างโดย
 * @prop {number} createDate - วันที่สร้าง
 * @prop {string} updateBy - แก้ไขโดย
 * @prop {number} updateDate - วันที่แก้ไข
 */
export interface IBaseDatabaseInterface {
  uid?: string;
  createdBy?: string;
  createdAt?: number;
  updatedBy?: string;
  updatedAt?: number;
}

/**
 * @type Contact - ข้อมูลการติดต่อ (Shared type)
 * @prop {string} phone - เบอร์โทรศัพท์
 * @prop {string} email - อีเมล
 * @prop {string} mobile - เบอร์มือถือ
 * @prop {string} facebook - เฟสบุ๊ค
 * @prop {string} linkedin - ลิงค์อิน
 * @prop {string} twitter - ทวิตเตอร์
 * @prop {string} instagram - อินสตาแกรม
 * @prop {string} line - ไลน์
 * @prop {string} website - เว็บไซต์
 */
export interface contact extends IBaseDatabaseInterface {
  phone: string;
  email: string;
  mobile?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  line?: string;
  website?: string;
}

/**
 * @type Address - ข้อมูลที่อยู่ (Shared type)
 * @prop {string} addressLine1 - บ้านเลขที่
 * @prop {string} addressLine2 - หมู่ที่
 * @prop {string} subDistrict - ตำบล
 * @prop {string} district - อำเภอ
 * @prop {string} province - จังหวัด
 * @prop {string} postCode - รหัสไปรษณีย์
 */
export interface address extends IBaseDatabaseInterface {
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postCode: string;
}

/**
 * @typedef {Object} Benefit - สวัสดิการ (Welfare or Benefit)
 * @param {string} name - The name of the benefit.
 * @param {string} amount - The amount or value associated with the benefit.
 * @param {string | undefined} note - Additional notes or comments about the benefit (optional).
 */
export type benefit = {
  refId: string;
  name: string;
  amount: string;
  note: string | undefined;
};

/**
 * @type FirebaseStrippedTimestamp - ข้อมูล Timestamp ที่ถูกลบ functions ออกเพื่อ serialize JSON (Shared type)
 * @prop {number} seconds - วินาที
 * @prop {number} nanoseconds - นาโนวินาที
 */
export type FirebaseStrippedTimestamp = {
  seconds: number;
  nanoseconds: number;
};
/**
 * @type systemMessageType - system message template
 * @prop {string} code - code
 * @prop {string} message - message {error,  info}
 */
export type systemMessageType = {
  code: string;
  message: string;
};
