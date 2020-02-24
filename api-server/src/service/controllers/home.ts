import { BaseController } from "./base-controller";
import { Request, Response } from "express";
import { logger } from "../../logger/index";

export class HomeController extends BaseController {

    readonly path = "/";

    private get(req: Request, res: Response) {
        logger.log(req.query);
        res.send("Get /");
    }

    private post(req: Request, res: Response) {
        logger.log(req.body);
        res.send("Post /");
    }
}
