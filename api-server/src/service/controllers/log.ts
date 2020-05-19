import { BaseController } from "./base";
import { Request, Response } from "express";
import * as Entities from "../database/entities";
import * as Models from "../http-models";
import { Get, Controller, Delete, Patch, Post } from "../decorators/http-controllers";
import { ValidateBody, Safe } from "../decorators/http-validators";
import { fitToPropertiesOf } from "../../helpers/models";
import { Session } from "../database/entities/session";
import { User } from "../database/entities/user";
import { AutnorizedByUser } from "../decorators/authorization";

@Controller("/sessions")
export class LogController extends BaseController {

    @Get("/:userId/:appId/logs")
    @Safe
    @AutnorizedByUser
    async list(user: User, req: Request, res: Response) {
        const requestUserId = Number(req.params["userId"]);
        if (requestUserId !== user.id) {
            this.invalidAuthorization(res);
            return;
        }

        const appId = Number(req.params["appId"]);
        const app: Entities.App | undefined = await Entities.App.getRepository()
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

        // Parse query params and construct SQL query conditions
        // Query params: before, after, top, offset, sessionId
        let before = new Date(req.query.before);
        if (before.toString() === "Invalid Date") {
            before = new Date();
        }
        let after = new Date(req.query.after);
        if (after.toString() === "Invalid Date") {
            after = new Date();
            after.setDate(after.getDate() - 90);
        }

        let whereClause = "log.sessionId = session.id AND session.appId = :appId AND" +
            " log.timestamp BETWEEN :after AND :before";
        const whereParams: any = { appId, before, after };

        const sessionId: number | undefined = Number(req.query.sessionId);
        if (!isNaN(sessionId)) {
            whereClause = whereClause.replace("log.sessionId = session.id", "log.sessionId = :sessionId");
            whereParams["sessionId"] = sessionId;
        }

        let top = Number(req.query.top);
        let offset = Number(req.query.offset);
        if (isNaN(offset)) {
            offset = 0;
        } else if (isNaN(top)) {
            res.status(400).send("Parameter `top` must be provided along with `offset`");
        }
        if (isNaN(top)) {
            top = 0;
        }

        const query = Entities.Log.getRepository()
            .createQueryBuilder()
            .addFrom("session", "session")
            .where(whereClause, whereParams)
            .skip(offset);
        if (top !== 0) {
            query.take(top);
        }
        const logs = await query.getMany();
        res.send(logs);
    }

    @Get("/:userId/:appId/logs/count")
    @Safe
    @AutnorizedByUser
    async count(user: User, req: Request, res: Response) {
        const requestUserId = Number(req.params["userId"]);
        if (requestUserId !== user.id) {
            this.invalidAuthorization(res);
            return;
        }

        const appId = Number(req.params["appId"]);
        const app: Entities.App | undefined = await Entities.App.getRepository()
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

        // Parse query params and construct SQL query conditions
        // Query params: before, after, top, offset, sessionId
        let before = new Date(req.query.before);
        if (before.toString() === "Invalid Date") {
            before = new Date();
        }
        let after = new Date(req.query.after);
        if (after.toString() === "Invalid Date") {
            after = new Date();
            after.setDate(after.getDate() - 90);
        }

        let whereClause = "log.sessionId = session.id AND session.appId = :appId AND" +
            " log.timestamp BETWEEN :after AND :before";
        const whereParams: any = { appId, before, after };

        const sessionId: number | undefined = Number(req.query.sessionId);
        if (!isNaN(sessionId)) {
            whereClause = whereClause.replace("log.sessionId = session.id", "log.sessionId = :sessionId");
            whereParams["sessionId"] = sessionId;
        }

        let top = Number(req.query.top);
        let offset = Number(req.query.offset);
        if (isNaN(offset)) {
            offset = 0;
        } else if (isNaN(top)) {
            res.status(400).send("Parameter `top` must be provided along with `offset`");
        }
        if (isNaN(top)) {
            top = 0;
        }

        const query = Entities.Log.getRepository()
            .createQueryBuilder()
            .addFrom("session", "session")
            .where(whereClause, whereParams)
            .skip(offset);
        if (top !== 0) {
            query.take(top);
        }
        const count = await query.getCount();
        res.send({ count });
    }

    @Post("/:sessionId/logs")
    @ValidateBody(Models.Log, { strict: true, allowArray: true })
    @Safe
    async post(req: Request, res: Response) {
        const body = req.body;
        const secret = req.headers["app-secret"];

        if (!secret) {
            res.status(403).send("No app secret provided");
            return;
        }

        const sessionId = req.params["sessionId"];
        const session: any = await Entities.Session.getRepository()
            .createQueryBuilder()
            .addFrom("app", "app")
            .where("session.id = :sessionId AND session.appID = app.id AND app.secret = :secret", {
                sessionId,
                secret
            })
            .getOne();

        if (!session) {
            res.status(403).send("Invalid app secret or session identifier provided");
            return;
        }

        if (Array.isArray(body)) {
            // Save whole array
            const saved: any = [];
            for (let i = 0; i < body.length; i++) {
                const element = body[i];

                if (element.text.length > 2000) {
                    saved.push({ error: "Logs can not be longer than 2000 bytes" });
                    continue;
                }

                const log = await this.saveEntity(element, session);
                saved.push(log);
            }
            res.send(saved);
        } else {
            // Save only one entity
            if (body.text.length > 2000) {
                res.status(413).send("Logs can not be longer than 2000 bytes");
                return;
            }
            const log = await this.saveEntity(body, session);
            res.send(log);
        }
    }

    private async saveEntity(body: any, session: Session) {
        // Save only one entity
        const log = new Entities.Log();
        log.text = body.text;
        log.session = { } as Session;
        log.session.id = session.id;

        await log.save();
        fitToPropertiesOf(log, Models.Log);
        return log;
    }

    private invalidAuthorization(res: Response) {
        res.status(401).send("Invalid authorization data provided");
    }
}
