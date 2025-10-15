<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import {
  getUserDetail,
  putUserProfile,
  deleteUser,
  getUserExerciseRecord,
  getUserMealRecord,
  getUserMealDetail,
} from '@/services/admin/adminService';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { useAdminStore } from '@/stores/admin/adminStore';
import router from '@/router';
import {
  putLifeUserProfile,
  updateLifeNickname,
  updateLifeUserInfo,
} from '@/services/community/postService';

const authenticationStore = useAuthenticationStore();
const adminStore = useAdminStore();

const searchPoint = ref('');
const searchChallenge = ref('');
const searchExercise = ref('');
const searchMeal = ref('');

const picUrl = ref();
const deletePicDialog = ref(false);
const putProfileDialog = ref(false);
const successDialog = ref(false);
const deleteUserDialog = ref(false);
const mealDetailDialog = ref(false);
const errorDialog = ref(false);
const banUser = ref(false);
const selectedMeal = ref([]);

const state = reactive({
  userInfo: {},
  challengeHistory: [],
  pointHistory: [],
  exerciseHistory: [],
  mealHistory: [],
});

const formatBirthDate = (birthDate) => {
  if (!birthDate) return '';
  const str = birthDate.toString();
  if (str.length === 8) {
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }
  return str;
};

onMounted(async () => {
  state.userInfo = adminStore.state.selectedUser;
  const userId = Number(state.userInfo.userId);
  const resUser = await getUserDetail(userId);
  const resExercise = await getUserExerciseRecord(userId);
  const resMeal = await getUserMealRecord(userId);
  state.challengeHistory = resUser.data.challengeProgress;
  state.pointHistory = resUser.data.challengePointHistory;
  state.exerciseHistory = resExercise.data;
  state.mealHistory = resMeal.data;

  picUrl.value = authenticationStore.formattedUserPic(state.userInfo);
});

const pointHeaders = [
  { title: 'ID', key: 'chId', align: 'center' },
  { title: '사유', key: 'reason', align: 'center' },
  { title: '지급 포인트', key: 'point', align: 'center' },
  { title: '지급일', key: 'createdAt', align: 'center' },
];

const challengeHeaders = [
  { title: 'ID', key: 'cpId', align: 'center' },
  { title: '챌린지', key: 'name', align: 'center' },
  { title: '포인트', key: 'point', align: 'center' },
  { title: '시작일', key: 'startDate', align: 'center' },
  { title: '종료일', key: 'endDate', align: 'center' },
  { title: '성공여부', key: 'success', align: 'center' },
];

const exerciseHeaders = [
  { title: '운동 종목', key: 'exerciseName', align: 'center' },
  { title: '시작 시간', key: 'startAt', align: 'center' },
  { title: '종료 시간', key: 'endAt', align: 'center' },
  { title: '소비 칼로리', key: 'activityKcal', align: 'center' },
];

const mealHeaders = [
  { title: '기록일', key: 'mealDay', align: 'center' },
  { title: '기록시간', key: 'mealTime', align: 'center' },
  { title: '총 탄수화물 섭취량', key: 'totalCarbohydrate', align: 'center' },
  { title: '총 단백질 섭취량', key: 'totalProtein', align: 'center' },
  { title: '총 지방 섭취량', key: 'totalFat', align: 'center' },
  { title: '총 나트륨 섭취량', key: 'totalNatrium', align: 'center' },
  { title: '총 당 섭취량', key: 'totalSugar', align: 'center' },
  { title: '총 칼로리', key: 'totalKcal', align: 'center' },
];

const formatNumber = (n) => String(n).padStart(2, '0');
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = formatNumber(date.getMonth() + 1);
  const d = formatNumber(date.getDate());
  return `${y}-${m}-${d}`;
};

