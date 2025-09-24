import api from "./api";

export interface AffiliateInfo {
  code: string;
  referrals: number;
  clicks: number;
  earnings: number;
}

export const affiliateService = {
  getMy: async () => api.request<AffiliateInfo>(`/affiliate/me`, { method: "GET" }),
  register: async () => api.request(`/affiliate/register`, { method: "POST" }),
};

export default affiliateService;
