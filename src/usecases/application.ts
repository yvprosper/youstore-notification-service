import channelWrapper from "../consumer";


class Application {
    restServer: any;
    database: any;
    logger: any;
    config: any;
    shutdown: any;
    messenger: any


    constructor({ restServer, database, logger, config, messenger}: any) {
        this.restServer = restServer;
        this.database = database;
        this.logger = logger;
        this.config = config;
        this.messenger = messenger
    }

    async start() {

    // start listening for messages
    channelWrapper.waitForConnect().then(() => {
        console.log("Listening for messages");
      });

      await this.restServer.start();

        // if (this.database) {
        //     await this.database.connect();

        // }
        
        // this.logger.info('connecting to rabbitMq...')
        // await this.messenger.createChannel()
        
        // await this.restServer.start();
    }

}

export default Application;
