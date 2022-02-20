import nodemailer from "nodemailer"
import dotenv from "dotenv";
dotenv.config()
import logger from "../../interface/http/utils/logger"



let transporter = nodemailer.createTransport({
        host: `0.0.0.0`,
        port: 1025,
        secure: false, // true for 465, false for other ports
        auth: {
                    user: `${process.env.USER}`, // generated ethereal user
                    pass: `${process.env.PASS}`, // generated ethereal password
                },
});

export const sendVerificationMail = async (email: string , link: string) => {
    // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"YOUSTORE" <youstore@example.com>', // sender address
    to: `${email}`, // list of receivers
    subject: "Account Verification", // Subject line
    text: `Hello, you have successfully created an account on youstore, 
    the first Ecommerce platform built with Microservices in Nigeria!

    Before you jet off to starting using the platform please click on the 
    link below to confirm your account!


    LINK: ${link}  
    
    
    Regards:
    Youstore
    `, // plain text body

    
    html: `
    <b>Welcome to Youstore</b>

    <p>Hello, you have successfully created an account on youstore, 
    the first Ecommerce platform built with Microservices in Nigeria!

    <br/>
    <br/>

    Before you jet off to starting using the platform please click on the 
    link below to confirm your account!

    <br/>
    <br/>

   <h4> <a href="${link}">CONFIRM MY ACCOUNT</a> </h4>


    <br/>
    <br/>

    Regards:<br/>
    Youstore
    
    </p>
    
    `, // html body
  });

  logger.info("Email has been sent");

}

export const sendPasswordResetMail = async (email: string , link: string) => {
    // send mail with defined transport object
    await transporter.sendMail({
    from: '"YOUSTORE" <youstore@example.com>', // sender address
    to: email, // list of receivers
    subject: "Password Reset Link", // Subject line
    text: `Hello, click on the link below to reset your account password 

             LINK: ${link}     
             this link can only be used once and expires in 15 minutes`, // plain text body
    html: `
    <b>PASSWORD RESET LINK</b>

    <p>Hello, click on the link below to reset your account password</p>

    LINK:  <h4> <a href="${link}">RESET MY PASSWORD</a> </h4> 
    <br/>
    <br/>

    This link can only be used once and expires in 15 minutes

    <br/>
    <br/>

    Regards:<br/>
    <b> Youstore <b>
    </p>
    
    `, // html body
  });

  logger.info("Email has been sent");

}