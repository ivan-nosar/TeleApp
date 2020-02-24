import * as bodyParser from "body-parser";
import * as express from "express";
import { Application } from "express";
import { HomeController } from "./controllers/home";
import { BaseController } from "./controllers/base-controller";
import { logger } from "../logger/index";

export class Service {
    public readonly app: Application;
    public readonly port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;

        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandlers();
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the http://localhost:${this.port}`);
        });
    }

    private initializeMiddleware() {
        const commonMiddlewares = [
            bodyParser.json(),
            bodyParser.urlencoded({ extended: true }),
            (req: any, _: any, next: any) => {
                logger.log(`Request logged: ${req.method} ${req.path}`);
                next();
            }
        ];

        commonMiddlewares.forEach(middleware => {
            this.app.use(middleware);
        });
    }

    private initializeRoutes() {
        const controllers: BaseController[] = [
            new HomeController(),
        ];

        controllers.forEach(controller => {
            this.app.use(controller.path, controller.router);
        });
    }

    private initializeErrorHandlers() {
        this.app.use((req: any, res: any, _: any) => {
            res.status(404).send(`Unresolved route: ${req.method} ${req.path}`);
        });
    }
}
