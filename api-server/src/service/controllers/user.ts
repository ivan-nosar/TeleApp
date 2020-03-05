import { BaseController } from "./base";
import { Request, Response } from "express";
import * as Entities from "../database/entities";
import * as Models from "../models";
import { Get, Controller, Delete, Patch, Post } from "../decorators/http-controllers";
import { ValidateBody, Safe } from "../decorators/http-validators";
import { assignOwnPropertiesTo, updateOwnPropertiesWith } from "../../helpers/models";

@Controller("/users")
export class UserController extends BaseController {

    @Get("/:id")
    @Safe
    async get(req: Request, res: Response) {

        const id = req.params["id"];
        const user = await Entities.User.findOne(id);
        if (user) {
            res.send(user);
        } else {
            this.notExists(res, id);
        }
    }

    @Delete("/:id")
    @Safe
    async delete(req: Request, res: Response) {
        const id: number = Number(req.params["id"]);

        if (await Entities.User.findOne(id)) {
            await Entities.User.delete({ id });
            res.sendStatus(200);
        } else {
            this.notExists(res, `${id}`);
        }
    }

    @Patch("/:id")
    @ValidateBody(Models.User, false)
    @Safe
    async patch(req: Request, res: Response) {
        const body = req.body;
        const id = req.params["id"];
        const user = await Entities.User.findOne(id);

        if (user) {
            updateOwnPropertiesWith(user, body, ["id"]);
            await user.save();

            res.send(user);
        } else {
            this.notExists(res, id);
        }
    }

    @Post()
    @ValidateBody(Models.User)
    @Safe
    async post(req: Request, res: Response) {
        const body = req.body;

        const user = new Entities.User();
        assignOwnPropertiesTo(body, user, ["id"]);

        await user.save();
        res.send(user);
    }

    private notExists(res: Response, id: string) {
        res.status(410).send({
            message: `Object with id = ${id} doesn't exists`
        });
    }
}
