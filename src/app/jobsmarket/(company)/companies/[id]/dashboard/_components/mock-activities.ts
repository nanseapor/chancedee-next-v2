export interface Activity {
  id: string;
  type: 'application_received' | 'job_posted' | 'job_closed' | 'application_accepted' | 'application_rejected';
  message: string;
  timestamp: number;
}

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'application_received',
    message: 'ได้รับใบสมัครใหม่จาก สมชาย ใจดี สำหรับตำแหน่ง นักพัฒนา',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
  },
  {
    id: '2',
    type: 'job_posted',
    message: 'ประกาศงาน "นักพัฒนา Frontend" เผยแพร่แล้ว',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
  },
  {
    id: '3',
    type: 'application_accepted',
    message: 'ยอมรับใบสมัครของ สมหญิง รักงาน',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
  },
  {
    id: '4',
    type: 'job_closed',
    message: 'ปิดรับสมัครงาน "เจ้าหน้าที่บัญชี"',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
  {
    id: '5',
    type: 'application_received',
    message: 'ได้รับใบสมัครใหม่จาก มานะ ขยัน',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
  },
];

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days === 1) return 'เมื่อวาน';
  return `${days} วันที่แล้ว`;
}