// 챌린지기록 테이블 평탄화
const challengeTableSet = computed(() => {
  const rows = state.challengeHistory.map((item, i) => {
    const name = String(item.challengeDefinition?.cdName ?? '').trim();
    const point = Number(item.challengeDefinition?.cdReward ?? 0);
    const startDate = String(item.startDate ?? '').trim();
    const endDate = String(item.endDate ?? '').trim();
    const success = item.success === true ? '성공' : '실패';

    return {
      cpId: item.cpId ?? i, // id 없을 경우 index로 보정
      name: name.normalize('NFC'),
      point,
      startDate,
      endDate,
      success,
    };
  });

  // 최신순 (endDate DESC)
  rows.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
  return rows;
});

// 식단기록 테이블 평탄화
const mealTableSet = computed(() => {
  const rows = state.mealHistory.map((item, i) => {
    const mealDay = String(item.mealRecordIds?.mealDay ?? '').trim();
    const mealTime = String(item.mealRecordIds?.mealTime ?? '').trim();

    return {
      userId: Number(item.userId ?? 0),
      mealDay: mealDay.normalize('NFC'),
      mealTime: mealTime.normalize('NFC'),
      totalCarbohydrate: Number(item.totalCarbohydrate ?? 0),
      totalFat: Number(item.totalFat ?? 0),
      totalKcal: Number(item.totalKcal ?? 0),
      totalNatrium: Number(item.totalNatrium ?? 0),
      totalProtein: Number(item.totalProtein ?? 0),
      totalSugar: Number(item.totalSugar ?? 0),
    };
  });

  // 최신순 (createdAt DESC)
  rows.sort((a, b) => new Date(b.mealDay) - new Date(a.mealDay));
  return rows;
});
const submit = async () => {
  const jsonBody = state.userInfo;

  const res = await putUserProfile(jsonBody);

  if (res && res.status === 200) {
    const jsonBody = {
      userId: state.userInfo.userId,
      nickname: state.userInfo.nickName,
      imgPath: state.userInfo.pic,
    };
    const life = await updateLifeUserInfo(jsonBody);
    console.log('life:', life.data);
    // 성공하면 저장 완료 모달 열기
    putProfileDialog.value = false;
    successDialog.value = true;
  } else {
    putProfileDialog.value = false;
    errorDialog.value = true;
  }
};

const deleteUserProfile = async () => {
  const res = await deleteUser(state.userInfo.userId);
  if (res && res.status === 200) {
    // 성공하면 저장 완료 모달 열기
    deleteUserDialog.value = false;
    successDialog.value = true;
    banUser.value = true;
  } else {
    deleteUserDialog.value = false;
    errorDialog.value = true;
  }
};

const toUser = () => {
  if (banUser.value) {
    router.push('/admin/user');
  }
  successDialog.value = false;
};
const deletePic = () => {
  deletePicDialog.value = false;
  successDialog.value = true;
  picUrl.value = authenticationStore.formattedUserPic('');
  state.userInfo.pic = null;
};

const rowProps = ({ item } = {}) => ({
  onClick: () => item && openMealDialog(item),
  style: 'cursor: pointer;',
});

const openMealDialog = async (meal) => {
  const params = {
    mealDay: meal.mealDay,
    mealTime: meal.mealTime,
    userId: meal.userId,
  };
  const res = await getUserMealDetail(params);
  selectedMeal.value = res?.data || [];
  mealDetailDialog.value = true;
};
</script>

