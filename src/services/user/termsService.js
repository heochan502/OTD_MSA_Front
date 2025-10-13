import axios from '@/services/httpRequester';

export const termsService = {
  async getActiveTerms() {
    const response = await axios.get('/terms/active');
    return response.data;  
  },

  async getTermsByType(type) {
    const response = await axios.get(`/terms/${type}`);
    return response.data;
  },

  // 약관 동의 처리
  async agreeToTerms(userId, termsIds) {
    const response = await axios.post('/terms/agree', 
      { termsIds },
      { params: { userId } }
    );
    return response.data;
  },

  // 사용자 약관 동의 내역 조회
  async getUserAgreements(userId) {
    const response = await axios.get(`/terms/agreements/${userId}`);
    return response.data;
  },

  // 필수 약관 동의 여부 확인
  async checkRequiredAgreements(userId) {
    const response = await axios.get(`/terms/check-required/${userId}`);
    return response.data;
  }
};