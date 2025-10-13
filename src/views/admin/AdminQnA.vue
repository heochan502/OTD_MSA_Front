<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { getQna, putQna } from '@/services/admin/adminService';
import { reactify } from '@vueuse/core';

const qna = ref([]);
const selectedQna = ref({
  senderName: '',
  senderEmail: '',
  createdAt: '',
  subject: '',
  content: '',
  reply: '',
  replyAt: '',
});

const search = ref('');
const qnaDialog = ref(false);
const cancelDialog = ref(false);
const successDialog = ref(false);

const headers = [
  { title: 'ID', key: 'id' },
  { title: '제목', key: 'subject' },
  { title: '작성자', key: 'senderName' },
  { title: '이메일', key: 'senderEmail' },
  { title: '작성일', key: 'createdAt' },
  { title: '상태', key: 'status' },
];

const formatNumber = (n) => String(n).padStart(2, '0');
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = formatNumber(date.getMonth() + 1);
  const d = formatNumber(date.getDate());
  return `${y}-${m}-${d}`;
};

const rowProps = ({ item }) => ({
  onClick: () => onpenQnaDialog(item),
  style: 'cursor: pointer;',
});

const onpenQnaDialog = (qna) => {
  console.log('qna', qna);
  selectedQna.value.reply = '';
  selectedQna.value.replyAt = '';
  selectedQna.value.repliedNickName = '';
  Object.assign(selectedQna.value, qna);
  qnaDialog.value = true;
};

const cancel = () => {
  cancelDialog.value = false;
  qnaDialog.value = false;
};

onMounted(async () => {
  const res = await getQna();
  console.log('qna', res.data);
  qna.value = res.data;
});

const reversedQna = computed(() => {
  return [...qna.value].reverse();
});

const submit = async () => {
  const jsonBody = selectedQna.value;
  console.log('json', jsonBody);
  const res = await putQna(jsonBody);
  if (res && res.status === 200) {
    // 성공하면 저장 완료 모달 열기
    const refresh = await getQna();
    qna.value = refresh.data;
    qnaDialog.value = false;
    successDialog.value = true;
  } else {
    alert('저장에 실패했습니다. 다시 시도해주세요.');
  }
};
</script>

<template>
  <div class="admin-qna">
    <!-- 문의 모달 -->
    <v-dialog v-model="qnaDialog" max-width="300" min-height="100">
      <v-card>
        <v-card-title class="text-h8">문의 상세</v-card-title>

        <v-card-subtitle>작성자 닉네임</v-card-subtitle>
        <v-card-text>{{ selectedQna.senderName }}</v-card-text>

        <v-card-subtitle>작성자 이메일</v-card-subtitle>
        <v-card-text>{{ selectedQna.senderEmail }}</v-card-text>

        <v-card-subtitle>작성일</v-card-subtitle>
        <v-card-text>{{ selectedQna.createdAt }}</v-card-text>

        <v-card-subtitle>제목</v-card-subtitle>
        <v-card-text>{{ selectedQna.subject }}</v-card-text>

        <v-card-subtitle>내용</v-card-subtitle>
        <v-card-text>{{ selectedQna.content }}</v-card-text>

        <v-card-subtitle v-if="selectedQna.reply != ''"
          >문의 답변</v-card-subtitle
        >
        <v-card-subtitle v-else>답변하기</v-card-subtitle>
        <v-text-field v-model="selectedQna.reply"></v-text-field>

        <template v-if="selectedQna.replyAt != ''">
          <v-card-subtitle>답변 시각</v-card-subtitle>
          <v-card-text>{{ selectedQna.replyAt }}</v-card-text>
        </template>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="cancelDialog = true">취소</v-btn>
          <v-btn color="dark" text @click="submit()">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 취소 모달 -->
    <v-dialog v-model="cancelDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-text>
          취소하고 돌아가시겠습니까? 해당 내용은 저장되지 않습니다.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="cancel()">네</v-btn>
          <v-btn color="dark" text @click="cancelDialog = false">아니오</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 수정 완료 모달 -->
    <v-dialog v-model="successDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-title class="text-h8">완료</v-card-title>
        <v-card-text> 성공적으로 완료되었습니다. </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="successDialog = false">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card>
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
      >
        <!-- 작성일 -->
        <template #item.createdAt="{ item }">
          {{ formatDate(new Date(item.createdAt)) }}
        </template>

        <template #item.status="{ item }">
          <v-chip :color="item.status === '대기 중' ? 'red' : 'blue'" dark>
            {{ item.status }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.admin-qna {
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
