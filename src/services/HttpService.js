import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080/api/OTD';

class HttpService {}

export default new HttpService();
