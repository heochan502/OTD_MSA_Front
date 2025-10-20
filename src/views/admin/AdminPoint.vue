<script setup>
import {
  getPointHistory,
  getPurchaseList,
} from '@/services/admin/adminService';
import { onMounted, ref, computed } from 'vue';

const pointHistory = ref([]);
const purchaseList = ref([]);
const search = ref('');
const headers = [
  { title: 'ID', key: 'chId', align: 'center' },
  { title: '닉네임(이름)', key: 'userText', align: 'center' },
  { title: '챌린지', key: 'challengeText', align: 'center' },
  { title: '포인트', key: 'point', align: 'center' },
  { title: '사유', key: 'reason', align: 'center' },
  { title: '획득일', key: 'createdAt', align: 'center' },
];
const purchaseHeaders = [
  { title: '구매 ID', key: 'purchaseId', align: 'center' },
  { title: '유저 ID', key: 'userId', align: 'center' },
  { title: '닉네임(이름)', key: 'userText', align: 'center' },
  { title: '이메일', key: 'email', align: 'center' },
  { title: '상품명', key: 'itemContent', align: 'center' },
  { title: '사용 포인트', key: 'pointScore', align: 'center' },
  { title: '구매일', key: 'purchaseAt', align: 'center' },
];

onMounted(async () => {
  const res = await getPointHistory();
  pointHistory.value = res.data || [];
  const res2 = await getPurchaseList();
  console.log('res2', res2);
  purchaseList.value = res2.data || [];

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
const purchaseTable = computed(() => {
  if (!Array.isArray(purchaseList.value)) return [];

  return purchaseList.value
    .map((item, i) => ({
      purchaseId: item.purchaseId ?? i,
      userId: item.userId,
      userText: `${item.nickName ?? ''}${item.name ? ` (${item.name})` : ''}`,
      email: item.email ?? '',
      itemContent: item.itemContent ?? '',
      pointScore: item.pointScore ?? 0,
      purchaseAt: item.purchaseAt,
    }))
    .sort((a, b) => new Date(b.purchaseAt) - new Date(a.purchaseAt));
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
    <br />
    <v-card class="data-card pa-2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">포인트 구매 내역</span>
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
        :headers="purchaseHeaders"
        :items="purchaseTable"
        :search="search"
        :items-per-page="12"
        height="400"
        fixed-header
        class="styled-table"
      >
        <template #item.userText="{ item }">
          {{ item.userText }}
        </template>
        <template #item.pointScore="{ item }">
          <strong style="color: #f28b82"
            >-{{ item.pointScore.toLocaleString() }}P</strong
          >
        </template>

        <template #item.purchaseAt="{ item }">
          {{ formatDate(new Date(item.purchaseAt)) }}
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
/* 정렬 아이콘 항상 보이게 */
.styled-table :deep(.v-data-table__th .v-icon) {
  opacity: 1 !important; /* 항상 표시 */
  color: #bbb !important; /* 기본은 연한 회색으로 */
  transition: color 0.2s ease;
}

/* 활성 정렬 컬럼 아이콘 강조 */
.styled-table :deep(.v-data-table__th--sorted .v-icon) {
  color: #5ee6eb !important; /* 활성 정렬 컬럼만 민트 */
}
</style>
