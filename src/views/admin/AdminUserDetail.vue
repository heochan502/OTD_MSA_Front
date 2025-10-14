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
  { title: 'ID', key: 'chId' },
  { title: '사유', key: 'reason' },
  { title: '지급 포인트', key: 'point' },
  { title: '지급일', key: 'createdAt' },
];

const challengeHeaders = [
  { title: 'ID', key: 'cpId' },
  { title: '챌린지', key: 'name' },
  { title: '포인트', key: 'point' },
  { title: '시작일', key: 'startDate' },
  { title: '종료일', key: 'endDate' },
  { title: '성공여부', key: 'success' },
];

const exerciseHeaders = [
  { title: '운동 종목', key: 'exerciseName' },
  { title: '시작 시간', key: 'startAt' },
  { title: '종료 시간', key: 'endAt' },
  { title: '소비 칼로리', key: 'activityKcal' },
];

const mealHeaders = [
  { title: '기록일', key: 'mealDay' },
  { title: '기록시간', key: 'mealTime' },
  { title: '총 탄수화물 섭취량', key: 'totalCarbohydrate' },
  { title: '총 단백질 섭취량', key: 'totalProtein' },
  { title: '총 지방 섭취량', key: 'totalFat' },
  { title: '총 나트륨 섭취량', key: 'totalNatrium' },
  { title: '총 당 섭취량', key: 'totalSugar' },
  { title: '총 칼로리', key: 'totalKcal' },
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
    alert('저장에 실패했습니다. 다시 시도해주세요.');
  }
};

const deleteUserProfile = async () => {
  const res = await deleteUser(state.userInfo.userId);
  if (res && res.status === 200) {
    // 성공하면 저장 완료 모달 열기
    deleteUserDialog.value = false;
    successDialog.value = true;
    router.push('/admin/user');
  } else {
    alert('차단에 실패했습니다. 다시 시도해주세요.');
  }
};

const deletePic = () => {
  deletePicDialog.value = false;
  picUrl.value = authenticationStore.formattedUserPic('');
  state.userInfo.pic = null;
};

