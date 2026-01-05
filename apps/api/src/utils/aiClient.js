import axios from "axios";

if (!process.env.INTERNAL_API_KEY) {
  throw new Error("INTERNAL_API_KEY environment variable is required");
}

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-internal-key": process.env.INTERNAL_API_KEY
  },
  timeout: 90000
});

export default aiClient;