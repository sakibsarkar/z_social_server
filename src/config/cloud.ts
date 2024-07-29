import { v2 as cloudinary } from "cloudinary";

const { CN_Cloud_name, CN_Api_key, CN_Api_secret } = process.env;

cloudinary.config({
  cloud_name: CN_Cloud_name,
  api_key: CN_Api_key,
  api_secret: CN_Api_secret,
});
export default cloudinary;
