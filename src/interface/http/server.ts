import express from "express";
import http from "http";



class Server {
    config: any;
    router: any;
    logger: any;
    express: any;
    
    constructor({ config, router, logger }: any) {
        this.config = config;
        this.logger = logger;
        this.express = express();
        this.express.disable("x-powered-by");
        this.express.use(router);
        this.express.app = http.createServer(this.express);
       
      }
    
      start() {
        return new Promise((resolve) => {
          const server = this.express.app.listen(this.config.get("httpPort"), () => {
            const { port } = server.address();
            this.logger.info(`[pid ${process.pid}] REST server Listening on port ${port}`);
            return resolve(this.express.server);
          });
        });
      }
}

export default Server