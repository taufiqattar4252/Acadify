import api from '../lib/axios';

export const getPartners = async () => {
  const response = await api.get('/admin/partners');
  return response.data.data;
};

export const getPartnerById = async (id: string) => {
  const response = await api.get(`/admin/partners/${id}`);
  return response.data.data;
};

export const createPartner = async (data: any) => {
  const response = await api.post('/admin/partners', data);
  return response.data.data;
};

export const updatePartner = async (id: string, data: any) => {
  const response = await api.put(`/admin/partners/${id}`, data);
  return response.data.data;
};

export const updatePartnerStatus = async (id: string, status: boolean) => {
  const response = await api.patch(`/admin/partners/${id}/status`, { status });
  return response.data.data;
};

export const deletePartner = async (id: string) => {
  const response = await api.delete(`/admin/partners/${id}`);
  return response.data;
};

export const generatePartnerCoupon = async (id: string, data: any) => {
  const response = await api.post(`/admin/partners/${id}/generate-coupon`, data);
  return response.data.data;
};

export const changePartnerCommission = async (id: string, data: { commissionType: string; commissionValue: number }) => {
  const response = await api.patch(`/admin/partners/${id}/commission`, data);
  return response.data.data;
};

export const getPartnerCommissions = async (id: string) => {
  const response = await api.get(`/admin/partners/${id}/commissions`);
  return response.data.data;
};

export const getPartnerPurchases = async (id: string) => {
  const response = await api.get(`/admin/partners/${id}/purchases`);
  return response.data.data;
};

export const payCommission = async (commissionId: string) => {
  const response = await api.patch(`/admin/partners/commissions/${commissionId}/pay`);
  return response.data.data;
};
