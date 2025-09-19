<script setup>
import ExerciseRecordList from "@/components/exercise/ExerciseRecordList.vue";
</script>

<template>
  <div class="wrap parent">
    <div class="otd-subtitle-1">{{ "2025년 9월" }}</div>
    <div class="d-flex justify-center otd-body-1 mb-8">
      <table>
        <colgroup>
          <col style="width: 120px" />
          <col style="width: 120px" />
          <col style="width: 120px" />
        </colgroup>
        <tr>
          <td></td>
          <td>전체</td>
          <td>평균</td>
        </tr>
        <tr>
          <td>운동</td>
          <td>2</td>
          <td></td>
        </tr>
        <tr>
          <td>시간</td>
          <td>{{ "전체시간" }}</td>
          <td>{{ "평균시간" }}</td>
        </tr>
        <tr>
          <td>킬로칼로리</td>
          <td>{{ "전체칼로리" }}</td>
          <td>{{ "평균칼로리" }}</td>
        </tr>
      </table>
    </div>
    <div>
      <ExerciseRecordList />
    </div>
    <div class="d-flex flex-row-reverse btn">
      <router-link to="/exercise/record_form">
        <img
          class="btn_add"
          src="\public\image\main\btn_add.png"
          alt="운동기록 추가하기 버튼"
        />
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.btn {
  z-index: 999999;

  .btn_add {
    width: 50px;
    height: 50px;
  }
}

:hover {
  border: none;
}
</style>
