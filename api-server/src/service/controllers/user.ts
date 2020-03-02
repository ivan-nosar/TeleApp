import { BaseController } from "./base";
import { Request, Response, Router } from "express";
import { User } from "../database/models/user";
import { Get, Controller, Delete, Patch, Post } from "../decorators/http-controllers";

// ToDo: Add checks for data integrity, logs, error handling, standard errors
@Controller("/users")
export class UserController extends BaseController {

    @Get("/:id")
    async get(req: Request, res: Response) {

        const id = req.params["id"];
        const user = await User.findOne(id);
        res.send(user);
    }

    @Delete("/:id")
    async delete(req: Request, res: Response) {
        const id: number = Number(req.params["id"]);

        await User.delete({ id });
        res.send("User deleted");
    }

    @Patch("/:id")
    async patch(req: Request, res: Response) {
        const body = req.body;
        const id = req.params["id"];
        const user = await User.findOne(id);

        if (user) {
            user.name = body.name;
            user.email = body.email;
            user.password = body.password;
            await user.save();

            // If some property not defined - it wouldn't be updated. 
            // But answer will not contains this property
            res.send(user);
        }
    }

    @Post()
    async post(req: Request, res: Response) {
        const body = req.body;
        const user = new User();
        user.name = body.name;
        user.email = body.email;
        user.password = body.password;
        await user.save();

        res.send(user);
    }
}
