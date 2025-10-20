<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { getQna, putQna } from '@/services/admin/adminService';
import { useAdminStore } from '@/stores/admin/adminStore';
import { reactify } from '@vueuse/core';
import { useRouter } from 'vue-router';

const adminStore = useAdminStore();
const router = useRouter();

const qna = ref([]);

const search = ref('');

const headers = [
  { title: 'ID', key: 'id', align: 'center' },
  { title: '제목', key: 'subject', align: 'center' },
  { title: '작성자', key: 'senderName', align: 'center' },
  { title: '이메일', key: 'senderEmail', align: 'center' },
  { title: '작성일', key: 'createdAt', align: 'center' },
  { title: '상태', key: 'status', align: 'center' },
];

const rowProps = ({ item }) => ({
  onClick: () => toQnaDetail(item),
  style: 'cursor: pointer;',
});

const toQnaDetail = (item) => {
  const qnaId = item.id;
  adminStore.setSelectedQnaId(qnaId);
  console.log(adminStore.state.selectedQnaId);
  router.push({ path: '/admin/qna/detail' });
};

onMounted(async () => {
  const res = await getQna();
  console.log('qna', res.data);
  qna.value = res.data;
});

const reversedQna = computed(() => {
  return [...qna.value].reverse();
});

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  const h24 = d.getHours();
  const dayPeriod = h24 < 12 ? '오전' : '오후';
  const h12 = String(h24 % 12 || 12).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');

  return `${y}-${m}-${day} ${dayPeriod} ${h12}:${min}:${sec}`;
};
</script>

<template>
  <div class="admin-qna">
    <v-card class="data-card pa-2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">문의 목록</span>
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
        :items="reversedQna"
        class="styled-table"
        :row-props="rowProps"
        :search="search"
        :items-per-page="12"
        height="700"
      >
        <!-- 작성일 -->
        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #item.status="{ item }">
          <v-chip :color="item.status === '대기 중' ? 'red' : 'green'" dark>
            {{ item.status }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.admin-qna {
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
