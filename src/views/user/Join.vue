<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { join, checkUidDuplicate } from '@/services/user/userService';

const router = useRouter();
const basePath = import.meta.env.VITE_BASE_URL;

// 현재 단계 (1: 이메일인증, 2: 약관동의, 3: 계정정보, 4: 추가정보, 5: 설문조사, 6: 완료)
const currentStep = ref(1);
const isLoading = ref(false);

// 1단계: 이메일 인증 관련
const email = ref('');
const verificationCode = ref('');
const isEmailSent = ref(false);
const isEmailVerified = ref(false);
const emailTimer = ref(0);

// 2단계: 약관 동의
const agreements = ref({
  all: false,
  service: false,
  privacy: false,
  marketing: false,
});

// 3단계: 계정 정보
const accountInfo = ref({
  uid: '',
  upw: '',
  confirmPassword: '',
});

// 계정 정보 검증 상태
const validation = ref({
  uid: {
    isValid: true,
    message: '',
    touched: false,
    checked: false,
    available: false,
  },
  upw: {
    isValid: true,
    message: '',
    touched: false,
  },
  confirmPassword: {
    isValid: true,
    message: '',
    touched: false,
  },
  nickname: {
    isValid: true,
    message: '',
    touched: false,
  }
})

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const generalError = ref('');

// 4단계: 추가 정보
const additionalInfo = ref({
  pic: null,
  name: '',
  birthDate: '',
  phone: '',
  gender: '',
  nickname: '',
});

// 5단계: 설문조사
const surveyAnswers = ref({
  exercise: null,
  duration: null,
  activity: null,
  fitness: null,
});

// 모달
const showModal = ref('');

// 설문 문항 데이터
const surveyQuestions = [
  {
    id: 'exercise',
    question: '땀흘릴 정도의 운동을 얼마나 하시나요?',
    options: [
      { value: 'notatall', label: '전혀안함' },
      { value: '1~2weeks', label: '주 1~2회' },
      { value: '3~4weeks', label: '주 3~4회' },
      { value: 'almost', label: '거의 매일' },
    ],
  },
  {
    id: 'duration',
    question: '운동 한번에 어느 정도의 시간을 사용하시나요?',
    options: [
      { value: '30minutesless', label: '30분 이하' },
      { value: '1hour', label: '30~1시간' },
      { value: '1hour30', label: '1시간~1시간 반' },
      { value: '2hour', label: '2시간 이상' },
    ],
  },
  {
    id: 'activity',
    question: '활동량이 어떻게 되시나요?',
    options: [
      { value: 'sittingdown', label: '대부분 앉아있음' },
      { value: 'sometimes', label: '가끔 움직임' },
      { value: 'often', label: '자주 움직임' },
      { value: 'allday', label: '하루종일 활동적' },
    ],
  },
  {
    id: 'fitness',
    question: '스스로 생각하는 체력의 난이도는 어떠신가요?',
    options: [
      { value: 'totalnooby', label: '왕초보' },
      { value: 'nooby', label: '초보' },
      { value: 'heavy', label: '중수' },
      { value: 'master', label: '고수' },
    ],
  },
];

