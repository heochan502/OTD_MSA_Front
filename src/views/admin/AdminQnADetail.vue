<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { getQnaDetail, putQna } from '@/services/admin/adminService';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const adminStore = useAdminStore();
const qnaDetail = ref({
  senderName: '',
  senderEmail: '',
  createdAt: '',
  subject: '',
  content: '',
  reply: '',
  replyAt: '',
});

const qnaDialog = ref(false);
const cancelDialog = ref(false);
const successDialog = ref(false);
const saveDialog = ref(false);
const isReply = ref(false);

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

onMounted(async () => {
  const qndId = adminStore.state.selectedQnaId;
  const res = await getQnaDetail(qndId);
  console.log('detail', res.data);
  Object.assign(qnaDetail.value, res.data);
  console.log('qna', qnaDetail.value);
  await nextTick();
  if (qnaDetail.value.reply != '') {
    isReply.value = true;
  }
  console.log('isReply', isReply.value);
});

const cancel = () => {
  cancelDialog.value = false;
  router.push({ path: '/admin/qna' });
};

const submit = async () => {
  const { adminId, ...jsonBody } = qnaDetail.value;
  console.log('json', jsonBody);
  const res = await putQna(jsonBody);
  if (res && res.status === 200) {
    // 성공하면 저장 완료 모달 열기
    const qndId = adminStore.state.selectedQnaId;
    const refresh = await getQnaDetail(qndId);
    qnaDetail.value = refresh.data;
    saveDialog.value = false;
    successDialog.value = true;
  } else {
    alert('저장에 실패했습니다. 다시 시도해주세요.');
  }
};

const toQna = () => {
  successDialog.value = false;
  router.push({ path: '/admin/qna' });
};
</script>

<template>
  <div class="admin-qna-detail">
    <!-- 취소 모달 -->
    <v-dialog v-model="cancelDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text>
          취소하고 돌아가시겠습니까? 해당 내용은 저장되지 않습니다.
        </v-card-text>
        <div class="modal-btn-area">
          <v-spacer />
          <v-btn class="btn-yes" @click="cancel()">네</v-btn>
          <v-btn class="btn-no" @click="cancelDialog = false">아니오</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- 수정 완료 모달 -->
    <v-dialog v-model="successDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 성공적으로 완료되었습니다. </v-card-text>
        <div class="modal-btn-area">
          <v-spacer />
          <v-btn class="btn-yes" @click="toQna()">확인</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- 답변 저장 모달 -->
    <v-dialog v-model="saveDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 답변을 저장하시겠습니까? </v-card-text>
        <div class="modal-btn-area">
          <v-btn class="btn-yes" @click="submit()">네</v-btn>
          <v-btn class="btn-no" @click="saveDialog = false">아니오</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-container fluid>
      <v-row dense>
        <v-col cols="12">
          <v-card class="data-card pa-2">
            <div class="qna-detail">
              <v-card-title class="d-flex justify-space-between align-center"
                ><span class="title">문의 상세</span></v-card-title
              >

              <v-row dense>
                <v-col cols="6">
                  <v-card-subtitle class="field-label"
                    >작성자 닉네임</v-card-subtitle
                  >
                  <v-card-text class="field-text">{{
                    qnaDetail.senderName
                  }}</v-card-text>
                </v-col>

                <v-col cols="6">
                  <v-card-subtitle class="field-label"
                    >작성자 이메일</v-card-subtitle
                  >
                  <v-card-text class="field-text">{{
                    qnaDetail.senderEmail
                  }}</v-card-text>
                </v-col>

                <v-col cols="6">
                  <v-card-subtitle class="field-label">제목</v-card-subtitle>
                  <v-card-text class="field-text">{{
                    qnaDetail.subject
                  }}</v-card-text>
                </v-col>

                <v-col cols="6">
                  <v-card-subtitle class="field-label">작성일</v-card-subtitle>
                  <v-card-text class="field-text">{{
                    formatDate(qnaDetail.createdAt)
                  }}</v-card-text>
                </v-col>

                <v-col cols="12">
                  <v-card-subtitle class="field-label">내용</v-card-subtitle>
                  <v-card-text class="field-text preserve-lines">{{
                    qnaDetail.content
                  }}</v-card-text>
                </v-col>
              </v-row>
            </div>
            <v-divider class="my-4" />
            <div class="qna-reply">
              <v-card-title class="d-flex justify-space-between align-center"
                ><span class="title">문의 답변 관리</span></v-card-title
              >
              <v-row class="reply-row" justify="center">
                <v-col cols="12" class="reply-col">
                  <v-card-subtitle
                    v-if="isReply"
                    class="field-label reply-title"
                    >문의 답변</v-card-subtitle
                  >
                  <v-card-subtitle v-else class="field-label reply-title"
                    >답변하기</v-card-subtitle
                  >
                  <v-textarea
                    v-model="qnaDetail.reply"
                    class="reply-textarea"
                    placeholder="답변 내용을 입력하세요."
                    hide-details
                    auto-grow
                    no-resize
                    variant="outlined"
                    rows="2"
                  ></v-textarea>
                </v-col>

                <v-col cols="6" v-if="qnaDetail.replyAt != ''">
                  <v-card-subtitle class="field-label"
                    >답변 시각</v-card-subtitle
                  >
                  <v-card-text class="field-field">{{
                    formatDate(qnaDetail.replyAt)
                  }}</v-card-text>
                </v-col>

                <v-col cols="6" v-if="qnaDetail.adminId?.name">
                  <v-card-subtitle class="field-label"
                    >답변 담당자</v-card-subtitle
                  >
                  <v-card-text class="field-field">{{
                    qnaDetail.adminId.name
                  }}</v-card-text>
                </v-col>
              </v-row>
            </div>
            <div class="btn-area">
              <v-btn class="btn-cancel mt-2" @click="cancelDialog = true">
                되돌아가기
              </v-btn>
              <v-btn class="btn-save mt-2" @click="saveDialog = true">
                저장
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
.admin-qna-detail {
  padding: 10px;
}

