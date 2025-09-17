<script setup></script>

<template>
  <div class="wrap">
    <div>운동기록추가 페이지</div>
    <div>
      <div>운동 시작</div>
      <div>
        <v-text-field
          v-model="datetime"
          label=""
          type="datetime-local"
          variant="solo"
        />
      </div>
    </div>
    <div>운동 종료</div>
    <div>운동</div>
    <div>거리</div>
    <div>운동강도</div>
    <div>
      <div>
        <div>활동 에너지는</div>
        <div>{{ "200kcal" }}</div>
      </div>
      <div>
        <div>운동시간</div>
        <div>{{ "60분" }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
