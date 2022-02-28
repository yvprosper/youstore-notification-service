import amqp from "amqp-connection-manager";
import { Channel, Message } from "amqplib";
import dotenv from "dotenv";
dotenv.config()

import { sendVerificationMail,sendPasswordResetMail } from "../infra/libs/mailer"; //mailer

import container from "../container";

const {
    logger: logging,
  } = container.cradle;

  const logger = {
    info: console.info,
    error: console.error,
  };

// Create a connection manager
const amqp_url = process.env.AMQP_URL || "";
logger.info("Connecting to RabbitMq...");
const connection = amqp.connect(amqp_url);


connection.on("connect", () => logger.info("RabbitMq is connected!"));
connection.on("disconnect", () => logger.info("RabbitMq disconnected. Retrying..."));


// Create a channel wrapper
const channelWrapper = connection.createChannel({
    json: true,
  setup(channel: Channel) {
        //Assert Queues
        channel.assertQueue(`verify_customer_email`, { durable: true })
        channel.assertQueue(`verify_merchant_email`, { durable: true })
        channel.assertQueue(`reset_customer_password`, { durable: true })
        channel.assertQueue(`reset_merchant_password`, { durable: true })


        //consume messages

        channel.consume(`verify_customer_email`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());
            
            let email = message.saveCustomer.email
            let link = message.link
            let name = message.saveCustomer.fullName
            try{
            await sendVerificationMail(email , link, name)
            console.log(message)

            } catch (error) {
                channel.nack(message)
            }
        }, {noAck: true})

        channel.consume(`verify_merchant_email`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());
            let email = message.saveMerchant.email
            let name = message.saveMerchant.fullName
            let link = message.link
            try{
            await sendVerificationMail(email , link, name)
            } catch (error) {
                channel.nack(message)
            }
        }, {noAck: true})

        channel.consume(`reset_customer_password`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());
            let email = message.customer.email
            let link = message.link
            try{
            await sendPasswordResetMail(email , link)
            } catch (error) {
                channel.nack(message)
            }
        }, {noAck: true})

        channel.consume(`reset_merchant_password`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());
            let email = message.merchant.email
            let link = message.link
            try{
            await sendPasswordResetMail(email , link)
            } catch (error) {
                channel.nack(message)
            }
        }, {noAck: true})
    }
})

channelWrapper.on("close", () => {
    logger.info("RabbitMq channel has closed");
});


export default channelWrapper