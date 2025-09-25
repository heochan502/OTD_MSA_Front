
import { reactive } from 'vue';
import { defineStore } from 'pinia';
import router from '@/router';

export const useAuthenticationStore = defineStore(
  'authentication',
  () => {
    const state = reactive({
      signedUser: {
        userId: 0,
        nickName: '',
        pic: null,
        point: 0,
        xp: 0,
        challengeRole: '',
      },
      isSigned: false,
    });

    const setSignedUser = (signedUser) => {
      state.isSigned = true;
      state.signedUser = signedUser;
    };


    const setSigndUserPic = (pic) => {
      state.signedUser.pic = pic;
    };


    const setPoint = (point) => {
      state.signedUser.point = point;
    };

        const logout = async () => {
            console.log('logout 처리')
            state.signedUser = { userId: 0, nickName: '', pic: null };
            state.accessToken = null;
            state.refreshToken = null;
            state.isSigned = false;      
        }

    const logout = async () => {
      console.log('logout 처리');
      state.isSigned = false;
      state.signedUser = null;
      await router.push('/user/login');
    };

    return { state, setSignedUser, setSigndUserPic, setPoint, logout };
  },
  { persist: true }
);
