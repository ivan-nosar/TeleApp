import { BaseController } from "./base";
import { Request, Response } from "express";
import * as Entities from "../database/entities";
import * as Models from "../http-models";
import { Get, Controller, Delete, Patch, Post } from "../decorators/http-controllers";
import { ValidateBody, Safe } from "../decorators/http-validators";
import { assignOwnPropertiesTo, updateOwnPropertiesWith, fitToPropertiesOf } from "../../helpers/models";
import { App } from "../database/entities/app";
import { User } from "../database/entities/user";
import { v4 as uuidv4 } from "uuid";
import { AutnorizedByUser } from "../decorators/authorization";

@Controller("/users/:userId/apps")
export class AppController extends BaseController {

    @Get("/:id")
    @Safe
    @AutnorizedByUser
    async get(user: User, req: Request, res: Response) {
        const requestUserId = Number(req.params["userId"]);
        if (requestUserId !== user.id) {
            this.invalidAuthorization(res);
            return;
        }

        const id = Number(req.params["id"]);
        const app: App | undefined = await Entities.App.getRepository()
            .createQueryBuilder()
            .where("app.id = :id and app.userId = :userId", {
                id,
                userId: requestUserId
            })
            .getOne();
        if (app) {
            fitToPropertiesOf(app, Models.App, ["secret"]);
            res.send(app);
        } else {
            this.notExists(res, id);
        }
    }

    @Get("/:id/secret")
    @Safe
    @AutnorizedByUser
    async getAppSecret(user: User, req: Request, res: Response) {
        const requestUserId = Number(req.params["userId"]);
        if (requestUserId !== user.id) {
            this.invalidAuthorization(res);
            return;
        }

        const id = Number(req.params["id"]);
        const app: App | undefined = await Entities.App.getRepository()
            .createQueryBuilder()
            .where("app.id = :id and app.userId = :userId", {
                id,
                userId: requestUserId
            })
            .getOne();
        if (app) {
            res.send({ secret: app.secret });
        } else {
            this.notExists(res, id);
        }
    }

    @Get()
    @Safe
    @AutnorizedByUser
    async list(user: User, req: Request, res: Response) {
        const requestUserId = Number(req.params["userId"]);
        if (requestUserId !== user.id) {
            this.invalidAuthorization(res);
            return;
        }

        const apps = (await Entities.App.getRepository()
            .createQueryBuilder()
            .where("app.userId = :userId", { userId: requestUserId })
            .getMany())
            .map((app: App) => {
                fitToPropertiesOf(app, Models.App, ["secret"]);
                return app;
            });
        res.send(apps);
    }

    @Post()
    @ValidateBody(Models.App)
    @Safe
    @AutnorizedByUser
    async post(user: User, req: Request, res: Response) {
        const requestUserId = Number(req.params["userId"]);
        if (requestUserId !== user.id) {
            this.invalidAuthorization(res);
            return;
        }

        const body = req.body;
        const existedApp: App | undefined = await Entities.App.getRepository()
            .createQueryBuilder()
            .where("app.name = :name and app.userId = :userId", {
                name: body.name,
                userId: requestUserId
            })
            .getOne();

        if (existedApp) {
            res.status(409).send({
                message: `Application with name "${existedApp.name}" already exists for user "${user.username}"`
            });
            return;
        }

        const app = new Entities.App();
        assignOwnPropertiesTo(body, app, ["id"]);
        app.secret = uuidv4();
        app.user = { } as User;
        app.user.id = requestUserId;

        await app.save();
        fitToPropertiesOf(app, Models.App, ["secret"]);
        res.send(app);
    }

    @Delete("/:id")
    @Safe
    @AutnorizedByUser
    async delete(user: User, req: Request, res: Response) {
        const requestUserId = Number(req.params["userId"]);
        if (requestUserId !== user.id) {
            this.invalidAuthorization(res);
            return;
        }

        const id = Number(req.params["id"]);
        const app: App | undefined = await Entities.App.getRepository()
            .createQueryBuilder()
            .where("app.id = :id and app.userId = :userId", {
                id,
                userId: requestUserId
            })
            .getOne();
        if (app) {
            await Entities.App.delete({ id });
            res.sendStatus(200);
        } else {
            this.notExists(res, id);
        }
    }

    @Patch("/:id")
    @ValidateBody(Models.App, { strict: false })
    @Safe
    @AutnorizedByUser
    async patch(user: User, req: Request, res: Response) {
        const requestUserId = Number(req.params["userId"]);
        if (requestUserId !== user.id) {
            this.invalidAuthorization(res);
            return;
        }

        const body = req.body;
        const existedApp: App | undefined = await Entities.App.getRepository()
            .createQueryBuilder()
            .where("app.name = :name and app.userId = :userId", {
                name: body.name,
                userId: requestUserId
            })
            .getOne();

        const id: number = Number(req.params["id"]);
        if (existedApp) {
            if (existedApp.id === id) {
                fitToPropertiesOf(existedApp, Models.App, ["secret"]);
                res.send(existedApp);
                return;
            }
            res.status(409).send({
                message: `Application with name "${existedApp.name}" already exists for user "${user.username}"`
            });
            return;
        }

        const app: App | undefined = await Entities.App.getRepository()
            .createQueryBuilder()
            .where("app.id = :id and app.userId = :userId", {
                id,
                userId: requestUserId
            })
            .getOne();

        if (app) {
            updateOwnPropertiesWith(app, body, ["id", "secret"]);
            await app.save();

            fitToPropertiesOf(app, Models.App, ["secret"]);
            res.send(app);
        } else {
            this.notExists(res, id);
        }
    }

    private notExists(res: Response, id: number) {
        res.status(410).send({
            message: `Application with id = ${id} doesn't exists`
        });
    }

    private invalidAuthorization(res: Response) {
        res.status(401).send("Invalid authorization data provided");
    }
}
