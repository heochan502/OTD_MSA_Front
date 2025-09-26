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
  
  .settings-list,
  .support-list {
    background: white;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    overflow: hidden;
    
    .settings-item,
    .support-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      text-decoration: none;
      color: #333;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s ease;
      
      &:hover {
        background: #f8f9fa;
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .settings-icon,
      .support-icon {
        font-size: 20px;
      }
      
      span {
        flex: 1;
        font-weight: 500;
      }
      
      .arrow {
        font-size: 18px;
        color: #ccc;
      }
    }
  }
}
</style>