
export enum DonationCategory {
  TITHE = '十一奉獻',
  THANKSGIVING = '感恩奉獻',
  BUILDING = '建堂奉獻',
  LOVE_FEAST = '愛宴奉獻',
  MISSION = '宣教奉獻',
  CHARITY = '慈惠奉獻',
  SUNDAY = '主日奉獻',
  SPECIAL = '專項奉獻'
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorCode: string;
  amount: number;
  date: string;
  category: DonationCategory;
  note?: string;
}

export interface ChurchInfo {
  name: string;
  taxId: string;
  address: string;
  phone: string;
  handler: string;
}
