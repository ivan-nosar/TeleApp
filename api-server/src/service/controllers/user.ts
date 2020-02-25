import { BaseController } from "./base";
import { Request, Response } from "express";
// import { Sequelize, INTEGER, STRING, Model } from "sequelize";
const Sequelize = require("sequelize");

export class UserController extends BaseController {

    readonly path = "/users";

    private post(req: Request, res: Response) {
        res.send("New user created");
    }

    private delete(req: Request, res: Response) {
        res.send("User deleted");
    }

    private async get(req: Request, res: Response) {

        // await User.create({
        //     name: "Tom",
        //     age: 39
        // });

        res.send("Get user");
    }
}
