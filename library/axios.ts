import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export default axiosClient;
