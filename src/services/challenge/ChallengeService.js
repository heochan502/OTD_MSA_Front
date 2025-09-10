import axios from 'axios';


export const getAll= () => {
  console.log("dd");
  return axios
    .get('/chellenge')
    .catch((e) => e.response);
};