import { Router } from "express";
import * as express from "express";

export abstract class BaseController {
    readonly router: Router;
    abstract readonly path: string;

    constructor() {
        this.router = express.Router();

        this.initRoutes();
    }

    private initRoutes() {
        const supportedMethods = [
            "get", "delete", "patch", "post", "put"
        ];

        supportedMethods.forEach(method => {
            // tslint:disable-next-line: variable-name
            const _this = this as any;
            if (_this[method] && _this[method] instanceof Function) {
                _this.router[method]("/", _this[method]);
            }
        });
    }
}
