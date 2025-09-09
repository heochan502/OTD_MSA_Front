<script setup>
import {useRoute} from 'vue-router'


const route = useRoute();
</script>

<template>
  <div class="top_header">
    <div class="title">
      <img class="otd_logo" src="/image/main/ontoday_logo.png" alt="로고" />
      <img class="alram" src="/image/main/alarm.png" alt="알람" />
    </div> 
  </div>

  <div class="user " v-if="route.name ==='Home'" >
    <div class="user_profile ">
      <img class="avatar" src="/image/main/test.png" alt="프로필" />
      <div class="info">
        <span class="  welcome_text">안녕하세요 :)</span>
        <span class="  name ">행키 님</span>
        <router-link to="/user/login">로그인</router-link>
      </div>
    </div>
      <div class="point">
        <img class="point_img" src="/image/main/point.png" alt="포인트"/>
        <span >5,000 </span>
    </div>
    
  </div>
  
</template>

<style scoped>
.title {
  background: #00D5DF;
  margin-top: 24px;
  
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.point_img{
  width: 20px;
  height: 20px;
}

.otd_logo {
  width: 40%;  
}
.alram {
  align-self: center;
  width: 5%;
  /* position: absolute; */
  right: 20%;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content:end;
  font-size: 12px;
  row-gap: 5px;
}

.top_header {
  background: #00D5DF;
  color: #000;
  padding: 20px;
  border-radius: 20px 20px 0 0; 
  height: 104px;
}
.user_profile
{
  display: flex;
  flex-direction: row;
}
.user {
  padding: 20px 20px 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between; 
}
  .point{
  display: flex;
  justify-content: center; 
  align-self:flex-end;
  gap: 5px;
 
  }
  .point span{
    padding-top: 2px;
    font-size: 14px;
    font-weight: 500;
    
   }


.name { 
  font-size: 24px;
  font-weight: bold;
}

.avatar {
  /* font-size: 32px; */
  width: 80px;
  height: 80px;
}
</style>