.title {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 10px;
}

// 일반 카드 공통
.data-card {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.field-label {
  margin-bottom: 0 !important; // 라벨과 값 사이 간격 줄이기
  font-weight: 600; // 라벨이 너무 약해보이면 강조
}

.preserve-lines {
  white-space: pre-line;
  line-height: 1.6;
}

.qna-detail {
  margin-bottom: 20px;
}

.qna-reply {
  display: block !important;
  width: 100%;
  text-align: left;
}

.reply-title {
  padding: 0 0 18px 2px;
}
/* 제목은 왼쪽 정렬 */
.qna-reply .v-card-title {
  display: flex !important;
  justify-content: flex-start !important;
  align-items: flex-start !important;
  text-align: left !important;
  width: 100%;
  padding-left: 12px;
}

/* ✅ 입력창 전체 감싸는 영역 중앙 정렬 */
.reply-row {
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important;
  width: 100%;
  margin: 0 auto !important; /* 카드 기준으로 중앙에 배치 */
}

/* ✅ 실제 입력창 박스 크기 */
.reply-col {
  width: 100%;
  max-width: 1300px; /* 카드 중앙 기준으로 폭 제한 */
  flex: 0 0 auto;
  margin: 0 auto; /* 중앙에 고정 */
  padding-top: 0;
}

/* ✅ textarea 스타일 그대로 유지 */
.reply-textarea :deep(.v-field) {
  border: 1px solid #d7d7d7 !important;
  border-radius: 14px !important;
  background-color: #f9f9f9 !important;
  box-shadow: none !important;
  transition: all 0.25s ease;
  min-height: auto !important;
  height: auto !important;
}

.reply-textarea :deep(textarea) {
  padding: 10px 14px !important;
  font-size: 0.95rem !important;
  line-height: 1.6 !important;
  color: #333 !important;
  overflow-y: hidden !important;
  resize: none !important;
}

.reply-textarea :deep(.v-field__outline),
.reply-textarea :deep(.v-field__overlay) {
  display: none !important;
}

.reply-textarea:hover :deep(.v-field),
.reply-textarea:focus-within :deep(.v-field) {
  background-color: #f0f0f0 !important;
  border-color: #b0b0b0 !important;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}

// 관리 모달 카드
.admin-dialog {
  border-radius: 15px !important;
  background-color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
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

// 저장 버튼
.btn-yes {
  background-color: #5ee6eb !important;
  color: #fff !important;
  border-radius: 10px;
}


// 화면 버튼
.btn-area {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 10px;
}

.btn-save {
  height: 40px;
  background-color: #5ee6eb !important;
  color: #fff !important;
  border-radius: 10px;
  font-weight: 600;
}


.btn-cancel {
  height: 40px;
  background-color: #f28b82 !important;
  color: #fff !important;
  border-radius: 10px;
  font-weight: 600;
}

</style>
