import dotenv from "dotenv"
dotenv.config()

const config = {
  
    auth: process.env.DATABASE_IS_AUTH,
    httpPort: process.env.HTTP_PORT,
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST,
    name: process.env.DATABASE_NAME,
    env: process.env.NODE_ENV,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,

    //cloudinary 
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apikey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,

    //JWT
    customerSecret: process.env.CUSTOMER_JWT_SECRET,
    merchantSecret: process.env.MERCHANT_JWT_SECRET,
    customerReset: process.env.CUS_RESET_PASSWORD_SECRET,
    merchantReset: process.env.MER_RESET_PASSWORD_SECRET,
    customerEmailSecret: process.env.CUS_EMAIL_SECRET,
    merchantEmailSecret: process.env.MER_EMAIL_SECRET,
    

  };
  
  export default config;
  