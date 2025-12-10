import type { companyDataProps } from "./company.types";
import type {
  IBaseDatabaseInterface,
  address,
  contact,
} from "./database.types";
import type { jobApplicationReturnData } from "./job-application.types";

/**
 * Valid job status values for job lifecycle management
 */
export type JobStatus =
  | "draft"
  | "published"
  | "ontimer"
  | "unpublished"
  | "closed";

/**
 * @type Required Education
 * @prop {string} jobId Job Id for this record
 * @prop {string} educationLevel - ระดับการศึกษา
 * @prop {string} gpax - เกรดเฉลี่ย
 * @prop {string} remark - หมายเหตุ
 */
export type requiredEducation = {
  jobId: string;
  educationLevel: string;
  gpax: string;
  remark: string;
};

/**
 * @type Required Certificate
 * @prop {string} certificateName - ชื่อใบรับรอง
 * @prop {string} minScore - คะแนนขั้นต่ำ
 */
export type requiredCertificate = {
  certificateName: string;
  minScore: string;
};

/**
 * @type RailStation
 * @prop {string} travelMode - วิธีการเดินทาง (legacy)
 * @prop {string} travelStation - สถานีใกล้เคียง (legacy)
 */
export type railStation = {
  travelMode: string;
  travelStation: string;
};

/**
 * @type Travels
 * @prop {string} travelMode - วิธีการเดินทาง (legacy)
 * @prop {string} travelStation - สถานีใกล้เคียง (legacy)
 */
export type travels = {
  travelMode: string;
  travelStation: string;
};

/**
 * @typedef FirebaseJobData - ข้อมูลงานใน firestore
 * @prop {string} companyId - ไอดีบริษัท
 * @prop {string} company - ชื่อบริษัท
 * @prop {string} companyLogo - โลโก้บริษัท
 * @prop {string} interviewChannel - ช่องทางสัมภาษณ์
 * @prop {string} benefitsDetails - รายละเอียดสวัสดิการ
 * @prop {string} jobFunction - ฟังก์ชันงาน
 * @prop {string} jobIndustry - อุตสาหกรรม
 * @prop {string} jobType - ประเภทงาน
 * @prop {string} careerLevel - ระดับการทำงาน
 * @prop {string} title - ตำแหน่งงาน
 * @prop {string} highlights - ข้อดีของตำแหน่งงาน
 * @prop {boolean} isNegotiable - สามารถต่อรองเงินเดือนได้
 * @prop {number} minSalary - เงินเดือนขั้นต่ำ
 * @prop {number} maxSalary - เงินเดือนสูงสุด
 * @prop {number} positions - จำนวนตำแหน่ง
 * @prop {string} workLocation - สถานที่ทำงาน
 * @prop {boolean} isOnlineInterview - สัมภาษณ์ออนไลน์
 * @prop {string} experience - ประสบการณ์
 * @prop {string} employment - การจ้างงาน
 * @prop {string} generalQualification - คุณสมบัติทั่วไป
 * @prop {string} requirementDetails - รายละเอียดคุณสมบัติ
 * @prop {string} qualificationDetails - รายละเอียดคุณสมบัติ
 * @prop {string} jobDescriptionDetails - รายละเอียดงาน
 * @prop {string} jobDescription - รายละเอียดงาน
 * @prop {string} responsibilities - หน้าที่ความรับผิดชอบ
 * @prop {number} minExperienceYear - ประสบการณ์ขั้นต่ำ
 * @prop {number} maxExperienceYear - ประสบการณ์สูงสุด
 * @prop {boolean} isAcceptNewGrads - รับนักศึกษาจบใหม่
 * @prop {boolean} hasCar - มีรถยนต์
 * @prop {boolean} hasMotorcycle - มีมอเตอร์ไซค์
 * @prop {string} contactPerson - ชื่อผู้ติดต่อ
 * @prop {string} travelMethod - วิธีการเดินทาง
 * @prop {string} mapLocation - ตำแหน่งบนแผนที่
 * @prop {string} travelMode - วิธีการเดินทาง
 * @prop {string} travelStation - สถานีใกล้เคียง
 * @prop {number} postStartDate - วันที่เริ่มประกาศ
 * @prop {number} postExpiryDate - วันที่สิ้นสุดประกาศ
 * @prop {string} jobChancedeeType - ประเภทโอกาสงาน
 * @prop {string} jobStatus - สถานะงาน
 * @prop {boolean} isActive - สถานะการใช้งาน
 * @prop {number} reactivatedCount - จำนวนการเปิดใช้งานใหม่
 * @prop {string} createBy - สร้างโดย
 * @prop {number} createDate - วันที่สร้าง
 * @prop {string} updateBy - แก้ไขโดย
 * @prop {number} updateDate - วันที่แก้ไข
 * @prop {string} workDays - วันทำงาน
 * @prop {string[]} railStation - สถานีรถไฟใกล้เคียง
 * @prop {travels} travels - การเดินทาง
 */
