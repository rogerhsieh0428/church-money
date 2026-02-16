
import { DonationCategory, ChurchInfo } from './types';

export const DEFAULT_CHURCH_INFO: ChurchInfo = {
  name: '財團法人台中市基督教富足基金會',
  taxId: '87063184',
  address: '台中市大里區大明路 395-10 號',
  phone: '（04）2482-3627',
  handler: '黃美珠'
};

export const CATEGORIES = Object.values(DonationCategory);

export const MOCK_DONATIONS = [
  { id: '1', donorName: '林志遠', donorCode: 'FZ0003', amount: 5000, date: '2025-01-19', category: DonationCategory.TITHE },
  { id: '2', donorName: '林志遠', donorCode: 'FZ0003', amount: 4000, date: '2025-02-16', category: DonationCategory.TITHE },
  { id: '3', donorName: '張君如', donorCode: 'FZ0004', amount: 12000, date: '2025-01-12', category: DonationCategory.TITHE },
  { id: '4', donorName: '張君如', donorCode: 'FZ0004', amount: 6000, date: '2025-02-02', category: DonationCategory.THANKSGIVING },
];
