import axios from '@/services/httpRequester';

const path = `/meal`;


// 데이터 가져오는곳
export const getFood = async (foodName) => {
    
  //  console.log('음식 검색', foodInfo);
    const res = await axios.get(path, { params: { foodName }});
    // if (res.status !== 200) {
    //     throw new Error(`Error fetching food names: ${res.statusText}`);
    // }
//  console.log('json', res.data);
    return res.data;
}
