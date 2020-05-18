import { BaseController } from "./base";
import { Request, Response } from "express";
import * as Entities from "../database/entities";
import * as Models from "../http-models";
import { Get, Controller, Delete, Patch, Post } from "../decorators/http-controllers";
import { ValidateBody, Safe } from "../decorators/http-validators";
import { assignOwnPropertiesTo, updateOwnPropertiesWith, fitToPropertiesOf } from "../../helpers/models";
import { databaseManager } from "../database/database-manager";
import { App } from "../database/entities/app";
import { User } from "../database/entities/user";
import { v4 as uuidv4 } from "uuid";
import { AutnorizedByUser } from "../decorators/authorization";

@Controller("/sessions")
export class SessionController extends BaseController {

    @Get("/:userId/:appId")
    @Safe
    @AutnorizedByUser
    async list(user: User, req: Request, res: Response) {
        const requestUserId = Number(req.params["userId"]);
        if (requestUserId !== user.id) {
            this.invalidAuthorization(res);
            return;
        }

        const appId = Number(req.params["appId"]);
        const app: App | undefined = await Entities.App.getRepository()
            .createQueryBuilder()
            .where("app.id = :appId and app.userId = :userId", {
                appId,
                userId: requestUserId
            })
            .getOne();
        if (!app) {
            res.status(410).send({
                message: `Application with id = ${appId} doesn't exists`
            });
            return;
        }

        let before = new Date(req.query.before);
        if (before.toString() === "Invalid Date") {
            before = new Date();
        }
        let after = new Date(req.query.after);
        if (after.toString() === "Invalid Date") {
            after = new Date();
            after.setDate(after.getDate() - 90);
        }
        const sessions = (await Entities.Session.getRepository()
            .createQueryBuilder()
            .where("session.appId = :appId AND timestamp BETWEEN :after AND :before",
                { appId, before, after })
            .getMany());
        res.send(sessions);
    }

    @Post()
    @ValidateBody(Models.Session, true)
    @Safe
    async post(req: Request, res: Response) {
        const body = req.body;
        const secret = req.headers["app-secret"];

        if (!secret) {
            res.status(403).send("No app secret provided");
            return;
        }

        const app: App | undefined = await Entities.App.getRepository()
            .createQueryBuilder()
            .where("app.secret = :secret", {
                secret
            })
            .getOne();

        if (!app) {
            res.status(403).send("Invalid app secret provided");
            return;
        }

        const session = new Entities.Session();
        assignOwnPropertiesTo(body, session, ["id", "timestamp"]);
        session.app = { } as App;
        session.app.id = app.id;

        await session.save();
        fitToPropertiesOf(session, Models.Session);
        res.send(session);
    }

    private invalidAuthorization(res: Response) {
        res.status(401).send("Invalid authorization data provided");
    }
}
