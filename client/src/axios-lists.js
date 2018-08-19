import axios from 'axios';

const apiURL = process.env.hostURL || "https://devconnectpractice-ysongh.c9users.io:8081";

const instance = axios.create({
   baseURL: apiURL 
});

export default instance;