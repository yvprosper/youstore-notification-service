import { asValue, Lifetime, asClass,asFunction, InjectionMode, createContainer} from "awilix"
import {scopePerRequest} from "awilix-express"
import database from "./infra/database/mongoose"
import router from "./interface/http/router/routes"
import restServer from "./interface/http/server"
import Logger from "./interface/http/utils/logger"
import config from "config"
import Messenger from "./infra/libs/rabbitmq"



const container = createContainer({
    injectionMode: InjectionMode.PROXY
})


container.register({
    containerMiddleware: asValue(scopePerRequest(container)),
    database: asClass(database),
    restServer: asClass(restServer),
    router: asFunction(router),
    logger: asValue(Logger),
    config: asValue(config),
    messenger: asClass(Messenger, {lifetime: Lifetime.SINGLETON})
    

})







// load all repositories
  container.loadModules(
    [
      [
        "src/infra/repository/*.ts",
        {
          lifetime: Lifetime.SCOPED,
          register: asClass,
        },
      ],
    ],
    {
      // we want all files to be registered in camelCase.
      formatName: "camelCase",
      resolverOptions: {},
      //cwd: __dirname,
    }
  );


//load all usecases
container.loadModules(
    [
      [
        "./src/usecases/*/*.ts",
        {
          lifetime: Lifetime.SCOPED,
          register: asClass,
        },
      ],
    ],
    {
      // we want all files to be registered in camelCase.
      formatName: "camelCase",
      resolverOptions: {},
      //cwd: __dirname
    }
  );


  
export default container