import axios from '@/services/httpRequester';

const path = `/waterIntake`;



export const getWaterIntake = async (intakeDate) => {
  const res = await axios.get(`${path}`, { params: { intakeDate } });
//   console.log(res.data);
  return res.data;
};

export const postWaterIntake = async (indata) => {
  const res = await axios.post(`${path}`, indata);
  return res.data;
};

export const putWaterIntake = async (indata) => {
  const res = await axios.put(`${path}`, indata);
  return res.data;
}