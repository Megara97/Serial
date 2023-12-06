import dotenv from "dotenv";

dotenv.config();

const config = {
  HOST_SERVER_SOCKET: process.env.HOST_SERVER_SOCKET
};

export default config;
