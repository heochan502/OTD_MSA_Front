<script setup>
import { getPointHistory } from '@/services/admin/adminService';
import { onMounted, ref, computed } from 'vue';

const pointHistory = ref([]);
const search = ref('');

const headers = [
  { title: 'ID', key: 'chId' },
  { title: '닉네임(이름)', key: 'userText' },
  { title: '챌린지', key: 'challengeText' },
  { title: '포인트', key: 'point' },
  { title: '사유', key: 'reason' },
  { title: '획득일', key: 'createdAt' },
];

onMounted(async () => {
  const res = await getPointHistory();
  pointHistory.value = res.data || [];
  console.log('raw:', pointHistory.value.slice(0, 3));
});

const formatNumber = (n) => String(n).padStart(2, '0');
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = formatNumber(date.getMonth() + 1);
  const d = formatNumber(date.getDate());
  return `${y}-${m}-${d}`;
};

// 평탄화 + 최신순 정렬 + 문자열 정제
const tableSet = computed(() => {
  const rows = pointHistory.value.map((item, i) => {
    const nick = String(item.user?.nickName ?? '').trim();
    const name = String(item.user?.name ?? '').trim();
    const challenge = String(item.challengeDefinition?.cdName ?? '').trim();
    const reason = String(item.reason ?? '').trim();

    return {
      chId: item.chId ?? item.cphId ?? i, // id 없으면 index 보정
      userText: `${nick}${name ? ` (${name})` : ''}`.normalize('NFC'),
      challengeText: challenge.normalize('NFC'),
      point: Number(item.point ?? 0),
      reason: reason.normalize('NFC'),
      createdAt: item.createdAt, // 원본 날짜 유지 (정렬/표시용)
    };
  });

  // 최신순 (createdAt DESC)
  rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return rows;
});
</script>

<template>
  <div class="admin-point">
    <v-card class="data-card pa-2">
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

      <v-data-table
        :headers="headers"
        :items="tableSet"
        :search="search"
        :items-per-page="12"
        height="700"
        fixed-header
        class="styled-table"
      >
        <!-- 닉네임(이름) -->
        <template #item.userText="{ item }">
          {{ item.userText }}
        </template>

        <!-- 챌린지 -->
        <template #item.challengeText="{ item }">
          {{ item.challengeText }}
        </template>

        <!-- 포인트 -->
        <template #item.point="{ item }">
          <strong style="color: #00d5df">{{ item.point }}P</strong>
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
.admin-point {
  padding: 10px;

  .data-card {
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
