<script setup>
import { getChallenges } from '@/services/admin/adminService';
import { onMounted, ref } from 'vue';

const challenges = ref([]);

const headers = [
  { title: 'ID', key: 'cdId' },
  { title: '이름', key: 'cdName' },
  { title: '타입', key: 'cdType' },
  { title: '목표', key: 'cdGoal' },
  { title: '단위', key: 'cdUnit' },
  { title: '보상(P)', key: 'cdReward' },
  { title: '경험치(XP)', key: 'xp' },
  { title: '티어', key: 'tier' },
  { title: '이미지 경로', key: 'cdImage' },
];

const formatType = (type) => {
  const map = {
    daily: '일일미션',
    weekly: '주간챌린지',
    competition: '월간경쟁챌린지',
    personal: '월간개인챌린지',
  };
  return map[type] || type;
};

onMounted(async () => {
  const res = await getChallenges();
  challenges.value = res.data;
  console.log('challenge', challenges.value);
});
</script>

<template>
  <div class="challenge-admin">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">챌린지 관리</span>
        <v-text-field
          v-model="search"
          label="검색"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          single-line
          variant="outlined"
          style="max-width: 250px"
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="challenges"
        style="max-height: calc(100vh - 200px)"
        fixed-header
        :items-per-page="10"
        :search="search"
        class="styled-table"
      >
        <!-- 타입 변환 -->
        <template #item.cdType="{ item }">
          <v-chip
            :color="
              item.cdType === 'daily'
                ? 'blue'
                : item.cdType === 'weekly'
                ? 'green'
                : item.cdType === 'competition'
                ? 'red'
                : 'purple'
            "
            text-color="white"
            small
          >
            {{ formatType(item.cdType) }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.challenge-admin {
  padding: 20px;

  .title {
    font-weight: 700;
    font-size: 18px;
  }
  border-radius: 12px;
  overflow: hidden;
}
.styled-table {
  :deep(td),
  :deep(th) {
    // text-align: center !important;
    vertical-align: middle;
  }

  thead {
    background-color: #393e46;
    color: #fff;
    font-weight: 600;
  }

  tbody tr:hover {
    background-color: #f1f5f9 !important; // 행 hover 시 은은한 강조
  }

  .v-data-table-footer {
    background: #fafafa;
  }
}
</style>
