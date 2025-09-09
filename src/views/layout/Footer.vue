<script setup>
import { useRouter, useRoute } from 'vue-router';
import {computed} from 'vue';

const route = useRoute();
const isActive = computed(() => route.path === '/')
</script>

<template>
  <nav class="nav">
    <div class="nav_container">
      <router-link to="/" class="nav-menu" active-class="active">
        <img
          class="d-flex" 
          :src="isActive ? '/image/navigator_img/home-s.png' : '/image/navigator_img/home.png'"
          alt="홈화면"
        />
        <span class="d-flex justify-center">홈</span>
      </router-link>
    </div>
    <div class="nav_container">
      <router-link to="/test" class="nav-menu" :class="{active : route.path.startsWith('/test')}">
        <img  :src=" route.path.startsWith('/test') ? '/image/navigator_img/exercise-s.png' : '/image/navigator_img/exercise.png'" alt="운동" />
        운동</router-link
      >
    </div>
    <div class="nav_container">
      <router-link to="/test" class="nav-menu" :class="{active : route.path.startsWith('/test')}">
        <img  :src=" route.path.startsWith('/test') ? '/image/navigator_img/food-s.png' : '/image/navigator_img/food.png'" alt="식단" />
        식단</router-link
      >
    </div>
    <div class="nav_container">
      <router-link to="/test" class="nav-menu" :class="{active : route.path.startsWith('/test')}">
        <img  :src=" route.path.startsWith('/test') ? '/image/navigator_img/chellenge-s.png' : '/image/navigator_img/chellenge.png'" alt="챌린지" />
        챌린지</router-link
      >
    </div>
    <div class="nav_container">
  <router-link
    to="/community"
    class="nav-menu"
    :class="{ active: route.path.startsWith('/community') }"
  >
    <img
      :src="route.path.startsWith('/community')
        ? '/image/navigator_img/community-s.png'
        : '/image/navigator_img/community.png'"
      alt="커뮤니티"
    />
    커뮤니티
  </router-link>
</div>

    <div class="nav_container">
      <router-link to="/test" class="nav-menu" :class="{active : route.path.startsWith('/test')}">
        <img  :src=" route.path.startsWith('/test') ? '/image/navigator_img/user-s.png' : '/image/navigator_img/user.png'" alt="내정보" />
        내정보</router-link
      >
    </div>
  </nav>
</template>

<style scoped>
.nav {
  position: relative;
  height: 92px;
  display: flex;
  flex-direction: column;

  padding: 10px 10px;
  border-top: 1px solid #ddd;
  background: #ffffff;
  border-radius: 0 0 20px 20px;

  
  color: #000;

  
}

.nav-menu{
  color: #989898;
  text-decoration: none;
  display: flex;  
  flex-direction: column;
  align-items: center;
  font-size: 12px;


}

.nav_container {
  width: 61px;
  height: 58px;
  background: none;
  border: none;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
 

}
.nav .active {
  font-weight: bold;
  color: #00d5df;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-menu img {
  max-width: 22px;
  margin-bottom: 15px;
}
</style>
