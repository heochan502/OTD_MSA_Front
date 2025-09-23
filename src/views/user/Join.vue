<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { join } from '@/services/user/userService';
import { checkValidation } from '@/utils/validation';

const fileInput = ref(null);
const router = useRouter();

const state = reactive({
  data: {
    uid: '',
    upw: '',
    chkUpw: '',
    nickName: '',
    name: '',
    birthday: '',
    gender: '',
    email: '',
    phone: '',
    pic: null,
    roles: [],
  },
});

const openFileSelector = () => {
  fileInput.value.click();
};

const handlePicChanged = (e) => {
  state.data.pic = e.target.files[0];
};

const submit = async () => {

  if (checkValidation()) return;


  if (state.data.chkUpw !== state.data.upw) {
    alert('비밀번호와 확인 비밀번호가 일치하지 않습니다.');
    return;
  }

  if (state.data.roles.length === 0) {
    alert('역할을 선택해 주세요.');
    return;
  }


  const requiredFields = ['uid', 'upw', 'name', 'birthday', 'gender', 'email', 'phone'];
  for (const field of requiredFields) {
    if (!state.data[field] || state.data[field].trim() === '') {
      alert(`${getFieldName(field)}을(를) 입력해주세요.`);
      return;
    }
  }


  const params = {
    uid: state.data.uid.trim(),
    upw: state.data.upw.trim(),
    name: state.data.name.trim(),
    birthday: state.data.birthday.trim(),
    gender: state.data.gender,
    email: state.data.email.trim(),
    phone: state.data.phone.trim(), 
    roles: state.data.roles,
    
  };


  if (state.data.nickName.trim().length > 0) {
    params.nickName = state.data.nickName.trim();
  }

  const formData = new FormData();
  formData.append('req', new Blob([JSON.stringify(params)], { type: 'application/json' }));
  if (state.data.pic) {
    formData.append('pic', state.data.pic);
  }


  try {
    const res = await join(formData);
    console.log('res:', res);
    if (res.status === 200) {
      alert('회원가입이 완료되었습니다.');
      router.push('/login');
    }
  } catch (error) {
    console.error('회원가입 오류:', error);
    alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
};


const getFieldName = (field) => {
  const fieldNames = {
    uid: '아이디',
    upw: '비밀번호',
    name: '이름',
    birthday: '생년월일',
    gender: '성별',
    email: '이메일',
    phone: '휴대폰번호'
  };
  return fieldNames[field] || field;
};


</script>

<template>
  <div class="join">
    <div class="container">
      <form class="py-5 d-flex flex-column gap-3" @submit.prevent="submit">
        <h1 class="h5 mb-3">회원가입</h1>

        <div class="form-floating">
          <input
            type="text"
            class="form-control"
            id="uid"
            placeholder="아이디"
            v-model="state.data.uid"
            required
            not-null-message="아이디는 필수로 입력하셔야 합니다."
            regexp="^[A-Za-z0-9_]{4,50}$"
            regexp-message="아이디는 영어, 숫자, 언더바로만 구성되어야 하며 4~50자까지 작성할 수 있습니다." />
          <label for="uid" class="form-label">아이디 *</label>
        </div>

        <div class="form-floating">
          <input
            type="password"
            class="form-control"
            id="upw"
            placeholder="비밀번호"
            v-model="state.data.upw"
            required
            not-null-message="비밀번호는 필수로 입력하셔야 합니다."
            regexp-message="비밀번호는 영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다."
            autocomplete="new-password" />
          <label for="upw" class="form-label">비밀번호 *</label>
        </div>

        <div class="form-floating">
          <input
            type="password"
            class="form-control"
            id="chkUpw"
            placeholder="비밀번호 확인"
            v-model="state.data.chkUpw"
            required
            autocomplete="new-password" />
          <label for="chkUpw" class="form-label">비밀번호 확인 *</label>
        </div>

        <div class="form-floating">
          <input
            type="text"
            class="form-control"
            id="nickName"
            placeholder="닉네임"
            v-model="state.data.nickName"
            regexp="^[가-힣a-zA-Z0-9]{2,10}$"
            regexp-message="닉네임은 한글, 영문, 숫자로 2~10자까지 가능합니다." />
          <label for="nickName" class="form-label">닉네임</label>
        </div>

        <div class="form-floating">
          <input
            type="text"
            class="form-control"
            id="name"
            placeholder="이름"
            v-model="state.data.name"
            required
            not-null-message="이름은 필수로 입력하셔야 합니다."
            regexp="^[가-힣]{2,10}$"
            regexp-message="이름은 한글로 2~10자까지 가능합니다." />
          <label for="name" class="form-label">이름 *</label>
        </div>

        <div class="form-floating">
          <input
            type="text"
            class="form-control"
            id="birthday"
            placeholder="생년월일 (YYYYMMDD)"
            v-model="state.data.birthday"
            required
            not-null-message="생년월일은 필수로 입력하셔야 합니다."
            regexp="^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$"
            regexp-message="생년월일은 YYYYMMDD 형식으로 입력해주세요."
            maxlength="8" />
          <label for="birthday" class="form-label">생년월일 *</label>
        </div>

        <div class="form-floating">
          <select
            class="form-select"
            id="gender"
            v-model="state.data.gender"
            required>
            <option value="">성별 선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
          <label for="gender" class="form-label">성별 *</label>
        </div>

        <div class="form-floating">
          <input
            type="email"
            class="form-control"
            id="email"
            placeholder="이메일"
            v-model="state.data.email"
            required
            not-null-message="이메일은 필수로 입력하셔야 합니다."
            regexp="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            regexp-message="올바른 이메일 형식을 입력해주세요." />
          <label for="email" class="form-label">이메일 *</label>
        </div>

        <div class="form-floating">
          <input
            type="tel"
            class="form-control"
            id="phone"
            placeholder="휴대폰번호"
            v-model="state.data.phone"
            required
            not-null-message="휴대폰번호는 필수로 입력하셔야 합니다."
            regexp="^01[0-9]-\d{4}-\d{4}$"
            regexp-message="휴대폰번호는 010-0000-0000 형식으로 입력해주세요."
            maxlength="13" />
          <label for="phone" class="form-label">휴대폰번호 *</label>
        </div>

        <div class="form-floating">
          <select 
            v-model="state.data.roles" 
            multiple 
            class="form-select"
            id="roles"
            required
            style="min-height: 80px;">
            <option value="유저">유저</option>
            <option value="매니저">매니저</option>
          </select>
          <label for="roles" class="form-label">역할 * (복수 선택 가능)</label>
        </div>

        <div class="d-flex align-items-center gap-3">
          <button 
            type="button"
            class="btn btn-outline-primary"
            @click="openFileSelector">
            프로필 사진 선택
          </button>
          <input
            ref="fileInput"
            hidden
            id="pic"
            type="file"
            accept="image/*"
            @change="handlePicChanged" />
          <span v-if="state.data.pic" class="text-muted">
            {{ state.data.pic.name }}
          </span>
          <span v-else class="text-muted">
            선택된 파일 없음
          </span>
        </div>

        <button type="submit" class="w-100 h6 btn py-3 btn-primary mt-3">
          회원가입
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.container { 
  max-width: 576px; 
}

.form-label {
  font-weight: 500;
}

.text-muted {
  font-size: 0.9rem;
}

/* 필수 필드 표시 */
.form-label::after {
  content: "";
}

/* 역할 선택 다중 선택 스타일링 */
select[multiple] {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

select[multiple] option {
  padding: 0.25rem 0.5rem;
  margin: 0.1rem 0;
}

select[multiple] option:checked {
  background: #007bff;
  color: white;
}

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
}
</style>