import * as bodyParser from "body-parser";
import * as express from "express";
import { Application, Router, Request, Response } from "express";
import {
    AppController,
    AuthController,
    BaseController,
    UserController,
    SessionController
} from "./controllers";
import { logger } from "../logger";
import { databaseManager } from "./database/database-manager";
import { configuration } from "../configuration";

export class Service {
    private readonly app: Application;
    private readonly port: number;

    constructor() {
        this.app = express();
        const { port } = configuration;
        this.port = port;

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
            new AuthController(),
            new UserController(),
            new AppController(),
            new SessionController(),
        ];

        controllers.forEach(controller => {
            this.app.use("/", controller.router!);
        });
    }

    private initializeErrorHandlers() {
        this.app.use((req: any, res: any, _: any) => {
            res.status(404).send(`Unresolved route: ${req.method} ${req.path}`);
        });
    }
}