const rowProps = ({ item }) => ({
  onClick: () => openMealDialog(item),
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
  <div class="user-detail">
    <!-- 이미지 삭제 모달 -->
    <v-dialog v-model="deletePicDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-text> 프로필 이미지를 삭제하시겠습니까? </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="deletePic()">네</v-btn>
          <v-btn color="dark" text @click="deletePicDialog = false"
            >아니오</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 사용자 차단 모달 -->
    <v-dialog v-model="deleteUserDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-text> 해당 사용자를 차단하시겠습니까? </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="deleteUserProfile()">네</v-btn>
          <v-btn color="dark" text @click="deleteUserDialog = false"
            >아니오</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 프로필 저장 모달 -->
    <v-dialog v-model="putProfileDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-text> 내용을 저장하시겠습니까? </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="submit()">네</v-btn>
          <v-btn color="dark" text @click="putProfileDialog = false"
            >아니오</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 수정 / 저장 완료 모달 -->
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

    <!-- 운동기록 상세 모달 -->
    <v-dialog v-model="mealDetailDialog" max-width="300" min-height="100">
      <v-card>
        <v-card-title class="text-h8">상세 기록</v-card-title>

        <v-card-subtitle>기록 날짜</v-card-subtitle>
        <v-card-text>{{ selectedMeal[0]?.mealDay }}</v-card-text>

        <v-card-subtitle>기록 시간</v-card-subtitle>
        <v-card-text>{{ selectedMeal[0]?.mealTime }}</v-card-text>

        <template v-for="(meal, index) in selectedMeal" :key="index">
          <v-card-subtitle>음식명</v-card-subtitle>
          <v-card-text>{{ meal.foodName }}</v-card-text>

          <v-card-subtitle>탄수화물</v-card-subtitle>
          <v-card-text>{{ meal.carbohydrate }}g</v-card-text>

          <v-card-subtitle>단백질</v-card-subtitle>
          <v-card-text>{{ meal.protein }}g</v-card-text>

          <v-card-subtitle>지방</v-card-subtitle>
          <v-card-text>{{ meal.fat }}g</v-card-text>

          <v-card-subtitle>나트륨</v-card-subtitle>
          <v-card-text>{{ meal.natrium }}mg</v-card-text>

          <v-card-subtitle>당</v-card-subtitle>
          <v-card-text>{{ meal.sugar }}g</v-card-text>

          <v-card-subtitle>총 섭취량</v-card-subtitle>
          <v-card-text>{{ `${meal.foodAmount}${meal.flag}` }}</v-card-text>

          <v-card-subtitle>칼로리</v-card-subtitle>
          <v-card-text>{{ meal.kcal }}kcal</v-card-text>
        </template>

        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="mealDetailDialog = false"
            >확인</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card>
      <span class="title">회원 정보</span>
      <v-btn @click="deleteUserDialog = true">회원 차단</v-btn>
      <v-divider></v-divider>
      <v-img :src="picUrl" alt="profile-img" class="profile-img"></v-img>
      <v-btn v-if="state.userInfo.pic" @click="deletePicDialog = true"
        >이미지 삭제</v-btn
      >
      <v-card-title>{{ state.userInfo.name }}</v-card-title>

      <v-card-subtitle>이름</v-card-subtitle>
      <v-text-field v-model="state.userInfo.name"></v-text-field>

      <v-card-subtitle>닉네임</v-card-subtitle>
      <v-text-field v-model="state.userInfo.nickName"></v-text-field>

      <v-card-subtitle>회원 아이디</v-card-subtitle>
      <v-text-field v-model="state.userInfo.uid"></v-text-field>

      <v-card-subtitle>티어</v-card-subtitle>
      <v-select
        :items="['브론즈', '실버', '골드', '다이아']"
        v-model="state.userInfo.challengeRole"
      ></v-select>

      <v-card-subtitle>권한</v-card-subtitle>
      <v-select
        v-if="state.userInfo.userRoles != null"
        :items="['USER_1', 'USER_2', 'MANAGER', 'ADMIN']"
        v-model="state.userInfo.userRoles"
      ></v-select>

      <v-card-subtitle>생년월일</v-card-subtitle>
      <v-card-text>
        <!-- {{ formatBirthDate(state.userInfo.birthDate) }} -->
        {{ state.userInfo.birthDate }}
      </v-card-text>

      <v-card-subtitle>가입일자</v-card-subtitle>
      <v-card-text>{{
        String(state.userInfo.createdAt).slice(0, 10)
      }}</v-card-text>

      <v-card-subtitle>이메일</v-card-subtitle>
      <v-card-text>{{ state.userInfo.email }}</v-card-text>

      <v-card-subtitle>성별</v-card-subtitle>
      <v-card-text>{{
        state.userInfo.gender === 'F' ? '여' : '남'
      }}</v-card-text>

      <v-card-subtitle>전화번호</v-card-subtitle>
      <v-card-text>{{ state.userInfo.phone }}</v-card-text>

      <v-card-subtitle>보유 포인트</v-card-subtitle>
      <v-card-text>{{
        Number(state.userInfo.point).toLocaleString()
      }}</v-card-text>
      <!-- <v-btn @click="postPointDialog = true">포인트 지급</v-btn> -->

      <v-card-subtitle>보유 경험치</v-card-subtitle>
      <v-card-text>{{
        Number(state.userInfo.xp).toLocaleString()
      }}</v-card-text>

      <v-btn @click="putProfileDialog = true">저장</v-btn>
    </v-card>
    <br />
    <!-- 포인트 -->
    <v-card>
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
        :items-per-page="10"
        :search="searchPoint"
        fixed-header
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
    <br />
    <!-- 챌린지 -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">챌린지 도전 내역</span>
        <v-text-field
          v-model="searchChallenge"
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
        :headers="challengeHeaders"
        :items="challengeTableSet"
        :items-per-page="10"
        :search="searchChallenge"
        fixed-header
        class="styled-table"
      >
        <!-- 포인트 -->
        <template #item.point="{ item }"> {{ item.point }}P </template>
      </v-data-table>
    </v-card>
    <br />
    <!-- 운동기록 -->
    <v-card>
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
        :items-per-page="10"
        :search="searchExercise"
        fixed-header
        class="styled-table"
      >
      </v-data-table>
    </v-card>
    <br />
    <!-- 식단기록 -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">식단 기록</span>
        <v-text-field
          v-model="searchMeal"
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
        :headers="mealHeaders"
        :items="mealTableSet"
        :items-per-page="10"
        :search="searchMeal"
        fixed-header
        class="styled-table"
        :row-props="rowProps"
      >
        <!-- userId: Number(item.userId ?? 0),
      mealDay: mealDay.normalize('NFC'),
      mealTime: mealTime.normalize('NFC'),
      totalCarbohydrate: Number(item.totalCarbohydrate ?? 0),
      totalFat: Number(item.totalFat ?? 0),
      totalKcal: Number(item.totalKcal ?? 0),
      totalNatrium: Number(item.totalNatrium ?? 0),
      totalProtein: Number(item.totalProtein ?? 0),
      totalSugar: Number(item.totalSugar ?? 0), -->
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
  </div>
</template>

<style lang="scss" scoped>
.profile-img {
  width: 100px;
}
.title {
  font-weight: 700;
  font-size: 18px;
}
</style>