export interface FirebaseJobData
  extends IBaseDatabaseInterface,
    address,
    contact {
  companyId: string;
  companyName: string;
  companyLogo: string;
  interviewChannel?: string;
  interviewChannelText?: string;
  jobFunction?: string;
  jobFunctionText?: string;
  jobIndustry?: string;
  jobIndustryText?: string;
  jobType?: string;
  jobTypeText?: string;
  careerLevel?: string;
  careerLevelText?: string;
  title: string;
  highlights?: string;
  isNegotiable: boolean;
  minSalary?: number;
  maxSalary?: number;
  positions?: number;
  workLocation?: string;
  workLocationText?: string;
  isOnlineInterview: boolean;
  educationLevel?: number[]; // subcollection
  educationLevelText?: string[];
  experience?: string;
  experienceText?: string;
  employment?: string;
  employmentText?: string;
  benefitsDetails?: string;
  benefitsText?: string;
  qualificationDetails?: string;
  qualificationText?: string;
  jobDescriptionDetails?: string;
  jobDescriptionText?: string;
  minExperienceYear?: number;
  maxExperienceYear?: number;
  isAcceptNewGrads: boolean;
  travelMode?: string;
  travelStation?: string;
  postStartDate?: number;
  postExpiryDate?: number;
  jobChancedeeType?: string;
  jobStatus: JobStatus;
  isActive: boolean;
  reactivatedCount?: number;
  workDays?: string;
  workDaysText?: string;
}

/**
 * @typedef JobData - ข้อมูลงานใน firestore
 * @prop {string} companyId - ไอดีบริษัท
 * @prop {string} company - ชื่อบริษัท
 * @prop {string} companyLogo - โลโก้บริษัท
 * @prop {string} interviewChannel - ช่องทางสัมภาษณ์
 * @prop {Array<benefits>} benefits - สวัสดิการ
 * @prop {string} benefitsDetails - รายละเอียดสวัสดิการ
 * @prop {string} jobFunction - ฟังก์ชันงาน
 * @prop {string} jobIndustry - อุตสาหกรรม
 * @prop {string} jobType - ประเภทงาน
 * @prop {string} careerLevel - ระดับการทำงาน
 * @prop {string} title - ตำแหน่งงาน
 * @prop {string} highlights - ข้อดีของตำแหน่งงาน
 * @prop {boolean} isNegotiable - สามารถต่อรองเงินเดือนได้
 * @prop {number} minSalary - เงินเดือนขั้นต่ำ
 * @prop {number} maxSalary - เงินเดือนสูงสุด
 * @prop {number} positions - จำนวนตำแหน่ง
 * @prop {string} workLocation - สถานที่ทำงาน
 * @prop {boolean} isOnlineInterview - สัมภาษณ์ออนไลน์
 * @prop {string} experience - ประสบการณ์
 * @prop {string} employment - การจ้างงาน
 * @prop {string} generalQualification - คุณสมบัติทั่วไป
 * @prop {string} requirementDetails - รายละเอียดคุณสมบัติ
 * @prop {string} qualificationDetails - รายละเอียดคุณสมบัติ
 * @prop {string} jobDescriptionDetails - รายละเอียดงาน
 * @prop {string} jobDescription - รายละเอียดงาน
 * @prop {string} responsibilities - หน้าที่ความรับผิดชอบ
 * @prop {number} minExperienceYear - ประสบการณ์ขั้นต่ำ
 * @prop {number} maxExperienceYear - ประสบการณ์สูงสุด
 * @prop {boolean} isAcceptNewGrads - รับนักศึกษาจบใหม่
 * @prop {boolean} hasCar - มีรถยนต์
 * @prop {boolean} hasMotorcycle - มีมอเตอร์ไซค์
 * @prop {Array<number>} requiredEducation - การศึกษาที่ต้องการ
 * @prop {string} contactPerson - ชื่อผู้ติดต่อ
 * @prop {contact} contact - ข้อมูลติดต่อ
 * @prop {string} travelMethod - วิธีการเดินทาง
 * @prop {string} mapLocation - ตำแหน่งบนแผนที่
 * @prop {string} travelMode - วิธีการเดินทาง
 * @prop {string} travelStation - สถานีใกล้เคียง
 * @prop {address} address - ที่อยู่
 * @prop {number} postStartDate - วันที่เริ่มประกาศ
 * @prop {number} postExpiryDate - วันที่สิ้นสุดประกาศ
 * @prop {string} jobChancedeeType - ประเภทโอกาสงาน
 * @prop {string} jobStatus - สถานะงาน
 * @prop {boolean} isActive - สถานะการใช้งาน
 * @prop {number} reactivatedCount - จำนวนการเปิดใช้งานใหม่
 * @prop {string} createBy - สร้างโดย
 * @prop {number} createDate - วันที่สร้าง
 * @prop {string} updateBy - แก้ไขโดย
 * @prop {number} updateDate - วันที่แก้ไข
 * @prop {string} workDays - วันทำงาน
 * @prop {Array<railStation>} railStation - สถานีรถไฟใกล้เคียง
 * @prop {travels} travels - การเดินทาง
 */

