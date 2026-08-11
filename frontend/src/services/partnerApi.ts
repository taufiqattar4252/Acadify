import api from '../lib/axios';

export const partnerLogin = async (data: any) => {
  const response = await api.post('/auth/partner/login', data);
  return response.data;
};

export const getPartnerDashboard = async () => {
  const response = await api.get('/partner/dashboard');
  return response.data.data;
};

export const getPartnerProfile = async () => {
  const response = await api.get('/partner/profile');
  return response.data.data;
};

export const updatePartnerProfile = async (data: any) => {
  const response = await api.put('/partner/profile', data);
  return response.data.data;
};

export const getPartnerCommissions = async () => {
  const response = await api.get('/partner/commissions');
  return response.data.data;
};

export const getPartnerPurchases = async () => {
  const response = await api.get('/partner/purchases');
  return response.data.data;
};
