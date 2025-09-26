import { reactive } from 'vue';
import { defineStore } from 'pinia';
import router from '@/router';

const DEFAULT_PROFILE = '/otd/image/main/default-profile.png';
const FILE_URL = import.meta.env.VITE_BASE_URL;
export const useAuthenticationStore = defineStore(
  'authentication',
  () => {
    const state = reactive({
      signedUser: {
        userId: 0,
        nickName: '',
        pic: DEFAULT_PROFILE,
        point: 0,
        xp: 0,
        challengeRole: '',
      },
      isSigned: false,
    });

    const setSignedUser = (signedUser) => {
      state.isSigned = true;
      state.signedUser = {
        ...signedUser,
        pic:
          signedUser.pic && signedUser.pic.trim() !== ''
            ? `${FILE_URL}/profile/${signedUser.userId}/${signedUser.pic}`
            : DEFAULT_PROFILE,
      };
    };

    const setSigndUserPic = (pic) => {
      state.signedUser.pic = pic;
    };

    const setPoint = (point) => {
      state.signedUser.point = point;
    };

    const logout = async () => {
      console.log('logout 처리');
      state.signedUser = { userId: 0, nickName: '', pic: DEFAULT_PROFILE };
      state.accessToken = null;
      state.refreshToken = null;
      state.isSigned = false;
    };

    return { state, setSignedUser, setSigndUserPic, setPoint, logout };
  },
  { persist: true }
);
