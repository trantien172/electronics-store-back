import api from '@/lib/axios';

export interface CreateRepairItemDto {
  categoryId: number;
  serviceId?: number;
  deviceModel?: string;
  deviceSerial?: string;
  accessories?: string;
  receivedCondition?: string;
  problemDescription: string;
  serviceMode?: 'AT_SHOP' | 'AT_HOME';
}

export interface CreateRepairDto {
  contact: string;
  name?: string;
  visitAddress?: string;
  note?: string;
  otp?: string;
  repairItems: [CreateRepairItemDto];
}

export interface CreateCounterRepairDto extends Omit<CreateRepairDto, 'repairItems'> {
  repairItems: CreateRepairItemDto[];
}

export interface QuickLookupRepair {
  id: number;
  code: string;
  status: string;
  receivedAt: string;
  repairItems: {
    id: number;
    status: string;
    deviceModel?: string | null;
    problemDescription?: string | null;
    totalAmount: string | number;
    category?: { name: string } | null;
  }[];
}

export const RepairService = {
  async create(dto: CreateRepairDto) {
    const { data } = await api.post('/repair', dto);
    return data;
  },
  async createAtCounter(dto: CreateCounterRepairDto) {
    const { data } = await api.post('/repair/at-counter', dto);
    return data;
  },
  async track(body: { code: string; phone: string; otp: string }) {
    const { data } = await api.post('/repair/track', body);
    return data;
  },
  async quickLookup(body: { phone: string; otp?: string }) {
    const { data } = await api.post<QuickLookupRepair[]>('/repair/quick-lookup', body);
    return data;
  },
};