<template>
  <div class="admin-user-detail">
    <!-- 이미지 삭제 모달 -->
    <v-dialog v-model="deletePicDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 프로필 이미지를 삭제하시겠습니까? </v-card-text>
        <div class="modal-btn-area">
          <v-btn class="btn-yes" text @click="deletePic()">네</v-btn>
          <v-btn class="btn-no" text @click="deletePicDialog = false"
            >아니오</v-btn
          >
        </div>
      </v-card>
    </v-dialog>

    <!-- 사용자 차단 모달 -->
    <v-dialog v-model="deleteUserDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 해당 사용자를 차단하시겠습니까? </v-card-text>
        <div class="modal-btn-area">
          <v-btn class="btn-yes" text @click="deleteUserProfile()">네</v-btn>
          <v-btn class="btn-no" text @click="deleteUserDialog = false"
            >아니오</v-btn
          >
        </div>
      </v-card>
    </v-dialog>

    <!-- 프로필 저장 모달 -->
    <v-dialog v-model="putProfileDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 내용을 저장하시겠습니까? </v-card-text>
        <div class="modal-btn-area">
          <v-btn class="btn-yes" @click="submit()">네</v-btn>
          <v-btn class="btn-no" @click="putProfileDialog = false">아니오</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- 수정 / 저장 완료 모달 -->
    <v-dialog v-model="successDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 성공적으로 완료되었습니다. </v-card-text>
        <div class="modal-btn-area">
          <v-btn class="btn-yes" text @click="toUser()">확인</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- 저장 실패 모달 -->
    <v-dialog v-model="errorDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 실패했습니다. </v-card-text>
        <div class="modal-btn-area">
          <v-btn class="btn-yes" @click="errorDialog = false">확인</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- 운동기록 상세 모달 -->
    <v-dialog v-model="mealDetailDialog" max-width="700">
      <v-card class="admin-dialog pa-6">
        <v-card-title class="dialog-title mb-4">식단 상세 기록</v-card-title>

        <v-container fluid>
          <v-row dense>
            <!-- 기록 날짜 -->
            <v-col cols="6">
              <v-card-subtitle class="field-label">기록 날짜</v-card-subtitle>
              <v-card-text class="field-text">
                {{ selectedMeal[0]?.mealDay }}
              </v-card-text>
            </v-col>

            <!-- 기록 시간 -->
            <v-col cols="6">
              <v-card-subtitle class="field-label">기록 시간</v-card-subtitle>
              <v-card-text class="field-text">
                {{ selectedMeal[0]?.mealTime }}
              </v-card-text>
            </v-col>

            <!-- 반복 영역 -->
            <template v-for="(meal, index) in selectedMeal" :key="index">
              <v-col cols="6">
                <v-card-subtitle class="field-label">음식명</v-card-subtitle>
                <v-card-text class="field-text">{{
                  meal.foodName
                }}</v-card-text>
              </v-col>

              <v-col cols="6">
                <v-card-subtitle class="field-label">탄수화물</v-card-subtitle>
                <v-card-text class="field-text"
                  >{{ meal.carbohydrate }}g</v-card-text
                >
              </v-col>

              <v-col cols="6">
                <v-card-subtitle class="field-label">단백질</v-card-subtitle>
                <v-card-text class="field-text"
                  >{{ meal.protein }}g</v-card-text
                >
              </v-col>

              <v-col cols="6">
                <v-card-subtitle class="field-label">지방</v-card-subtitle>
                <v-card-text class="field-text">{{ meal.fat }}g</v-card-text>
              </v-col>

              <v-col cols="6">
                <v-card-subtitle class="field-label">나트륨</v-card-subtitle>
                <v-card-text class="field-text"
                  >{{ meal.natrium }}mg</v-card-text
                >
              </v-col>

              <v-col cols="6">
                <v-card-subtitle class="field-label">당</v-card-subtitle>
                <v-card-text class="field-text">{{ meal.sugar }}g</v-card-text>
              </v-col>

              <v-col cols="6">
                <v-card-subtitle class="field-label">총 섭취량</v-card-subtitle>
                <v-card-text class="field-text">{{
                  `${meal.foodAmount}${meal.flag}`
                }}</v-card-text>
              </v-col>

              <v-col cols="6">
                <v-card-subtitle class="field-label">칼로리</v-card-subtitle>
                <v-card-text class="field-text"
                  >{{ meal.kcal }}kcal</v-card-text
                >
              </v-col>
            </template>
          </v-row>
        </v-container>

        <v-divider class="my-2" />
        <div>
          <v-btn class="btn-save" @click="mealDetailDialog = false">확인</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-container fluid>
      <!-- 회원 정보 카드 -->
      <v-row dense>
        <v-col cols="12">
          <v-card class="profile-card pa-2">
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="title">회원 정보</span>
            </v-card-title>
            <div class="profile-wrap">
              <!-- 프로필 이미지 영역 -->
              <div class="profile-left">
                <v-img
                  :src="picUrl"
                  alt="프로필 이미지"
                  class="profile-img mb-3"
                />
                <v-btn
                  v-if="state.userInfo.pic"
                  class="btn-no"
                  @click="deletePicDialog = true"
                >
                  이미지 삭제
                </v-btn>
                <v-card-title class="name-title">{{
                  state.userInfo.name
                }}</v-card-title>
              </div>

              <!-- 회원 정보 영역 -->
              <div class="profile-right">
                <v-row dense>
                  <v-col cols="6">
                    <v-card-subtitle>닉네임</v-card-subtitle>
                    <v-text-field
                      v-model="state.userInfo.nickName"
                      class="field-input"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-card-subtitle>회원 아이디</v-card-subtitle>
                    <v-text-field
                      v-model="state.userInfo.uid"
                      class="field-input"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-card-subtitle>티어</v-card-subtitle>
                    <v-select
                      :items="['브론즈', '실버', '골드', '다이아']"
                      v-model="state.userInfo.challengeRole"
                      class="field-input"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-card-subtitle>권한</v-card-subtitle>
                    <v-select
                      v-if="state.userInfo.userRoles"
                      :items="['USER_1', 'USER_2', 'MANAGER', 'ADMIN']"
                      v-model="state.userInfo.userRoles"
                      class="field-input"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-card-subtitle>이메일</v-card-subtitle>
                    <v-card-text>{{ state.userInfo.email }}</v-card-text>
                  </v-col>

                  <v-col cols="6">
                    <v-card-subtitle>전화번호</v-card-subtitle>
                    <v-card-text>{{ state.userInfo.phone }}</v-card-text>
                  </v-col>

                  <v-col cols="6">
                    <v-card-subtitle>생년월일</v-card-subtitle>
                    <v-card-text>{{ state.userInfo.birthDate }}</v-card-text>
                  </v-col>

                  <v-col cols="6">
                    <v-card-subtitle>가입일</v-card-subtitle>
                    <v-card-text>{{
                      String(state.userInfo.createdAt).slice(0, 10)
                    }}</v-card-text>
                  </v-col>

                  <v-col cols="6">
                    <v-card-subtitle>보유 포인트</v-card-subtitle>
                    <v-card-text
                      >{{
                        Number(state.userInfo.point).toLocaleString()
                      }}P</v-card-text
                    >
                  </v-col>

                  <v-col cols="6">
                    <v-card-subtitle>마지막 접속일</v-card-subtitle>
                    <v-card-text>{{
                      new Date(state.userInfo.lastLogin).toLocaleString(
                        'ko-KR',
                        {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        }
                      )
                    }}</v-card-text>
                  </v-col>
                </v-row>
                <div class="btn-area">
                  <v-btn class="btn-ban mt-2" @click="deleteUserDialog = true">
                    회원 차단
                  </v-btn>
                  <v-btn class="btn-save mt-2" @click="putProfileDialog = true">
                    변경사항 저장
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- 챌린지 도전 내역 -->
      <v-row dense>
        <v-col cols="12">
          <v-card class="data-card pa-2">
            <v-card-title class="d-flex justify-space-between align-center"
              ><span class="title">챌린지 도전 내역</span>
              <v-text-field
                v-model="searchChallenge"
                label="검색"
                prepend-inner-icon="mdi-magnify"
                density="compact"
                hide-details
                single-line
                variant="outlined"
                style="max-width: 250px"
            /></v-card-title>
            <v-data-table
              :headers="challengeHeaders"
              :items="challengeTableSet"
              :search="searchChallenge"
              :items-per-page="8"
              class="styled-table"
            >
              <!-- 포인트 -->
              <template #item.point="{ item }"> {{ item.point }}P </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- 포인트 지급 내역 -->
      <v-row dense>
        <v-col cols="12">
          <v-card class="data-card pa-2">
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="title">포인트 지급 내역</span>
              <v-text-field
                v-model="searchPoint"
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
              :headers="pointHeaders"
              :items="state.pointHistory"
              :items-per-page="6"
              class="styled-table"
            >
              <!-- 포인트 -->
              <template #item.point="{ item }"> {{ item.point }}P </template>
              <!-- 지급일 -->
              <template #item.createdAt="{ item }">
                {{ formatDate(new Date(item.createdAt)) }}
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- 운동 기록 -->
      <v-row dense>
        <v-col cols="12">
          <v-card class="data-card pa-2">
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="title">운동 기록</span>
              <v-text-field
                v-model="searchExercise"
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
              :headers="exerciseHeaders"
              :items="state.exerciseHistory"
              :search="searchExercise"
              :items-per-page="6"
              class="styled-table"
            >
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- 식단 기록 -->
      <v-row dense>
        <v-col cols="12">
          <v-card class="data-card pa-2">
            <v-card-title class="d-flex justify-space-between align-center"
              ><span class="title">식단 기록</span>
              <v-text-field
                v-model="searchMeal"
                label="검색"
                prepend-inner-icon="mdi-magnify"
                density="compact"
                hide-details
                single-line
                variant="outlined"
                style="max-width: 250px"
            /></v-card-title>
            <v-data-table
              :headers="mealHeaders"
              :items="mealTableSet"
              :items-per-page="8"
              :search="searchMeal"
              :row-props="rowProps"
              class="styled-table"
            >
              <template #item.totalCarbohydrate="{ item }"
                >{{ item.totalCarbohydrate.toLocaleString() }}g</template
              >
              <template #item.totalProtein="{ item }"
                >{{ item.totalProtein.toLocaleString() }}g</template
              >
              <template #item.totalFat="{ item }"
                >{{ item.totalFat.toLocaleString() }}g</template
              >
              <template #item.totalNatrium="{ item }"
                >{{ item.totalNatrium.toLocaleString() }}mg</template
              >
              <template #item.totalSugar="{ item }"
                >{{ item.totalSugar.toLocaleString() }}g</template
              >
              <template #item.totalKcal="{ item }"
                >{{ item.totalKcal.toLocaleString() }}kcal</template
              >
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
.admin-user-detail {
  padding: 10px;
}

