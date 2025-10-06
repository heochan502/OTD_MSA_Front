<script setup>
import { getPointHistory } from '@/services/admin/adminService';
import { onMounted, ref } from 'vue';

const pointHistory = ref([]);
const search = ref('');

const headers = [
  { title: 'ID', key: 'chId' },
  { title: '사용자', key: 'user' },
  { title: '챌린지', key: 'challenge' },
  { title: '포인트', key: 'point' },
  { title: '사유', key: 'reason' },
  { title: '획득일', key: 'createdAt' },
];
onMounted(async () => {
  const res = await getPointHistory();
  pointHistory.value = res.data;
  console.log('point', pointHistory.value);
});

const formatNumber = (n) => String(n).padStart(2, '0');
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = formatNumber(date.getMonth() + 1);
  const d = formatNumber(date.getDate());
  return `${y}-${m}-${d}`;
};
</script>

<template>
  <div class="admin-points">
    <v-card>
      <!-- 상단 제목 + 검색창 -->
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">포인트 관리</span>
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

      <!-- 포인트 내역 테이블 -->
      <v-data-table
        :headers="headers"
        :items="pointHistory"
        :search="search"
        :items-per-page="10"
        height="580"
        fixed-header
        class="styled-table"
      >
        <!-- 사용자 -->
        <template #item.user="{ item }">
          {{ item.user?.nickName }}
          <span class="sub-name">({{ item.user?.name }})</span>
          <!-- <v-chip
            :color="
              item.user?.challengeRole === '브론즈'
                ? '#ce7430'
                : item.user?.challengeRole === '실버'
                ? '#9e9e9e'
                : item.user?.challengeRole === '골드'
                ? '#ffba57'
                : item.user?.challengeRole === '다이아'
                ? '#00c6ff'
                : 'grey'
            "
            text-color="white"
            small
          >
            {{ item.user?.challengeRole || '없음' }}
          </v-chip> -->
        </template>

        <!-- 챌린지 -->
        <template #item.challenge="{ item }">
          {{ item.challengeDefinition?.cdName }}
          <!-- <v-chip
            :color="
              item.challengeDefinition?.cdType === 'daily'
                ? 'blue'
                : item.challengeDefinition?.cdType === 'weekly'
                ? 'green'
                : item.challengeDefinition?.cdType === 'competition'
                ? 'red'
                : 'purple'
            "
            text-color="white"
            small
          >
            {{ item.challengeDefinition?.cdType }}
          </v-chip> -->
        </template>

        <!-- 포인트 -->
        <template #item.point="{ item }">
          <strong style="color: #00d5df">{{ item.point }}P</strong>
        </template>

        <!-- 사유 -->
        <template #item.reason="{ item }">
          {{ item.reason }}
        </template>

        <!-- 획득일 -->
        <template #item.createdAt="{ item }">
          {{ formatDate(new Date(item.createdAt)) }}
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.admin-points {
  padding: 20px;

  .title {
    font-weight: 700;
    font-size: 18px;
  }
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
