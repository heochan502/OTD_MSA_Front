<script setup>
import { ref } from "vue";
const claendarAttrs = ref([
  {
    key: "today",
    dates: new Date(),
  },
]);
</script>

<template>
  <div class="content_wrap">
    <!-- weekly 영역 -->
    <div class="d-flex justify-center">
      <vc-calendar view="weekly" :attributes="claendarAttrs">
        <template #header-title-wrapper></template>
      </vc-calendar>
    </div>
  </div>


  
</template>

<style lang="scss" scoped></style>
