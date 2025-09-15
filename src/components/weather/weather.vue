<script setup>
import { onMounted } from 'vue';

const getGPS = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
    });
  }
};

onMounted(() => {
  getGPS();
});
</script>

<template>
  <span>오늘의 기온은 {{}}℃에 습도는 {{}}% 입니다.</span>
</template>

<style lang="scss" scoped></style>
