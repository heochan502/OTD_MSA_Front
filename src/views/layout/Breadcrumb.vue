<script setup>
import {useRoute, useRouter} from 'vue-router'
import { computed, ref, watch } from 'vue';
import weather from '@/components/weather/weather.vue';
import { useHeaderStore } from '@/stores/challenge/headerStore';

const route = useRoute();
const router = useRouter();
const headerStore = useHeaderStore();
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

const headerTitle = computed(() => {
  if (route.name === 'ChallengePer' || route.name === 'ChallengeDay') {
    return headerStore.detailName + ' 챌린지';
  }
  const metaTitle = route.meta.title

  // 1. meta.title이 함수라면 실행 결과 리턴
  if (typeof metaTitle === 'function') {
    return metaTitle(route)
  }
  // 2. 문자열이면 그대로 사용
  if (typeof metaTitle === 'string') {
    return metaTitle
  }
  // 3. meta.title이 없고, 커뮤니티 카테고리 라우트라면 categoryLabelMap 활용
  if (route.name === 'CommunityCategory') {
    return categoryLabelMap[route.params.category] ?? '커뮤니티'
  }
  return ''
})

const handleClick= ()=>{
  console.log("알람 클릭");
}

</script>

<template>
  <div class="top-header">
    <div>
      <img class="image" src="/image/main/fixed-header.png">
    </div>
    <!-- 로고 출력 해야할 때 -->
    <div class="title" v-if="headerType === 'logo'">
      <img class="otd-logo" src="/image/main/ontoday_logo.png" alt="로고" />
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
    <div class="user-profile ">
      <img class="avatar" src="/image/main/test.png" alt="프로필"></img>
      <div class="info">
        <weather/>
        <span class="  otd-title ">행키 님</span>
      </div>  
    </div>
      <div class="point otd-body-1">
        <router-link to="/pointshop" class="pointShop" :class="{active : route.path.startsWith('/pointshop')}">
        <img class="point-img" src="/image/main/point.png" alt="포인트"/>
        <span >{{ `${userInfo.userPoint.toLocaleString()}` }} </span>
        </router-link>
    </div>    
  </div> 

</template>

<style scoped>
.image{
  position: absolute;
  width: 390px;
  right: 1px;
  top: 1px;
}
.title {
  /* background: #00D5DF; */
  margin-top: 38px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.point-img{
  width: 20px;
  height: 20px;
}

.otd-logo {
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

.top-header {
  position: relative;
  background: #00D5DF;
  color: #000;
  padding: 20px;
  border-radius: 60px 60px 0 0; 
  height: 104px;
}
.user-profile
{
  display: flex;
  flex-direction: row;
}

.user {
  padding: 20px 20px 0px 20px;
  display: flex;
  align-items: center;
  
  justify-content: space-between; 
}
.point{
  display: flex;  
  justify-content: center; 
  align-self:flex-end; 
  gap: 5px;
  cursor: pointer;
 
  }  
  .pointShop{
    padding-top: 2px;   
    color: #303030; 
    text-decoration: none;
    display: flex;
    align-items: end; 
    span {
      margin-left: 7px;
    }
   }
   



.avatar {
  /* font-size: 32px; */
  width: 60px;
  height: 60px;
}
</style>