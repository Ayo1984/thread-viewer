import axios from 'axios';
import https from 'https';
import http from 'http';
import { SERVER_URL } from './constants';

const AXIOS_TIMEOUT = 60 * 1000;
const AGENT_CONFIG = {
    keepAlive: true,
    timeout: AXIOS_TIMEOUT,
};

const axiosInstance =   axios.create({
    timeout: AXIOS_TIMEOUT,
    httpsAgent: new https.Agent(AGENT_CONFIG),
    httpAgent: new http.Agent(AGENT_CONFIG),
    baseURL: SERVER_URL,
});

export default axiosInstance;
