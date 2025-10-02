<script setup>
import { ref } from 'vue'

const showModal = ref(false)
const email = ref('')

const handlePasswordReset = () => {
  showModal.value = true
}

const handleSubmit = async () => {
  if (!email.value) {
    alert('이메일을 입력해주세요.')
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    alert('올바른 이메일 형식이 아닙니다.')
    return
  }
  
  try {
    const response = await fetch('http://localhost:8080/api/OTD/email/send-password-reset-link', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value })
    })
    
    if (response.ok) {
      handleClose()
      window.location.href = `/user/password-reset-sent?email=${encodeURIComponent(email.value)}`
    } else {
      const error = await response.json()
      alert(error.message || '이메일 전송에 실패했습니다.')
    }
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error)
    alert('네트워크 오류가 발생했습니다.')
  }
}
const handleClose = () => {
  showModal.value = false
  email.value = ''
}
</script>

<template>
<div class="profile-container">
  <div class="settings-section">
    <h3 class="section-title">정보수정</h3>
    
    <div class="settings-list">
      <router-link to="/user/nickname" class="settings-item">
        <div class="settings-icon">👤</div>
        <span>닉네임수정</span>
        <div class="arrow">›</div>
      </router-link>
    </div>
    
    <div class="settings-list">
      <router-link to="/user/email" class="settings-item">
        <div class="settings-icon">📧</div>
        <span>이메일수정</span>
        <div class="arrow">›</div>
      </router-link>
    </div>
    
    <div class="settings-list">
      <button @click="handlePasswordReset" class="settings-item">
        <div class="settings-icon">🔒</div>
        <span>비밀번호 재설정</span>
        <div class="arrow">›</div>
      </button>
    </div>
    
    <div class="settings-list">
      <router-link to="/user/withdrawal" class="settings-item">
        <div class="settings-icon">🚪</div>
        <span>회원탈퇴</span>
        <div class="arrow">›</div>
      </router-link>
    </div>
  </div>

  <!-- 비밀번호 재설정 모달 -->
  <div v-if="showModal" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">비밀번호 재설정</h2>
      <p class="modal-description">
        비밀번호 재설정을 위한 이메일을 보내드리겠습니다.<br />
        등록된 이메일을 입력해주세요.
      </p>
      
      <input
        v-model="email"
        type="email"
        placeholder="이메일을 입력하세요"
        class="modal-input"
      />
      
      <div class="modal-buttons">
        <button @click="handleClose" class="btn-cancel">취소</button>
        <button @click="handleSubmit" class="btn-submit">전송</button>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  min-height: 100vh;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}

.settings-section {
  margin-bottom: 30px;
}

.settings-list {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  margin-bottom: 12px;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  text-decoration: none;
  color: #333;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
}

.settings-item:hover {
  background: #f8f9fa;
}

.settings-icon {
  font-size: 20px;
}

.settings-item span {
  flex: 1;
  font-weight: 500;
}

.arrow {
  font-size: 18px;
  color: #ccc;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 448px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}

.modal-description {
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-buttons {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.btn-submit {
  background: #3b82f6;
  color: white;
}

.btn-submit:hover {
  background: #2563eb;
}
</style>