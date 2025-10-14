<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getChallengeProgress } from '@/services/admin/adminService';

const route = useRoute();
const progressList = ref([]);
const search = ref('');

onMounted(async () => {
  const id = route.query.id;
  try {
    const res = await getChallengeProgress(id);
    // totalRecord DESC로 정렬된 데이터라면 그대로 사용
    progressList.value = res.data;
    console.log('챌린지 현황', progressList.value);
  } catch (e) {
    console.error('챌린지 현황 조회 실패', e);
  }
});

// 헤더
const headers = [
  { title: '순위', key: 'rank' },
  { title: '닉네임 (이름)', key: 'nickName' },
  { title: '달성량', key: 'totalRecord' },
  { title: '목표', key: 'cdGoal' },
  { title: '달성 여부', key: 'isSuccess' },
];

// 검색 적용
const filteredProgress = computed(() => {
  if (!search.value) return progressList.value;

  return progressList.value.filter((item) =>
    [item.nickName, item.name]
      .join(' ')
      .toLowerCase()
      .includes(search.value.toLowerCase())
  );
});
</script>

<template>
  <div class="admin-challenge-progress">
    <v-card class="data-card pa-2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">{{ progressList[0]?.cdName }} 챌린지 현황</span>
        <!-- 검색 -->
        <v-text-field
          v-model="search"
          label="검색 (닉네임/이름)"
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
        :items="filteredProgress"
        :items-per-page="10"
        fixed-header
        class="styled-table"
      >
        <!-- 순위 -->
        <template #item.rank="{ index }">
          <strong>{{ index + 1 }}</strong>
        </template>

        <!-- 닉네임 (이름) -->
        <template #item.nickName="{ item }">
          {{ item.nickName }}
          <span class="sub-name">({{ item.name }})</span>
        </template>

        <!-- 달성량 -->
        <template #item.totalRecord="{ item }">
          {{ item.totalRecord.toLocaleString() }} {{ item.cdUnit }}
        </template>

        <!-- 목표 -->
        <template #item.cdGoal="{ item }">
          {{ item.cdGoal.toLocaleString() }} {{ item.cdUnit }}
        </template>

        <!-- 달성 여부 -->
        <template #item.isSuccess="{ item }">
          <v-chip
            :color="item.success ? 'green' : 'grey'"
            text-color="white"
            small
          >
            {{ item.success ? '성공' : '진행중' }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.admin-challenge-progress {
  padding: 10px;

  .data-card {
    border-radius: 15px;
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  }
  .title {
    font-weight: 700;
    font-size: 23px;
  }
}
.styled-table {
  :deep(td),
  :deep(th) {
    vertical-align: middle;
  }

  thead {
    background-color: #393e46;
    color: #fff;
    font-weight: 600;
  }

  tbody tr:hover {
    background-color: #f1f5f9 !important;
  }

  .v-data-table-footer {
    background: #fafafa;
  }

  .sub-name {
    color: #888;
    font-size: 0.85rem;
  }
}
</style>
