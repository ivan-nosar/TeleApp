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
export class MetricController extends BaseController {

    @Get("/:userId/:appId/metrics")
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

        let whereClause = "metric.sessionId = session.id AND session.appId = :appId AND" +
            " metric.timestamp BETWEEN :after AND :before";
        const whereParams: any = { appId, before, after };

        const sessionId: number | undefined = Number(req.query.sessionId);
        if (!isNaN(sessionId)) {
            whereClause = whereClause.replace("metric.sessionId = session.id", "metric.sessionId = :sessionId");
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

        const query = Entities.Metric.getRepository()
            .createQueryBuilder()
            .addFrom("session", "session")
            .where(whereClause, whereParams)
            .skip(offset);
        if (top !== 0) {
            query.take(top);
        }
        const metrics = await query.getMany();
        res.send(metrics);
    }

    @Get("/:userId/:appId/metrics/count")
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

        let whereClause = "metric.sessionId = session.id AND session.appId = :appId AND" +
            " metric.timestamp BETWEEN :after AND :before";
        const whereParams: any = { appId, before, after };

        const sessionId: number | undefined = Number(req.query.sessionId);
        if (!isNaN(sessionId)) {
            whereClause = whereClause.replace("metric.sessionId = session.id", "metric.sessionId = :sessionId");
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

        const query = Entities.Metric.getRepository()
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

    @Post("/:sessionId/metrics")
    @ValidateBody(Models.Metric, { strict: true, allowArray: true })
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

                const metric = await this.saveEntity(element, session);
                saved.push(metric);
            }
            res.send(saved);
        } else {
            // Save only one entity
            const metric = await this.saveEntity(body, session);
            res.send(metric);
        }
    }

    private async saveEntity(body: any, session: Session) {
        // Save only one entity
        const metric = new Entities.Metric();
        metric.content = body.content;
        metric.session = { } as Session;
        metric.session.id = session.id;

        await metric.save();
        fitToPropertiesOf(metric, Models.Metric);
        return metric;
    }

    private invalidAuthorization(res: Response) {
        res.status(401).send("Invalid authorization data provided");
    }
}
