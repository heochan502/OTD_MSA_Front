<script setup>
import { ref, onMounted } from 'vue';
import { trans } from '@/utils/geoTrans.js';

const temp = ref(null);
const humidity = ref(null);
navigator.permissions.query({ name: 'geolocation' }).then((result) => {
  console.log('위치 권한 상태:', result.state); // granted / denied / prompt
});

async function fetchWeather(nx, ny) {
  const serviceKey =
    'fte7et4WjQ2QQTSP51SJ6VZ%2FXA3aDUYv054aZFUsGdrVOKFJxQnmrKJGh%2Box%2FcnwsvpeJmLazXr4je1K01Uoow%3D%3D';
  let baseDate;
  let baseTime;

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  baseDate = `${year}${month}${day}`;

  let hour = now.getHours();
  let minute = now.getMinutes();

  // 초단기실황 시간 세팅

  if (minute < 30) {
    hour = hour - 1;
    if (hour < 0) {
      // 자정 예외 처리
      hour = 23;

      // 날짜 하루 전으로 변경
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yYear = yesterday.getFullYear();
      const yMonth = (yesterday.getMonth() + 1).toString().padStart(2, '0');
      const yDay = yesterday.getDate().toString().padStart(2, '0');
      baseDate = `${yYear}${yMonth}${yDay}`;
    }
  }
  baseTime = hour.toString().padStart(2, '0') + '30';

  console.log('baseDate:', baseDate, 'baseTime:', baseTime);

  const url =
    `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst` +
    `?serviceKey=${serviceKey}` +
    `&numOfRows=100&pageNo=1&dataType=JSON` +
    `&base_date=${baseDate}&base_time=${baseTime}` +
    `&nx=${nx}&ny=${ny}`;

  const res = await fetch(url);
  const data = await res.json();
  console.log('weather data : ', data.response.body.items);

  if (data.response?.body?.items?.item) {
    data.response.body.items.item.forEach((el) => {
      if (el.category === 'T1H') temp.value = el.obsrValue;
      if (el.category === 'REH') humidity.value = el.obsrValue;
    });
  }
}

onMounted(() => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const grid = trans('toXY', pos.coords.latitude, pos.coords.longitude);
        console.log('GPS 기반 nx, ny:', grid.nx, grid.ny);
        fetchWeather(grid.nx, grid.ny);
      },
      async () => {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const grid = trans('toXY', data.latitude, data.longitude);
        console.log('IP 기반 nx, ny:', grid.nx, grid.ny);
        fetchWeather(grid.nx, grid.ny);
      }
    );
  } else {
    fetchWeather(90, 91);
  }
});
</script>

<template>
  <p class="otd-body-3">오늘 날씨는 🌡️ {{ temp }}℃ 💧 {{ humidity }}%</p>
</template>

<style lang="scss" scoped></style>
