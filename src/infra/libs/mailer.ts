import nodemailer from "nodemailer"
import dotenv from "dotenv";
dotenv.config()
import logger from "../../interface/http/utils/logger"
import fs from "fs"
import hbs from "handlebars"
import nodemailMailgun from 'nodemailer-mailgun-transport'

const auth = {
  auth: {
    api_key: `${process.env.MAILGUN_API_KEY}`,
    domain: `${process.env.MAILGUN_DOMAIN}`
  }
}


//Email Templates
const welcomeTemplate = fs.readFileSync('src/views/index.handlebars', 'utf8')
const resetTemplate =fs.readFileSync('src/views/reset.handlebars', 'utf8')
const adminTemplate =fs.readFileSync('src/views/adminSignUp.handlebars', 'utf8')
const orderCompleteTemplate= fs.readFileSync('src/views/orderComplete.handlebars', 'utf8')
const orderFailedTemplate= fs.readFileSync('src/views/orderFailed.handlebars', 'utf8')

// let transporter = nodemailer.createTransport({
//         host: `0.0.0.0`,
//         port: 1025,
//         secure: false, // true for 465, false for other ports
//         auth: {
//                     user: "postmaster@sandbox4706e5e4103c4859a32d397410b86f50.mailgun.org", // generated ethereal user
//                     pass: "e51b3b083867a46b60790aee085e5cd0-e2e3d8ec-d60bc02e", // generated ethereal password
//                 },
// });

let transporter = nodemailer.createTransport(nodemailMailgun(auth))

export const sendVerificationMail = async (email: string , link: string , name: string) => {
  const options = {
    link: link, 
    name: name
  }

  const mail = hbs.compile(welcomeTemplate)(options)
 
    // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"YOUSTORE" <youstore@example.com>', // sender address
    to: `${email}`, // list of receivers
    subject: "Account Verification", // Subject line
    text: `Hello, An Admin account has been created for you on Youstore

    Before you jet off to starting using the Admin portal, please click on the 
    link below to provide more information about your account and create a password!


    LINK: ${link}  
    
    
    Regards:
    Youstore
    `, // plain text body
    
    html: `
          ${mail}
    `,
    //template: ''
     // html body
  },);

  logger.info("Email has been sent");

}

export const sendAdminSignUpMail = async (email: string , link: string) => {
  const options = {
    link: link
  }

  const mail = hbs.compile(adminTemplate)(options)
 
    // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"YOUSTORE" <youstore@example.com>', // sender address
    to: `${email}`, // list of receivers
    subject: "Admin Account SignUp", // Subject line
    text: `Hello, you have successfully created an account on youstore, 
    the first Ecommerce platform built with Microservices in Nigeria!

    Before you jet off to starting using the platform please click on the 
    link below to confirm your account!


    LINK: ${link}  
    
    
    Regards:
    Youstore
    `, // plain text body
    
    html: `
          ${mail}
    `,
    //template: ''
     // html body
  },);

  logger.info("Email has been sent");

}


export const sendPasswordResetMail = async (email: string , link: string) => {

  const options = {
    link: link
  }

  const mail = hbs.compile(resetTemplate)(options)  
    // send mail with defined transport object
    await transporter.sendMail({
    from: '"YOUSTORE" <youstore@example.com>', // sender address
    to: email, // list of receivers
    subject: "Password Reset Link", // Subject line
    text: `A password reset link was requested for your account. please click on the link below to reset your account password!

             LINK: ${link}     
             this link can only be used once and expires in 15 minutes`, // plain text body
    html: `
          ${mail}
    `, // html body
  });

  logger.info("Email has been sent");

}

export const sendOrderCompleteMail = async (email: string , products: string, orderId: string) => {

  const options = {
    products: products,
    orderId: orderId 
  }

  const mail = hbs.compile(orderCompleteTemplate)(options)  
    // send mail with defined transport object
    await transporter.sendMail({
    from: '"YOUSTORE" <youstore@example.com>', // sender address
    to: email, // list of receivers
    subject: "Order Successful", // Subject line
    text: `We've Received Your Order
    Hello, Thanks for shopping on Youstore! Please find a summary of your recent purchase belows 

             PRODUCTS: ${products}     
             It usually takes up to two business days to process and ship your order,
              you'll receive another mail from us once your order have been shipped. Your Order id is ${orderId}`, // plain text body
    html: `
          ${mail}
    `, // html body
  });

  logger.info("Email has been sent");

}

export const sendOrderFailedMail = async (email: string , products: string, orderId: string) => {

  const options = {
    products: products,
    orderId: orderId 
  }

  const mail = hbs.compile(orderFailedTemplate)(options)  
    // send mail with defined transport object
    await transporter.sendMail({
    from: '"YOUSTORE" <youstore@example.com>', // sender address
    to: email, // list of receivers
    subject: "Order Failed", // Subject line
    text: `Hello, Your payment failed and We couldn't process your order for the products below

             PRODUCTS: ${products}    
             
             You can initiate this order again by providing the order ID: ${orderId}
             `, // plain text body
    html: `
          ${mail}
    `, // html body
  });

  logger.info("Email has been sent");

}