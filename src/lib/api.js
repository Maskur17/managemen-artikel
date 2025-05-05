import axios from "axios";

const api = axios.create({
  baseURL: "https://test-fe.mysellerpintar.com/api",
});

export default api;