/**
 * @typedef JobEditType - ข้อมูลงานที่ต้องการแก้ไข
 * @prop {string} id - ไอดี
 * @prop {string} companyId - ไอดีบริษัท
 * @prop {string} company - ชื่อบริษัท
 * @prop {string} companyLogo - โลโก้บริษัท
 * @prop {string} interviewChannel - ช่องทางสัมภาษณ์
 * @prop {Array<benefits>} benefits - สวัสดิการ
 * @prop {string} benefitsDetails - รายละเอียดสวัสดิการ
 * @prop {string} jobFunction - ฟังก์ชันงาน
 * @prop {string} jobIndustry - อุตสาหกรรม
 * @prop {string} jobType - ประเภทงาน
 * @prop {string} careerLevel - ระดับการทำงาน
 * @prop {string} title - ตำแหน่งงาน
 * @prop {string} highlights - ข้อดีของตำแหน่งงาน
 * @prop {boolean} isNegotiable - สามารถต่อรองเงินเดือนได้
 * @prop {number} minSalary - เงินเดือนขั้นต่ำ
 * @prop {number} maxSalary - เงินเดือนสูงสุด
 * @prop {number} positions - จำนวนตำแหน่ง
 * @prop {string} workLocation - สถานที่ทำงาน
 * @prop {boolean} isOnlineInterview - สัมภาษณ์ออนไลน์
 * @prop {string} experience - ประสบการณ์
 * @prop {string} employment - การจ้างงาน
 * @prop {string} generalQualification - คุณสมบัติทั่วไป
 * @prop {string} requirementDetails - รายละเอียดคุณสมบัติ
 * @prop {string} qualificationDetails - รายละเอียดคุณสมบัติ
 * @prop {string} jobDescriptionDetails - รายละเอียดงาน
 * @prop {string} jobDescription - รายละเอียดงาน
 * @prop {string} responsibilities - หน้าที่ความรับผิดชอบ
 * @prop {number} minExperienceYear - ประสบการณ์ขั้นต่ำ
 * @prop {number} maxExperienceYear - ประสบการณ์สูงสุด
 * @prop {boolean} isAcceptNewGrads - รับนักศึกษาจบใหม่
 * @prop {boolean} hasCar - มีรถยนต์
 * @prop {boolean} hasMotorcycle - มีมอเตอร์ไซค์
 * @prop {Array<requiredEducation>} requiredEducation - การศึกษาที่ต้องการ
 * @prop {Array<requiredCertificate>} requiredCertificate - ใบรับรองที่ต้องการ
 * @prop {string} contactPerson - ชื่อผู้ติดต่อ
 * @prop {contact} contact - ข้อมูลติดต่อ
 * @prop {string} travelMethod - วิธีการเดินทาง
 * @prop {string} mapLocation - ตำแหน่งบนแผนที่
 * @prop {string} travelMode - วิธีการเดินทาง
 * @prop {string} travelStation - สถานีใกล้เคียง
 * @prop {address} address - ที่อยู่
 * @prop {number} postStartDate - วันที่เริ่มประกาศ
 * @prop {number} postExpiryDate - วันที่สิ้นสุดประกาศ
 * @prop {string} jobChancedeeType - ประเภทโอกาสงาน
 * @prop {string} jobStatus - สถานะงาน
 * @prop {boolean} isActive - สถานะการใช้งาน
 * @prop {number} reactivatedCount - จำนวนการเปิดใช้งานใหม่
 * @prop {string} workDays - วันทำงาน
 * @prop {Array<railStation>} railStation - สถานีรถไฟใกล้เคียง
 * @prop {travels} travels - การเดินทาง
 */
