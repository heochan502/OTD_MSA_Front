import axios from '@/services/httpRequester';

const path = `${import.meta.env.VITE_BASE_URL}/email`;

class EmailService {
    async sendInquiry(emailData) {
        try {
            const response = await fetch(`${path}/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('이메일 전송 오류:', error);
            throw new Error('이메일 전송에 실패했습니다: ' + error.message);
        }
    }

    // 추가적인 이메일 관련 메소드들
    async sendContactForm(formData) {
        return this.sendInquiry({
            subject: `[연락처] ${formData.subject}`,
            message: formData.message,
            senderName: formData.name,
            senderEmail: formData.email,
            timestamp: new Date().toISOString()
        });
    }

    async sendFeedback(feedbackData) {
        return this.sendInquiry({
            subject: `[피드백] ${feedbackData.type}`,
            message: feedbackData.content,
            senderName: '익명 사용자',
            timestamp: new Date().toISOString()
        });
    }
}

export default new EmailService();