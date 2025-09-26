import { reactive, computed } from 'vue';
import { defineStore } from 'pinia';

export const useAuthenticationStore = defineStore(
  'authentication',
  () => {
    const state = reactive({
      signedUser: {
        userId: 0,
        nickName: '',
        email: '',
        point: 0,
        pic: null,
      },
      accessToken: null,
      refreshToken: null,
      isSigned: false,
    });

    const setSignedUser = ({ user, accessToken, refreshToken }) => {
      state.isSigned = true;
      state.signedUser = {
        userId: user.userId || 0,
        nickName: user.nickName || '',
        email: user.email || '',
        point: user.point || 0,
        pic: user.pic || null,
      };
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
    };

    const setSigndUserPic = (pic) => {
      state.signedUser.pic = pic;
    };

    const setPoint = (point) => {
      state.signedUser.point = point;
    };

    const logout = async () => {
      console.log('logout 처리');
      state.signedUser = {
        userId: 0,
        nickName: '',
        email: '',
        point: 0,
        pic: null,
      };
      state.accessToken = null;
      state.refreshToken = null;
      state.isSigned = false;
    };

    return {
      state,
      setSignedUser,
      setSigndUserPic,
      logout,

      isLoggedIn: computed(() => state.isSigned),
      userName: computed(() => state.signedUser?.nickName || ''),
      userId: computed(() => state.signedUser?.userId || 0),
      userPic: computed(() => state.signedUser?.pic || null),
    };
  },
  { persist: true }
);