export interface IJobEditType {
  uid?: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  interviewChannel?: string;
  interviewChannelText?: string;
  jobFunction?: string;
  jobFunctionText?: string;
  jobIndustry?: string;
  jobIndustryText?: string;
  jobType?: string;
  jobTypeText?: string;
  careerLevel?: string;
  careerLevelText?: string;
  title: string;
  highlights?: string;
  experience?: string;
  experienceText?: string;
  employment?: string;
  employmentText?: string;
  isNegotiable: boolean;
  minSalary?: number;
  maxSalary?: number;
  positions?: number;
  workLocation?: string;
  workLocationText?: string;
  isOnlineInterview: boolean;
  benefitsDetails?: string;
  benefitsText?: string;
  qualificationDetails?: string;
  qualificationText?: string;
  jobDescriptionDetails?: string;
  jobDescriptionText?: string;
  minExperienceYear?: number;
  maxExperienceYear?: number;
  isAcceptNewGrads: boolean;
  hasCar?: boolean;
  hasMotorcycle?: boolean;
  educationLevel?: number[]; // subcollection
  educationLevelText?: string[];
  contact?: contact;
  travelMode?: string;
  travelStation?: string;
  postStartDate?: number;
  postExpiryDate?: number;
  address?: address;
  jobStatus: JobStatus;
  isActive: boolean;
  reactivatedCount?: number;
  workDays?: string;
  workDaysText?: string;
}

export interface jobDataProps extends IJobEditType, IBaseDatabaseInterface {}

/**
 * @typedef IJobReturnData - ข้อมูลงานที่ return กลับ
 * @prop {string} id - ไอดี
 * @prop {jobDataProps} data - ข้อมูลงาน
 */
export interface IJobReturnData {
  id: string;
  data: jobDataProps;
}

export interface IJobPostFilterType {
  company?: string | string[];
  keyword?: string | string[];
  jobFunction?: string | string[];
  jobIndustry?: string | string[];
  jobType?: string | string[];
  careerLevel?: string | string[];
  workLocationType?: string | string[];
  minSalary?: string | string[];
  maxSalary?: string | string[];
  page?: number;
  pageSize?: number;
}

export interface IJobPostFilterTypeV3 {
  jobId?: string | string[];
  company?: string | string[];
  keyword?: string | string[];
  jobIndustries?: string | string[];
  jobFunctions?: string | string[];
  jobTypes?: string | string[];
  educationLevels?: string | string[];
  experienceYears?: string | string[];
  workdays?: string | string[];
  workLocations?: string | string[];
  mrtStations?: string | string[];
  locations?: string | string[];
  minSalary?: string | string[];
  maxSalary?: string | string[];
  page?: number;
  pageSize?: number;
}

export interface IJobPostRequests {
  jobPosition: string;
  readNumber: number;
  status: string;
  newApplication: number;
  readedNumber: number;
}

export interface IJobConsolidatedData {
  companyInfo: companyDataProps;
  job: IJobReturnData;
  jobApplicationInfo: jobApplicationReturnData[];
}

export interface IJobOfferData {
  jobId: string;
  candidateId: string;
  offerCount: number;
  isApplied: boolean;
  isActive: boolean;
  note: string;
}

export interface IOfferReturnData {
  uid: string;
  jobId: string;
  note: string;
  isActive: boolean;
  candidateId: string;
  offerCount: number;
  isApplied: boolean;
}
export interface IJobOfferReturnData {
  jobId: string;
  data: jobDataProps;
  offer:
    | {
        jobId: string;
        offer: {
          id: string;
          data: IOfferReturnData;
        };
      }[]
    | undefined;
}

export interface consolidatedJobData {
  companyInfo: companyDataProps;
  job: IJobReturnData;
  jobApplicationInfo: jobApplicationReturnData[];
}
export interface IAppliedResume {
  isShowInAppliedResume?: boolean;
}
