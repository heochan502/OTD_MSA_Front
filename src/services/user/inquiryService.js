import axios from '@/services/httpRequester';

const path = `/email`;

// 문의하기 전송
export const sendInquiry = async (emailData) => {
    try {
        const payload = {
            subject: emailData.subject,
            message: emailData.message,
            senderName: emailData.senderName
        };

        console.log('문의 전송 요청:', payload);
        const response = await axios.post(`${path}/sendInquiry`, payload);
        console.log('문의 전송 응답:', response.data);
        return response.data;
    } catch (error) {
        console.error('이메일 전송 오류 상세:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        if (error.response?.status === 401) {
            throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (error.response?.status === 400) {
            throw new Error(error.response.data.message || '입력 데이터가 올바르지 않습니다.');
        }
        
        throw error;
    }
};

// 내 문의 내역 조회
export const getMyInquiries = async () => {
    try {
        const response = await axios.get(`${path}/inquiry/my-inquiries`);
        if (response.data && response.data.result) {
            return response.data.result;
        } else if (Array.isArray(response.data)) {
            console.log('배열 형태 응답:', response.data);
            return response.data;
        } else {
            console.log('예상치 못한 응답 구조:', response.data);
            return [];
        }
    } catch (error) {
        console.error('문의 내역 조회 오류:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        
        if (error.response?.status === 401) {
            throw new Error('로그인이 필요합니다.');
        }
        
        throw new Error('문의 내역을 불러오는데 실패했습니다: ' + error.message);
    }
};

// 문의 상세 조회
export const getInquiryDetail = async (inquiryId) => {
    try {

        const response = await axios.get(`${path}/inquiry/${inquiryId}`);

        
        if (response.data && response.data.result) {
            return response.data.result;
        }
        return response.data;
    } catch (error) {
        console.error('문의 상세 조회 오류:', error);
        throw new Error('문의 상세 정보를 불러오는데 실패했습니다: ' + error.message);
    }
};

// 연락처 폼 전송
export const sendContactForm = async (formData) => {
    return sendInquiry({
        subject: `[연락처] ${formData.subject}`,
        message: formData.message,
        senderName: formData.name
    });
};

// 피드백 전송
export const sendFeedback = async (feedbackData) => {
    return sendInquiry({
        subject: `[피드백] ${feedbackData.type}`,
        message: feedbackData.content,
        senderName: '익명 사용자'
    });
};