import * as bodyParser from "body-parser";
import * as express from "express";
import { Application } from "express";
import { UserController } from "./controllers/user";
import { BaseController } from "./controllers/base";
import { logger } from "../logger";
import { databaseManager } from "./database/database-manager";

export class Service {
    private readonly app: Application;
    private readonly port: number;

    constructor(serviceParams: ServiceParams) {
        this.app = express();
        this.port = serviceParams.port;

        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandlers();
    }

    public async start() {
        try {
            await databaseManager.connect();
            this.app.listen(this.port, () => {
                logger.log(`App listening on the http://localhost:${this.port}`);
            });
        } catch (error) {
            logger.error("Unexpected error: Starting server");
            logger.error(error);
        }
    }

    private initializeMiddleware() {
        const commonMiddlewares = [
            bodyParser.json(),
            bodyParser.urlencoded({ extended: true }),
            (req: any, _: any, next: any) => {
                logger.log(`Request: ${req.method} ${req.path}`);
                next();
            }
        ];

        commonMiddlewares.forEach(middleware => {
            this.app.use(middleware);
        });
    }

    private initializeRoutes() {
        const controllers: BaseController[] = [
            new UserController(),
        ];

        controllers.forEach(controller => {
            this.app.use(controller.path!, controller.router!);
        });
    }

    private initializeErrorHandlers() {
        this.app.use((req: any, res: any, _: any) => {
            res.status(404).send(`Unresolved route: ${req.method} ${req.path}`);
        });
    }
}

export interface ServiceParams {
    port: number;
}
