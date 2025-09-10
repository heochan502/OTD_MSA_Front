<script setup>
import {useRoute, useRouter} from 'vue-router'
import { computed } from 'vue';
import CommunityCategory from '@/components/community/CommunityCategory.vue';

const route = useRoute();
const router = useRouter();

const userInfo = {
  name : '보노보노',
  nickName: '뭘보노',
  userPoint: 10000,
}

const categoryLabelMap = {
  free:'자유수다',
  diet: '다이어트',
  work: '운동',
  love: '연애'
};
const headerType = computed(() => route.meta.headerType ?? 'logo');
const showUserPanel = computed(() => route.meta.showUserPanel === true);

const headerTitle = computed (() =>
{
 
  // 타이틀이 있으면 타이틀 우선으로 타이틀을 리턴하고
  if (route.meta.title)
  {
    return route.meta.title;
  }
  // 타이틀이 없고 카테고리가 있으면 카테고리의 params에서 객체의 값을 mapping 해서 리턴 해줌
  //  혹시나 값없으면 커뮤니티로 리턴 함  
  if (route.name==='CommunityCategory')
  {
    return categoryLabelMap[route.params.category] ?? '커뮤니티';
  }
  return ''
})

const handleClick= ()=>{
  console.log("알람 클릭");
}

</script>

<template>
  <div class="top_header">
    <!-- 로고 출력 해야할 때 -->
    <div class="title" v-if="headerType === 'logo'">
      <img class="otd_logo" src="/image/main/ontoday_logo.png" alt="로고" />
      <img class="alram" src="/image/main/alarm.png" alt="알람" @click="handleClick" />
    </div>
    <!-- 타이틀 출력 할때 -->
    <div class="title" v-else>
      <button class="black-btn" @click="$router.back()" aria-label="뒤로가기">
        <img class="back-btn" src="/image/main/back_icon.png" alt="뒤로가기"></button>
      <div class="hearder-text">{{ headerTitle }}</div>
      <img class="alram" src="/image/main/alarm.png" alt="알람" @click="handleClick" />
    </div>
  </div>




  <div class="user " v-if="route.name ==='Home'">
    <div class="user_profile ">
      <img class="avatar" src="/image/main/test.png" alt="프로필"></img>
      <div class="info">
        <span class="  welcome_text">안녕하세요 :)</span>
        <span class="  name ">행키 님</span>
      </div>
    </div>
<<<<<<< HEAD
    <div class="point">
      <router-link to="/pointshop" class="point-link">
      <img class="point_img" src="/image/main/point.png" alt="포인트" />
      <span>5,000 </span>
      </router-link>
    </div>
=======
      <div class="point">
        <router-link to="/pointshop" class="pointShop" :class="{active : route.path.startsWith('/pointshop')}">
        <img class="point_img" src="/image/main/point.png" alt="포인트"/>
        <span >{{ `${userInfo.userPoint.toLocaleString()}` }} </span>
        </router-link>
    </div>    
>>>>>>> 86dff6e368a6c5be19ff1b99cca97675986e1d5f
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
.hearder-text {
  color: #FAFAFA;
  font-size: 20px;
  font-weight: bold;
  align-self: center;
}

.back-btn{
  width: 12px;
  height: 24px;
  cursor: pointer;
}
.alram {
  align-self: center;
  width: 25px;
  height: 25px;
  right: 20%;
  cursor: pointer;
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
  padding: 20px 20px 0px 20px;
  display: flex;
  align-items: center;
  
  justify-content: space-between; 

  .point{
  display: flex;  
  justify-content: center; 
  align-self:flex-end; 
   gap: 5px;
   cursor: pointer;
 
  }  
  .pointShop{
    padding-top: 2px;
    font-size: 14px;
    font-weight: 500;
    color: #303030; 
    text-decoration: none;
    display: flex;
    align-items: end; 
    span {
      margin-left: 7px;
    }
   }
   
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
