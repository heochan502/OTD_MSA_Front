import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8082/api/OTD';

class HttpService {}

export default new HttpService();
