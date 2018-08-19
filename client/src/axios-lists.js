import axios from 'axios';

const apiURL = process.env.hostURL || "https://devnetpractice.herokuapp.com";

const instance = axios.create({
   baseURL: apiURL 
});

export default instance;