// 이메일 타이머 관리
let timerInterval = null;
watch(emailTimer, (newValue) => {
  if (newValue > 0 && !timerInterval) {
    timerInterval = setInterval(() => {
      emailTimer.value--;
      if (emailTimer.value <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }, 1000);
  }
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

// 아이디 유효성 검사 함수
const validateMemberId = (uid) => {
  if (!uid.trim()) {
    return { isValid: false, message: '아이디를 입력해주세요.' };
  }
  if (uid.trim().length < 4) {
    return { isValid: false, message: '아이디는 4자 이상이어야 합니다.' };
  }
  if (uid.trim().length > 20) {
    return {
      isValid: false,
      message: '아이디는 최대 20자까지 입력 가능합니다.',
    };
  }
  const idRegex = /^[a-zA-Z0-9_]+$/;
  if (!idRegex.test(uid.trim())) {
    return {
      isValid: false,
      message: '아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.',
    };
  }
  return { isValid: true, message: '' };
};
const validateMemberNick = (nickname) => {
  if (!nickname) {
    return { isValid: false, message: '닉네임을 입력해주세요.' };
  }
  if (nickname.length < 2) {
    return { isValid: false, message: '닉네임은 2자 이상이어야 합니다.' };
  }
  if (nickname.length > 10) {
    return {
      isValid: false,
      message: '닉네임은 최대 10자까지 입력 가능합니다.',
    };
  }
  return { isValid: true, message: '' };
};

// 비밀번호 유효성 검사 함수
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: '비밀번호를 입력해주세요.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: '비밀번호는 8자 이상이어야 합니다.' };
  }
  if (password.length > 20) {
    return {
      isValid: false,
      message: '비밀번호는 최대 20자까지 입력 가능합니다.',
    };
  }
  return { isValid: true, message: '' };
};

// 비밀번호 확인 유효성 검사 함수
const validatePasswordConfirm = (password, passwordConfirm) => {
  if (!passwordConfirm) {
    return { isValid: false, message: '비밀번호 확인을 입력해주세요.' };
  }
  if (password !== passwordConfirm) {
    return { isValid: false, message: '비밀번호가 일치하지 않습니다.' };
  }
  return { isValid: true, message: '비밀번호가 일치합니다.' };
};

// 필드 유효성 검사
const validateField = (field, value) => {
  let result;

  switch (field) {
    case 'uid':
      result = validateMemberId(value);
      break;
    case 'upw':
      result = validatePassword(value);
      break;
    case 'confirmPassword':
      result = validatePasswordConfirm(accountInfo.value.upw, value);
      break;
    default:
      result = { isValid: true, message: '' };
  }

  validation.value[field] = {
    ...validation.value[field],
    isValid: result.isValid,
    message: result.message,
  };
};

// 필드 터치 처리
const handleFieldTouch = (field) => {
  validation.value[field].touched = true;
  validateField(field, accountInfo.value[field]);
};

// 비밀번호 일치 상태
const passwordMatchStatus = computed(() => {
  if (!accountInfo.value.upw || !accountInfo.value.confirmPassword) {
    return { show: false, isMatch: false, message: '' };
  }

  const isMatch = accountInfo.value.upw === accountInfo.value.confirmPassword;
  return {
    show: true,
    isMatch,
    message: isMatch
      ? '비밀번호가 일치합니다.'
      : '비밀번호가 일치하지 않습니다.',
  };
});

// 아이디 중복 검사
const checkIdDuplicate = async () => {
  const trimmedId = accountInfo.value.uid.trim();

  if (!trimmedId) {
    return;
  }

  const validationResult = validateMemberId(trimmedId);
  if (!validationResult.isValid) {
    validation.value.uid.touched = true;
    validation.value.uid.isValid = false;
    validation.value.uid.message = validationResult.message;
    return;
  }

  try {
    isLoading.value = true;
    const response = await checkUidDuplicate(trimmedId);

    validation.value.uid.checked = true;
    validation.value.uid.available = response.data.result.isAvailable;

    if (response.data.result.isAvailable) {
      validation.value.uid.message = '사용 가능한 아이디입니다.';
      validation.value.uid.isValid = true;
    } else {
      validation.value.uid.message = '이미 사용중인 아이디입니다.';
      validation.value.uid.isValid = false;
    }
  } catch (error) {
    console.error('아이디 중복 검사 오류:', error);
    generalError.value = '중복 확인 중 오류가 발생했습니다.';
    setTimeout(() => (generalError.value = ''), 3000);
  } finally {
    isLoading.value = false;
  }
};

// 아이디 변경 시 중복검사 상태 초기화
const resetIdValidation = () => {
  validation.value.uid.checked = false;
  validation.value.uid.available = false;
  if (
    validation.value.uid.touched &&
    validation.value.uid.message.includes('사용')
  ) {
    validation.value.uid.message = '';
  }
};

// 닉네임중복검사
const checkNicknameDuplicateAction = async () => {
  const nickname = additionalInfo.value.nickname; // accountInfo -> additionalInfo로 수정

  if (!nickname) {
    return;
  }

  const validationResult = validateMemberNick(nickname);
  if (!validationResult.isValid) {
    validation.value.nickname.touched = true;
    validation.value.nickname.isValid = false;
    validation.value.nickname.message = validationResult.message;
    return;
  }

  try {
    isLoading.value = true
    const response = await checkUidDuplicate(nickname)  // import된 서비스 함수 호출
    
    validation.value.nickname.checked = true
    validation.value.nickname.available = response.data.result.isAvailable
    
    if (response.data.result.isAvailable) {
      validation.value.nickname.message = '사용 가능한 닉네임입니다.';
      validation.value.nickname.isValid = true;
    } else {
      validation.value.nickname.message = '이미 사용중인 닉네임입니다.';
      validation.value.nickname.isValid = false;
    }
  } catch (error) {
    console.error('닉네임 중복 검사 오류:', error);
    generalError.value = '중복 확인 중 오류가 발생했습니다.';
    setTimeout(() => (generalError.value = ''), 3000);
  } finally {
    isLoading.value = false;
  }
};
// 닉네임 변경 시 중복검사 상태 초기화
const resetNicknameValidation = () => {
  validation.value.nickname.checked = false;
  validation.value.nickname.available = false;
  if (
    validation.value.nickname.touched &&
    validation.value.nickname.message.includes('사용')
  ) {
    // uid -> nickname
    validation.value.nickname.message = '';
  }
};

// 워처 설정
watch(
  () => accountInfo.value.uid,
  (newValue) => {
    if (validation.value.uid.touched) {
      validateField('uid', newValue);
    }
    resetIdValidation();
  }
);

watch(
  () => accountInfo.value.upw,
  (newValue) => {
    if (validation.value.upw.touched) {
      validateField('upw', newValue);
    }
  }
);

watch(
  () => accountInfo.value.confirmPassword,
  (newValue) => {
    if (newValue) {
      validation.value.confirmPassword.touched = true;
    }
    if (validation.value.confirmPassword.touched) {
      validateField('confirmPassword', newValue);
    }
  }
);

// 설문 완료 여부
const isSurveyCompleted = computed(() => {
  return Object.values(surveyAnswers.value).every((answer) => answer !== null);
});

// 설문 점수 계산
const calculateSurveyScore = computed(() => {
  let totalScore = 0;
  Object.values(surveyAnswers.value).forEach((answer) => {
    if (answer) {
      const questionOptions =
        surveyQuestions.find((q) =>
          q.options.some((opt) => opt.value === answer)
        )?.options || [];

      const optionIndex = questionOptions.findIndex(
        (opt) => opt.value === answer
      );
      if (optionIndex !== -1) {
        totalScore += optionIndex;
      }
    }
  });
  return totalScore;
});

// 등급 계산
const getFitnessRank = computed(() => {
  const score = calculateSurveyScore.value;
  if (score >= 0 && score <= 3) return { name: '브론즈', color: '#CD7F32' };
  if (score >= 4 && score <= 6) return { name: '실버', color: '#C0C0C0' };
  if (score >= 7 && score <= 9) return { name: '골드', color: '#FFD700' };
  if (score >= 10 && score <= 12) return { name: '다이아', color: '#B9F2FF' };
  return { name: '브론즈', color: '#CD7F32' };
});

// 다음 단계 진행 가능 여부
const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return isEmailVerified.value;
    case 2:
      return agreements.value.service && agreements.value.privacy;
    case 3:
      return (
        accountInfo.value.uid &&
        validation.value.uid.isValid &&
        validation.value.uid.checked &&
        validation.value.uid.available &&
        validation.value.upw.isValid &&
        validation.value.confirmPassword.isValid &&
        passwordMatchStatus.value.isMatch
      );
    case 4:
      return (
        additionalInfo.value.name &&
        additionalInfo.value.birthDate &&
        additionalInfo.value.phone &&
        additionalInfo.value.gender &&
        additionalInfo.value.nickname &&
        validation.value.nickname.isValid &&
        validation.value.nickname.checked &&
        validation.value.nickname.available
      );
    case 5:
      return isSurveyCompleted.value;
    default:
      return false;
  }
});

