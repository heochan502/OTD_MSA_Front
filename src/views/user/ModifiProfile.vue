<script setup>

</script>

<template>
<div class="profile-container">
<div class="settings-section">
      <h3 class="section-title">정보수정</h3>
      <div class="settings-list">
        <router-link to="/user/signal" class="settings-item">
          <div class="settings-icon"></div>
          <span>닉네임수정</span>
          <div class="arrow">›</div>
        </router-link>
    </div>
    <div class="settings-list">
        <router-link to="/user/signal" class="settings-item">
          <div class="settings-icon"></div>
          <span>이메일수정</span>
          <div class="arrow">›</div>
        </router-link>
      </div>
      <div class="settings-list">
              <router-link to="/user/signal" class="settings-item">
                <div class="settings-icon"></div>
                <span>비밀번호 재발행</span>
                <div class="arrow">›</div>
              </router-link>
            </div>
            <div class="settings-list">
              <router-link to="/user/signal" class="settings-item">
                <div class="settings-icon"></div>
                <span>회원탈퇴</span>
                <div class="arrow">›</div>
              </router-link>
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

.settings-section,
.support-section {
  margin-bottom: 30px;
}

.settings-section .settings-list,
.support-section .support-list {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.settings-section .settings-list .settings-item,
.support-section .support-list .support-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  text-decoration: none;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
}

.settings-section .settings-list .settings-item:hover,
.support-section .support-list .support-item:hover {
  background: #f8f9fa;
}

.settings-section .settings-list .settings-item:last-child,
.support-section .support-list .support-item:last-child {
  border-bottom: none;
}

.settings-section .settings-list .settings-item .settings-icon,
.support-section .support-list .support-item .support-icon {
  font-size: 20px;
}

.settings-section .settings-list .settings-item span,
.support-section .support-list .support-item span {
  flex: 1;
  font-weight: 500;
}

.settings-section .settings-list .settings-item .arrow,
.support-section .support-list .support-item .arrow {
  font-size: 18px;
  color: #ccc;
}
</style>