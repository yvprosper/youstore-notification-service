import amqp from "amqp-connection-manager";
import { Channel, Message } from "amqplib";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config()

import { sendVerificationMail,sendPasswordResetMail, sendOrderCompleteMail, sendOrderFailedMail, sendAdminSignUpMail } from "../infra/libs/mailer"; //mailer

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
  async setup (channel: Channel) {

        //Assert Exchange and Bind Queue
        channel.assertExchange('orderEvents', 'topic')
        channel.bindQueue('send_order_success', 'orderEvents', 'orders.status.completed')
        channel.bindQueue('send_new_sales_notification', 'orderEvents', 'orders.status.completed')
        channel.bindQueue('send_order_failed', 'orderEvents', 'orders.status.failed')

        //Assert Queues
        channel.assertQueue(`verify_customer_email`, { durable: true })
        channel.assertQueue(`verify_merchant_email`, { durable: true })
        channel.assertQueue(`reset_customer_password`, { durable: true })
        channel.assertQueue(`reset_merchant_password`, { durable: true })
        channel.assertQueue(`reset_admin_password`, { durable: true })
        channel.assertQueue(`new_admin_notification`, { durable: true })
        channel.assertQueue('send_order_success', { durable: true })
        channel.assertQueue(`send_order_failed`, { durable: true })
        channel.assertQueue(`send_new_sales_notification`, { durable: true })


        //consume messages

        channel.consume(`verify_customer_email`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());
            
            let email = message.saveCustomer.email
            let link = message.link
            let name = message.saveCustomer.firstName
        try {
            await sendVerificationMail(email , link, name)
        } catch (error) {
            throw error
        }

        }, {noAck: true})

        channel.consume(`verify_merchant_email`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());
            let email = message.saveMerchant.email
            let name = message.saveMerchant.firstName
            let link = message.link
         try{
            await sendVerificationMail(email , link, name)
            } catch (error) {
                throw error
            }
        }, {noAck: true})

        channel.consume(`new_admin_notification`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());
            console.log(message)
            let email = message.email
            let link = `youstore-staging.netlify.app/admin/create-admin`
          try{
            await sendAdminSignUpMail(email , link)
            } catch (error) {
                throw error
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
                throw error
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
                throw error
            }
        }, {noAck: true})

        channel.consume(`reset_admin_password`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());
            let email = message.admin.email
            let link = message.link
            try{
            await sendPasswordResetMail(email , link)
            } catch (error) {
                throw error
            }
        }, {noAck: true})

        channel.consume(`send_order_success`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());

            const routingKey = msg?.fields.routingKey
            if (routingKey !== 'orders.status.completed') return

            let email = message.order.customerEmail
            let products= message.order.products.map((item: any)=> {
                return {name: item.name, quantity: item.quantity, price: item.price, merchantId: item.merchantId}
            })
            let orderId = message.order.orderId

            try{
            await sendOrderCompleteMail(email , products, orderId)
            } catch (error) {
                throw error
            }
        }, {noAck: true})

        channel.consume(`send_order_failed`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());

            const routingKey = msg?.fields.routingKey
            if (routingKey !== 'orders.status.failed') return

            let email = message.order.customerEmail
            let products= message.order.products.map((item: any)=> {
                return {name: item.name, quantity: item.quantity, price: item.price}
            })
            let orderId = message.order.orderId
            try{
            await sendOrderFailedMail(email , products, orderId)
            } catch (error) {
                throw error
            }
        }, {noAck: true})

        channel.consume(`send_new_sales_notification`, async (messageBuffer: Message | null) => {
            const msg = messageBuffer;
            const message = JSON.parse(msg!.content.toString());

            const routingKey = msg?.fields.routingKey
            if (routingKey !== 'orders.status.completed') return

            let orderId = message.order.orderId
            message.order.products.map((item: any)=> {
                let merchantId = item.merchantId.toString()

                const getMail = async ()=> {
                    try {
                        const response = await axios.get(`https://youstore-users.herokuapp.com/v1/merchants/one/${merchantId}`, {
                          headers: {
                            Accept: "application/json",
                            "User-Agent": "axios 0.21.1",
                            timeout: 200000000000
                          }
                        });
                    
                       const email = response.data.data.email
                       let products: any = {name: item.name, quantity: item.quantity, price: item.price}
                        await sendOrderCompleteMail(email , products, orderId)
                        console.log(`despatched messages`)
                      } catch (err) {
                        console.log(err);
                      }
                }
                getMail()
                
            })

        }, {noAck: true})
    }
})

channelWrapper.on("close", () => {
    logger.info("RabbitMq channel has closed");
});


export default channelWrapper