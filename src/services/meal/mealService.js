import axios from '@/services/httpRequester';

const path = `/meal`;


// 데이터 가져오는곳
export const getFood = async (foodName) => {
    
  //  console.log('음식 검색', foodInfo);
    const res = await axios.get(`${path}/search`,  {  params: { foodName }  } );
    // if (res.status !== 200) {
    //     throw new Error(`Error fetching food names: ${res.statusText}`);
    // }
//  console.log('json', res.data);
    return res.data;
}


export const postMealRecord = async (payload) => {
  
  console.log("식단 기록 서비스", payload);
  const res = await axios.post(`${path}/record`, payload);
  return res.data;
};


export const getMealRecord = async (mealDay) => {
  // console.log("식단 기록 날짜", mealDay);
  const res = await axios.get(`${path}`, { params: { mealDay } });
  // console.log("식단 기록 데이터", res.data);
  return res.data;
};

export const getMyDay = async(mealDay) => {
  const res = await axios.get(`${path}/myday`, { params: { mealDay } });
  console.log("나의, 하루", res.data);
  return res.data;
}

export const getSummaryDay = async(mealDay) => {
  const res = await axios.get(`${path}/summary/day`, { params: { mealDay } });
  // console.log("식단 하루 요약 데이터", res.data);
  return res.data;
};


export const getSummaryWeek = async (start, end) => {
  const res = await axios.get(`${path}/summary/week`, {
    params: { start, end },
  });
  // console.log("식단 주간 요약 데이터", res.data);
  return res.data;
};

export const getSummaryMonth = async (month) => {
  const res = await axios.get(`${path}/summary/month`, {
    params: { month },
  });
  // console.log("식단 월간 요약 데이터", res.data);
  return res.data;
};

// admin
export const getUserMealRecord = (userId) => {
  return axios.get(`${path}/${userId}`).catch((e) => e.response);
};
