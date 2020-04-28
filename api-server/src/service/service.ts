import * as bodyParser from "body-parser";
import * as express from "express";
import { Application, Router, Request, Response } from "express";
import * as Entities from "./database/entities";
import { AppController, BaseController, UserController } from "./controllers";
import { logger } from "../logger";
import { databaseManager } from "./database/database-manager";
import { decode, sign, verify, SignOptions } from "jsonwebtoken";

export class Service {
    private readonly app: Application;
    private readonly port: number;
    private readonly jwsPrivateKey: string;

    constructor(serviceParams: ServiceParams) {
        this.app = express();
        this.port = serviceParams.port;
        this.jwsPrivateKey = serviceParams.jwsPrivateKey;

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
            new AppController(),
        ];

        controllers.forEach(controller => {
            this.app.use("/", controller.router!);
        });

        const testPath = "/test";
        const testRouter = Router();
        testRouter.post("/", async (req: Request, res: Response) => {
            const body = req.body;
            if (typeof body.username === "string" &&
                typeof body.password === "string") {

                try {
                    const existedUser = await Entities.User.findOne({
                        username: body.username,
                        password: body.password
                    });

                    if (!existedUser) {
                        res.status(404).send({
                            message: "User with specified username and password does not exists",
                        });
                        return;
                    }

                    const signOptions: SignOptions = {
                        expiresIn: "1d"
                    };
                    const token = sign(
                        { id: existedUser.id },
                        this.jwsPrivateKey,
                        signOptions
                    );

                    const verified = verify(token, this.jwsPrivateKey);
                    console.log(verified);
                    res.send({ token });
                } catch (error) {
                    console.log(error);
                }
            } else {
                res.status(400).send({
                    message: "Incorrect request payload. Username or Passord missed or have incorrect format",
                });
            }
        });
        this.app.use(testPath, testRouter);
    }

    private initializeErrorHandlers() {
        this.app.use((req: any, res: any, _: any) => {
            res.status(404).send(`Unresolved route: ${req.method} ${req.path}`);
        });
    }
}

export interface ServiceParams {
    port: number;
    jwsPrivateKey: string;
}
