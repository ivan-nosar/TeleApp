import { BaseController } from "./base";
import { Request, Response } from "express";
import * as Entities from "../database/entities";
import * as Models from "../http-models";
import { Get, Controller, Delete, Patch, Post } from "../decorators/http-controllers";
import { ValidateBody, Safe } from "../decorators/http-validators";
import { assignOwnPropertiesTo, updateOwnPropertiesWith, fitToPropertiesOf } from "../../helpers/models";
import { SignOptions, sign } from "jsonwebtoken";
import { configuration } from "../../configuration";

@Controller("/auth")
export class AuthController extends BaseController {

    @Post()
    @ValidateBody(Models.AuthRequest)
    @Safe
    async post(req: Request, res: Response) {
        const body = req.body;
        if (typeof body.username === "string" &&
            typeof body.password === "string") {

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
            const { jwsPrivateKey } = configuration;
            const token = sign(
                { id: existedUser.id },
                jwsPrivateKey,
                signOptions
            );

            res.send({ token });
        } else {
            res.status(400).send({
                message: "Incorrect request payload. Username or Password missed or have incorrect format",
            });
        }
    }
}
