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
  { title: 'ID', key: 'id' },
  { title: '제목', key: 'subject' },
  { title: '작성자', key: 'senderName' },
  { title: '이메일', key: 'senderEmail' },
  { title: '작성일', key: 'createdAt' },
  { title: '상태', key: 'status' },
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
// 관리 모달 카드
.admin-dialog {
  border-radius: 15px !important;
  background-color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.dialog-title {
  font-weight: 700;
  font-size: 1.3rem;
  color: #333;
  text-align: center;
}

.field-label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.field-text {
  font-size: 1rem;
  color: #333;
}

.preserve-lines {
  white-space: pre-line; /* ← 줄바꿈(\n) 유지 + 연속 공백 최소화 */
  line-height: 1.6;
}

// 모달
// 버튼 영역
.modal-btn-area {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 4px 4px 0 !important;
  margin-top: 4px !important;
}

// 버튼 공통
.btn-no,
.btn-yes {
  min-width: 72px;
  height: 38px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1;
  text-transform: none;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

// 취소 버튼
.btn-no {
  background-color: #eee !important;
  color: #555 !important;
  border-radius: 10px;
}
.btn-no:hover {
  background-color: #dcdcdc !important;
  transform: scale(1.03);
}

// 저장 버튼
.btn-yes {
  background-color: #5ee6eb !important;
  color: #fff !important;
  border-radius: 10px;
}
.btn-yes:hover {
  background-color: #3dd4da !important;
  box-shadow: 0 3px 10px rgba(61, 212, 218, 0.35);
  transform: scale(1.03);
}
</style>
