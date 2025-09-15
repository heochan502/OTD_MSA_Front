import { reactive } from 'vue';
import { defineStore } from 'pinia';
import router from '@/router';

export const useAuthenticationStore = defineStore(
  'authentication',
  () => {
    const state = reactive({
      signedUser: null,
      isSigned: false,
    });

    const setSignedUser = (signedUser) => {
      state.isSigned = true;
      state.signedUser = signedUser;
    };

    const setSignedUserPic = (pic) => {
      if (state.signedUser) state.signedUser.pic = pic;
    };

    const logout = async () => {
        localStorage.removeItem('accessToken'); // 토큰 삭제
        state.isSigned = false;
        state.signedUser = null;
        await router.push('/user/login');
      };

    return { state, setSignedUser, setSignedUserPic, logout };
  },
  { persist: true }
);