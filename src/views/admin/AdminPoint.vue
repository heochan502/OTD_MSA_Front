<!-- <script setup>
import { getPointHistory } from '@/services/admin/adminService';
import { onMounted, ref, computed } from 'vue';

const pointHistory = ref([]);
const search = ref('');

const headers = [
  { title: 'ID', key: 'chId' },
  { title: '닉네임(이름)', key: 'user' },
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

const filteredPointHistory = computed(() => {
  const term = (search.value || '').toLowerCase().normalize('NFC').trim();

  return [...pointHistory.value].reverse().filter((item) => {
    const nickname = String(item.user?.nickName ?? '')
      .toLowerCase()
      .normalize('NFC')
      .trim();
    const name = String(item.user?.name ?? '')
      .toLowerCase()
      .normalize('NFC')
      .trim();
    const challenge = String(item.challengeDefinition?.cdName ?? '')
      .toLowerCase()
      .normalize('NFC')
      .trim();
    const reason = String(item.reason ?? '')
      .toLowerCase()
      .normalize('NFC')
      .trim();
    const point = String(item.point ?? '').trim();

    return (
      nickname.includes(term) ||
      name.includes(term) ||
      challenge.includes(term) ||
      reason.includes(term) ||
      point.includes(term)
    );
  });
});
</script> -->

<!-- <template>
  <div class="admin-points">
    <v-card>
      상단 제목 + 검색창
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

      포인트 내역 테이블
      <v-data-table
        :headers="headers"
        :items="filteredPointHistory"
        :search="search"
        :items-per-page="10"
        height="580"
        fixed-header
        class="styled-table"
      >
        사용자
        <template #item.user="{ item }">
          {{ item.user?.nickName }}
          <span class="sub-name">({{ item.user?.name }})</span>
        </template>

        챌린지
        <template #item.challenge="{ item }">
          {{ item.challengeDefinition?.cdName }}
        </template>

        포인트
        <template #item.point="{ item }">
          <strong style="color: #00d5df">{{ item.point }}P</strong>
        </template>

        사유
        <template #item.reason="{ item }">
          {{ item.reason }}
        </template>

        획득일
        <template #item.createdAt="{ item }">
          {{ formatDate(new Date(item.createdAt)) }}
        </template>
      </v-data-table>
    </v-card>
  </div>
</template> -->
<!-- 
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
</style> -->
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

// ✅ 검색은 Vuetify 기본 search 사용 (이제 전부 원시값이라 잘 됨)
</script>

<template>
  <div class="admin-points">
    <v-card>
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
        :items-per-page="10"
        height="580"
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
