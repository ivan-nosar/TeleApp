import { BaseController } from "./base";
import { Request, Response } from "express";
import * as Entities from "../database/entities";
import * as Models from "../models";
import { Get, Controller, Delete, Patch, Post } from "../decorators/http-controllers";
import { ValidateBody, Safe } from "../decorators/http-validators";
import { assignOwnPropertiesTo, updateOwnPropertiesWith } from "../../helpers/models";
import { databaseManager } from "../database/database-manager";
import { App } from "../database/entities/app";
import { User } from "../database/entities/user";

@Controller("/users/:userId/apps")
export class AppController extends BaseController {

    @Get("/:id")
    @Safe
    async get(req: Request, res: Response) {

        const id = req.params["id"];
        const app = await Entities.App.findOne(id);
        if (app) {
            res.send(app);
        } else {
            this.notExists(res, id);
        }
    }

    @Get()
    @Safe
    async list(req: Request, res: Response) {

        const userId = req.params["userId"];
        const apps = await databaseManager.connection
            .createQueryBuilder()
            .select("app")
            .from(App, "app")
            .where("app.userId = :userId", { userId })
            .getMany();
        res.send(apps);
    }

    @Post()
    @ValidateBody(Models.App)
    @Safe
    async post(req: Request, res: Response) {
        const userId = Number(req.params["userId"]);
        const user = await Entities.User.findOne(userId);
        if (!user) {
            res.status(409).send({
                message: `User with id = ${userId} doesn't exists`
            });
            return;
        }

        const body = req.body;
        const existedApp: App | undefined = await Entities.App.getRepository()
            .createQueryBuilder()
            .where("app.name = :name and app.userId = :userId", {
                name: body.name,
                userId
            })
            .getOne();

        if (existedApp) {
            res.status(409).send({
                message: `Invalid application name "${existedApp.name}" for user ${user.username}`
            });
            return;
        }

        const app = new Entities.App();
        assignOwnPropertiesTo(body, app, ["id"]);
        app.user = { } as User;
        app.user.id = userId;

        await app.save();
        res.send(app);
    }

    private notExists(res: Response, id: string) {
        res.status(410).send({
            message: `Application with id = ${id} doesn't exists`
        });
    }
}
