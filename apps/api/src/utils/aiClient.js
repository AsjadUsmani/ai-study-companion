import axios from "axios";

const aiClient = axios.create({
    baseURL: process.env.AI_CLIENT_URL || "http://127.0.0.1:8000",
    timeout: 15000,
    headers: {
    "x-internal-key": process.env.INTERNAL_API_KEY,
  },
})

export default aiClient;