// 프로필 카드
.profile-card {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.profile-wrap {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.profile-left {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.profile-right {
  flex: 1;
  position: relative;
}

.profile-img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.name-title {
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.field-input {
  max-width: 80%;
  margin-top: 10px;
}

.field-input :deep(.v-field) {
  border: 1px solid #d7d7d7 !important;
  border-radius: 14px !important;
  background-color: #f9f9f9 !important;
  height: 46px !important;
  font-size: 0.9rem !important;
  padding-inline: 14px !important;
  display: flex !important;
  align-items: center !important;
  box-shadow: none !important;
  transition: all 0.25s ease;
}

// 선 제거
.field-input :deep(.v-field__outline),
.field-input :deep(.v-field__overlay) {
  display: none !important;
}

// hover시 강조
.field-input:hover :deep(.v-field),
.field-input:focus-within :deep(.v-field) {
  background-color: #f0f0f0 !important;
  border-color: #b0b0b0 !important;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}

// 하단 텍스트
.v-card-text {
  font-size: 1rem !important;
  margin-top: 2px;
}

// 소제목
.v-card-subtitle {
  font-size: 0.9rem !important;
  color: #666;
  margin-bottom: 2px;
}

// 일반 카드 공통
.data-card {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.title {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 10px;
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
  bottom: 0;
  right: 0;
  height: 40px;
  background-color: #5ee6eb !important;
  color: #fff !important;
  border-radius: 10px;
  font-weight: 600;
}
.btn-save:hover {
  background-color: #3dd4da !important;
}
.btn-ban {
  bottom: 0;
  left: 0;
  height: 40px;
  background-color: #f28b82 !important;
  color: #fff !important;
  border-radius: 10px;
  font-weight: 600;
}
.btn-ban:hover {
  background-color: #ef5350 !important;
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

// 저장 버튼
.btn-yes {
  background-color: #5ee6eb !important;
  color: #fff !important;
  border-radius: 10px;
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
