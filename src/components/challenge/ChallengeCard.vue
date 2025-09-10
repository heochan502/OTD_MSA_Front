<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  challengeId: 0,
  image: '',
  name: '',
  reward: 0,
});
</script>

<template>
  <div>
    <img :src="`http://localhost:8080/challenge/${props.image}`"  />
    <!-- :alt="`${props.name}`" -->
    <div>
      <img src="/public/image/main/point.png" alt="point" class="point" />{{
        `${props.reward}P`
      }}
    </div>
  </div>
</template>

<style scoped>
.point {
  width: 15px;
}
</style>
