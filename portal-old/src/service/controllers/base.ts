import { Router } from "express";

export abstract class BaseController {
    router?: Router;
    path?: string;
}