// 타이머 표시 형식
const timerDisplay = computed(() => {
  const minutes = Math.floor(emailTimer.value / 60);
  const seconds = emailTimer.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// 이메일 인증번호 전송
const sendVerificationEmail = async () => {
  if (!email.value) return;

  isLoading.value = true;
  try {
    const response = await fetch(
      `${basePath}/api/OTD/email/send-verification`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value }),
      }
    );

    if (response.ok) {
      isEmailSent.value = true;
      emailTimer.value = 300; // 5분
      alert('인증코드가 발송되었습니다.');
    } else {
      const error = await response.json();
      alert(error.message || '이메일 발송에 실패했습니다.');
    }
  } catch (error) {
    alert('네트워크 오류가 발생했습니다.');
  }
  isLoading.value = false;
};

// 이메일 인증번호 확인
const verifyEmailCode = async () => {
  if (verificationCode.value.length !== 6) return;

  isLoading.value = true;
  try {
    const response = await fetch(`${basePath}/api/OTD/email/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        code: verificationCode.value,
      }),
    });

    const result = await response.json();

    if (response.ok && result.result?.verified === true) {
      isEmailVerified.value = true;
      alert('이메일 인증이 완료되었습니다.');
    } else {
      alert(result.message || '인증코드가 일치하지 않습니다.');
    }
  } catch (error) {
    alert('네트워크 오류가 발생했습니다.');
  }
  isLoading.value = false;
};

// 약관 동의 처리
const handleAgreementChange = (type) => {
  if (type === 'all') {
    const newValue = !agreements.value.all;
    agreements.value.all = newValue;
    agreements.value.service = newValue;
    agreements.value.privacy = newValue;
    agreements.value.marketing = newValue;
  } else {
    agreements.value[type] = !agreements.value[type];
    const allSelected =
      agreements.value.service &&
      agreements.value.privacy &&
      agreements.value.marketing;
    agreements.value.all = allSelected;
  }
};

// 프로필 이미지 업로드 처리
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    additionalInfo.value.pic = file;
  }
};

const profileImageUrl = computed(() => {
  if (!additionalInfo.value.pic) return null;

  try {
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      return URL.createObjectURL(additionalInfo.value.pic);
    }
  } catch (error) {
    console.error('이미지 URL 생성 오류:', error);
  }
  return null;
});

// 설문 옵션 선택
const selectOption = (questionId, optionValue) => {
  surveyAnswers.value[questionId] = optionValue;
};

// 다음/완료 버튼 클릭
const handleNext = async () => {
  if (currentStep.value < 6) {
    currentStep.value++;
  } else {
    await submitJoin();
  }
};

// 이전 버튼 클릭
const handlePrevious = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// 회원가입 처리
const submitJoin = async () => {
  isLoading.value = true;
  const formData = new FormData();
  try {
    const joinData = {
      uid: accountInfo.value.uid,
      upw: accountInfo.value.upw,
      email: email.value,
      name: additionalInfo.value.name,
      birthDate: additionalInfo.value.birthDate,
      phone: additionalInfo.value.phone,
      gender: additionalInfo.value.gender,
      nickname: additionalInfo.value.nickname,
      roles: ['USER_1'],
      surveyAnswers: calculateSurveyScore.value,
    };

    // JSON 데이터 추가
    formData.append(
      'req',
      new Blob([JSON.stringify(joinData)], {
        type: 'application/json',
      }),'req.json'
    );

    // 프로필 이미지 추가
    if (additionalInfo.value.pic instanceof File || additionalInfo.value.pic instanceof Blob) {
    formData.append('pic', additionalInfo.value.pic, additionalInfo.value.pic.name ?? 'pic');
  }

    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    await join(formData);

    alert('회원가입이 완료되었습니다!');
    router.push('/user/login');
  } catch (error) {
    console.error('회원가입 상세 오류:', error);
    console.error('오류 응답:', error.response);
    console.error('오류 요청:', error.request);
    console.error('오류 메시지:', error.message);

    let errorMessage = '회원가입에 실패했습니다.';

    if (error.response) {
      // 서버에서 응답을 받았지만 오류 상태
      const serverMessage =
        error.response.data?.message || error.response.data?.error;
      errorMessage =
        serverMessage ||
        `서버 오류 (${error.response.status}): ${error.response.statusText}`;
      console.error('서버 응답 데이터:', error.response.data);
    } else if (error.request) {
      // 요청을 보냈지만 응답을 받지 못함
      errorMessage = '서버와 통신할 수 없습니다. 네트워크 연결을 확인해주세요.';
      console.error('요청 정보:', error.request);
    } else {
      // 요청 설정 중에 오류 발생
      errorMessage = `요청 처리 중 오류: ${error.message}`;
    }

    alert(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

// 약관 모달 내용
const modalContent = {
  service: {
    title: '서비스 이용약관',
    content: '서비스 이용약관 내용이 여기에 표시됩니다.',
  },
  privacy: {
    title: '개인정보 처리방침',
    content: '개인정보 처리방침 내용이 여기에 표시됩니다.',
  },
  marketing: {
    title: '마케팅 정보 수신 동의',
    content: '마케팅 정보 수신 동의 내용이 여기에 표시됩니다.',
  },
};
</script>

<template>
  <div class="signup-container">
    <!-- Header -->
    <div class="header"></div>

    <!-- Progress Indicator -->
    <div v-if="currentStep <= 5" class="progress-container">
      <div class="progress-dots">
        <div
          v-for="step in 5"
          :key="step"
          :class="['progress-dot', { active: step <= currentStep }]"
        ></div>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Step 1: 이메일 인증 -->
      <div v-if="currentStep === 1" class="step-container">
        <h2 class="step-title">이메일을 인증해 주세요</h2>

        <div class="form-group">
          <input
            type="email"
            placeholder="이메일"
            v-model="email"
            class="input-field"
          />

          <button
            @click="sendVerificationEmail"
            :disabled="!email || isLoading || emailTimer > 0"
            class="btn btn-primary"
          >
            {{
              isLoading
                ? '발송 중...'
                : emailTimer > 0
                ? `재발송 (${timerDisplay})`
                : '인증번호 전송'
            }}
          </button>

          <div v-if="isEmailSent" class="verification-section">
            <input
              type="text"
              placeholder="인증번호 6자리"
              v-model="verificationCode"
              maxlength="6"
              class="input-field"
            />

            <button
              @click="verifyEmailCode"
              :disabled="verificationCode.length !== 6 || isLoading"
              class="btn btn-secondary"
            >
              {{ isLoading ? '확인 중...' : '인증번호 확인' }}
            </button>

            <div v-if="isEmailVerified" class="success-message">
              ✓ 이메일 인증이 완료되었습니다
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: 약관 동의 -->
      <div v-if="currentStep === 2" class="step-container">
        <h2 class="step-title">서비스 이용동의</h2>

        <div class="form-group">
          <div class="agreement-all">
            <label class="checkbox-container">
              <input
                type="checkbox"
                :checked="agreements.all"
                @change="handleAgreementChange('all')"
                class="checkbox"
              />
              <span class="checkbox-text font-medium">약관 전체동의</span>
            </label>
          </div>

          <div class="agreement-list">
            <div class="agreement-item">
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  :checked="agreements.service"
                  @change="handleAgreementChange('service')"
                  class="checkbox"
                />
                <span>(필수) 서비스 이용약관</span>
              </label>
              <button
                @click="showModal = 'service'"
                class="view-button"
                type="button"
              >
                보기
              </button>
            </div>

            <div class="agreement-item">
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  :checked="agreements.privacy"
                  @change="handleAgreementChange('privacy')"
                  class="checkbox"
                />
                <span>(필수) 개인정보 처리방침</span>
              </label>
              <button
                @click="showModal = 'privacy'"
                class="view-button"
                type="button"
              >
                보기
              </button>
            </div>

            <div class="agreement-item">
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  :checked="agreements.marketing"
                  @change="handleAgreementChange('marketing')"
                  class="checkbox"
                />
                <span>(선택) 마케팅 정보 수신 동의</span>
              </label>
              <button
                @click="showModal = 'marketing'"
                class="view-button"
                type="button"
              >
                보기
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: 계정 정보 (개선된 검증 시스템) -->
      <div v-if="currentStep === 3" class="step-container">
        <h2 class="step-title">아이디 비밀번호 입력</h2>

        <!-- 일반 에러 메시지 -->
        <div v-if="generalError" class="error-message">
          <div class="message-icon">⚠</div>
          <div>{{ generalError }}</div>
        </div>

        <div class="form-group">
          <!-- 아이디 입력 및 중복검사 -->
          <div class="form-group">
            <label for="uid">아이디 *</label>
            <div class="input-wrapper">
              <input
                type="text"
                id="uid"
                placeholder="아이디를 입력해 주세요 (4자 이상)"
                v-model="accountInfo.uid"
                :class="{
                  'input-field-with-button': true,
                  error: validation.uid.touched && !validation.uid.isValid,
                  success:
                    validation.uid.touched &&
                    validation.uid.isValid &&
                    validation.uid.available,
                }"
                @blur="handleFieldTouch('uid')"
                @input="
                  validation.uid.touched &&
                    validateField('uid', accountInfo.uid)
                "
              />
              <button
                type="button"
                class="btn-small"
                @click="checkIdDuplicate"
                :disabled="isLoading"
              >
                <span v-if="isLoading">확인중...</span>
                <span v-else>중복확인</span>
              </button>
            </div>
            <div
              v-if="validation.uid.touched && validation.uid.message"
              :class="[
                'field-message',
                validation.uid.isValid && validation.uid.available
                  ? 'field-success'
                  : 'field-error',
              ]"
            >
              {{ validation.uid.message }}
            </div>
          </div>

          <!-- 비밀번호 입력 -->
          <div class="form-group">
            <label for="upw"></label>
            <div class="input-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="upw"
                placeholder="비밀번호를 입력해주세요(10자 이상)"
                v-model="accountInfo.upw"
                :class="{
                  'input-field-with-icon': true,
                  error: validation.upw.touched && !validation.upw.isValid,
                  success:
                    validation.upw.touched &&
                    validation.upw.isValid &&
                    accountInfo.upw,
                }"
                @blur="handleFieldTouch('upw')"
                @input="
                  validation.upw.touched &&
                    validateField('upw', accountInfo.upw)
                "
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="input-icon-button"
              >
                <svg
                  v-if="!showPassword"
                  class="icon-sm"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  class="icon-sm"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              </button>
            </div>
            <div
              v-if="validation.upw.touched && validation.upw.message"
              :class="[
                'field-message',
                validation.upw.isValid ? 'field-success' : 'field-error',
              ]"
            >
              {{ validation.upw.message }}
            </div>
            <p>
              비밀번호는 영문자, 숫자, 특수기호로 구성되며 10자 이상이어야
              합니다.
            </p>
          </div>

          <!-- 비밀번호 확인 -->
          <div class="form-group">
            <label for="confirmPassword"></label>
            <div class="input-wrapper">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                placeholder="비밀번호를 한번더 확인해주세요"
                v-model="accountInfo.confirmPassword"
                :class="{
                  'input-field-with-icon': true,
                  error:
                    accountInfo.confirmPassword && !passwordMatchStatus.isMatch,
                  success:
                    passwordMatchStatus.show && passwordMatchStatus.isMatch,
                }"
                @blur="handleFieldTouch('confirmPassword')"
                @input="
                  () => {
                    if (accountInfo.confirmPassword) {
                      validation.confirmPassword.touched = true;
                      validateField(
                        'confirmPassword',
                        accountInfo.confirmPassword
                      );
                    }
                  }
                "
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="input-icon-button"
              >
                <svg
                  v-if="!showConfirmPassword"
                  class="icon-sm"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  class="icon-sm"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              </button>
            </div>

            <div
              v-if="passwordMatchStatus.show"
              :class="[
                'field-message',
                'password-match-message',
                passwordMatchStatus.isMatch ? 'field-success' : 'field-error',
              ]"
            >
              {{ passwordMatchStatus.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: 추가 정보 -->
      <div v-if="currentStep === 4" class="step-container">
        <h2 class="step-title">추가정보를 입력해주세요</h2>

        <div class="form-group">
          <!-- 프로필 이미지 -->
          <div class="profile-image-container">
            <div class="profile-image-wrapper">
              <div class="profile-image">
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  alt="Profile"
                  class="profile-img"
                />
                <div v-else class="profile-placeholder"></div>
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handleFileChange"
                class="file-input"
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="이름"
            v-model="additionalInfo.name"
            class="input-field"
          />

          <input
            type="text"
            placeholder="생년월일"
            v-model="additionalInfo.birthDate"
            class="input-field"
          />

          <input
            type="tel"
            placeholder="휴대폰번호"
            v-model="additionalInfo.phone"
            class="input-field"
          />

          <select v-model="additionalInfo.gender" class="input-field">
            <option value="">성별 선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>

          <!-- 닉네임 입력 및 중복검사 -->
          <div class="form-group">
            <label for="nickname"></label>
            <div class="input-wrapper">
              <input
                type="text"
                id="nickname"
                placeholder="닉네임을 입력해 주세요 (2~10자)"
                v-model="additionalInfo.nickname"
                :class="{
                  'input-field-with-button': true,
                  error:
                    validation.nickname.touched && !validation.nickname.isValid,
                  success:
                    validation.nickname.touched &&
                    validation.nickname.isValid &&
                    validation.nickname.available,
                }"
                @blur="validation.nickname.touched = true"
                maxlength="10"
              />
              <button
                type="button"
                class="btn-small"
                @click="checkNicknameDuplicateAction"
                :disabled="isLoading"
              >
                <span v-if="isLoading">확인중...</span>
                <span v-else>중복확인</span>
              </button>
            </div>
            <div
              v-if="validation.nickname.touched && validation.nickname.message"
              :class="[
                'field-message',
                validation.nickname.isValid && validation.nickname.available
                  ? 'field-success'
                  : 'field-error',
              ]"
            >
              {{ validation.nickname.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Step 5: 설문조사 -->
      <div v-if="currentStep === 5" class="step-container">
        <h2 class="step-title">운동 및 체력 설문조사</h2>

        <div class="questions-container">
          <div
            v-for="(question, index) in surveyQuestions"
            :key="question.id"
            class="question-block"
          >
            <div class="question-header">
              <span class="question-number">Q{{ index + 1 }}</span>
              <h3 class="question-text">{{ question.question }}</h3>
            </div>

            <div class="options-grid">
              <button
                v-for="option in question.options"
                :key="option.value"
                @click="selectOption(question.id, option.value)"
                :class="[
                  'option-button',
                  { selected: surveyAnswers[question.id] === option.value },
                ]"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 6: 완료 -->
      <div v-if="currentStep === 6" class="step-container result-container">
        <h2 class="result-title">회원님의 체력 등급은?</h2>

        <div class="result-content">
          <div class="rank-display">
            <div
              class="rank-badge"
              :style="{ backgroundColor: getFitnessRank.color }"
            >
              {{ getFitnessRank.name }}
            </div>
          </div>
          <p class="result-description">
            설문 결과를 바탕으로 맞춤형 운동을 추천해드릴게요!
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Buttons -->
    <div class="bottom-buttons">
      <button
        v-if="currentStep > 1 && currentStep <= 5"
        @click="handlePrevious"
        class="btn btn-outline"
      >
        이전
      </button>

      <button
        v-if="currentStep <= 5"
        @click="handleNext"
        :disabled="!canProceedToNext"
        class="btn btn-primary"
        :class="{ 'full-width': currentStep === 1 }"
      >
        {{ currentStep === 5 ? '완료' : '다음' }}
      </button>

      <button
        v-if="currentStep === 6"
        @click="handleNext"
        :disabled="isLoading"
        class="btn btn-start full-width"
      >
        {{ isLoading ? '처리 중...' : '시작하기' }}
      </button>
    </div>

    <!-- 약관 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = ''">
      <div class="modal" @click.stop>
        <h3 class="modal-title">{{ modalContent[showModal]?.title }}</h3>
        <div class="modal-content">
          <p class="modal-text">{{ modalContent[showModal]?.content }}</p>
        </div>
        <button @click="showModal = ''" class="btn btn-primary">확인</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.signup-container {
  min-height: 100vh;
  background-color: #ffffff;
}

.header {
  background-color: white;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.back-button {
  margin-right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #374151;
}

.title-gray {
  color: #9ca3af;
}

.icon-xs {
  width: 1rem;
  height: 1rem;
}
.icon-sm {
  width: 1.25rem;
  height: 1.25rem;
}
.icon-md {
  width: 1.5rem;
  height: 1.5rem;
}
.icon-lg {
  width: 2rem;
  height: 2rem;
}

.progress-container {
  background-color: white;
  padding: 0.75rem 1rem;
}

.progress-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.progress-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: #d1d5db;
}

.progress-dot.active {
  background-color: #00d5df;
}

.content {
  padding: 1.5rem 20px;
}

.step-container {
  max-width: 28rem;
  margin: 0 auto;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-field:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.input-wrapper {
  position: relative;
  display: flex;
  gap: 8px;
}

.input-field-with-icon {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-field-with-button {
  flex: 1;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-field-with-icon:focus,
.input-field-with-button:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-field-with-icon.error,
.input-field-with-button.error {
  border-color: #dc2626;
  background-color: #fef2f2;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.input-field-with-icon.success,
.input-field-with-button.success {
  border-color: #16a34a;
  background-color: #f0fdf4;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.input-icon-button {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.btn {
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  width: 100%;
  height: 55px;
}

.btn:disabled {
  cursor: not-allowed;
}

.btn-primary {
  background-color: #393e46;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #303030;
}

.btn-primary:disabled {
  background-color: #d1d5db;
}

.btn-secondary {
  background-color: #393e46;
  color: white;
  gap: 3px;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #303030;
}

.btn-secondary:disabled {
  background-color: #d1d5db;
}

.btn-outline {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn-outline:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
}

.btn-start {
  background-color: #10b981;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  width: 100%;
}

.btn-start:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.btn-small {
  flex-shrink: 0;
  padding: 0 16px;
  background: #555;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80px;
  height: 55px;
}

.btn-small:hover:not(:disabled) {
  background: #333;
}

.btn-small:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #999;
}

.success-message {
  color: #10b981;
  text-align: center;
  font-weight: 500;
}

.error-message {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.message-icon {
  margin-right: 8px;
  font-weight: bold;
}

.field-message {
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
}

.field-error {
  color: #dc2626;
}

.field-success {
  color: #16a34a;
}

.password-match-message {
  font-weight: 500;
  transition: all 0.3s ease;
}

.agreement-all {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.agreement-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  flex: 1;
}

.agreement-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #ffffff;
}

.checkbox-text {
  font-size: 1rem;
}

.font-medium {
  font-weight: 500;
}

.view-button {
  color: #6b7280;
  font-size: 0.875rem;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
}

.view-button:hover {
  color: #374151;
}

.profile-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.profile-image-wrapper {
  position: relative;
}

.profile-image {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 설문조사 스타일 */
.questions-container {
  margin-bottom: 20px;
}

.question-block {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #10b981;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.question-number {
  background: #10b981;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}

.question-text {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.option-button {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: #f8f9fa;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-button:hover {
  background: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.option-button.selected {
  background: #10b981;
  color: white;
  border-color: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* 결과 페이지 스타일 */
.result-container {
  text-align: center;
  padding: 2rem 1rem;
}

.result-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #333;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.rank-display {
  display: flex;
  justify-content: center;
}

.rank-badge {
  padding: 1.5rem 2.5rem;
  border-radius: 2rem;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  min-width: 200px;
}

.bottom-buttons {
  display: flex;
  background-color: white;
  padding: 1rem;
  gap: 0.75rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 28rem;
  width: 100%;
  margin: 0 1rem;
  max-height: 24rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.modal-content {
  overflow-y: auto;
  max-height: 16rem;
  margin-bottom: 1rem;
}

.modal-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-white {
  color: white;
}

/* 반응형 */
@media (max-width: 600px) {
  .step-container {
    max-width: 100%;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .question-text {
    font-size: 15px;
  }

  .option-button {
    font-size: 13px;
    min-height: 45px;
  }

  .rank-badge {
    font-size: 1.5rem;
    padding: 1rem 2rem;
    min-width: 150px;
  }

  .result-title {
    font-size: 1.3rem;
  }
}
</style>
