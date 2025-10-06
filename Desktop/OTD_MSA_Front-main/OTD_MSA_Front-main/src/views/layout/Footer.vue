<script setup>
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const isActive = computed(() => route.path === "/");
</script>

<template>
  <nav class="nav">
    <div class="nav_container">
      <router-link to="/" class="nav-menu" active-class="active">
        <img
          class="d-flex"
          :src="
            isActive
              ? '/otd/image/navigator_img/home-s.png'
              : '/otd/image/navigator_img/home.png'
          "
          alt="홈화면"
        />
        <span class="d-flex justify-center">홈</span>
      </router-link>
    </div>
    <div class="nav_container ">
      <router-link
        to="/exercise/main"
        class="nav-menu"
        :class="{ active: route.path.startsWith('/exercise') }"
      >
        <img
          :src="
            route.path.startsWith('/exercise')
              ? '/otd/image/navigator_img/exercise-s.png'
              : '/otd/image/navigator_img/exercise.png'
          "
          alt="운동"
        />
        운동</router-link
      >
    </div>
    <div class="nav_container ">
      <router-link
        to="/meal"
        class="nav-menu"
        :class="{ active: route.path.startsWith('/meal') }"
      >
        <img
          :src="
            route.path.startsWith('/meal')
              ? '/otd/image/navigator_img/food-s.png'
              : '/otd/image/navigator_img/food.png'
          "
          alt="식단"
        />
        식단</router-link
      >
    </div>
    <div class="nav_container">
      <router-link
        to="/challenge"
        class="nav-menu"
        :class="{ active: route.path.startsWith('/challenge') }"
      >
        <img
          :src="
            route.path.startsWith('/challenge')
              ? '/otd/image/navigator_img/chellenge-s.png'
              : '/otd/image/navigator_img/chellenge.png'
          "
          alt="챌린지"
        />
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
          :src="
            route.path.startsWith('/community')
              ? '/otd/image/navigator_img/community-s.png'
              : '/otd/image/navigator_img/community.png'
          "
          alt="커뮤니티"
        />
        커뮤니티
      </router-link>
    </div>

    <div class="nav_container">
      <router-link
        to="/user/profile"
        class="nav-menu"
        :class="{ active: route.path.startsWith('/user') }"
      >
        <img
          :src="
            route.path.startsWith('/user')
              ? '/otd/image/navigator_img/user-s.png'
              : '/otd/image/navigator_img/user.png'
          "
          alt="내정보"
        />
        내정보</router-link
      >
    </div>
  </nav>
</template>

<style scoped>
.nav {
  position: absolute;
  bottom: 0;
  width: 100vw;
  height: 80px;
  min-width: 320px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 10px 10px;
  border-top: 1px solid #ddd;
  background: #ffffff;

  color: #000;
}

.nav-menu {
  color: #989898;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
}

.nav_container {
  /* width: 61px; */

  height: 58px;
  min-width: 22px;
  background: none;
  border: none;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 0 0 5px;
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
.image {
  width: 390px;
  height: 5px;
}
</style>
