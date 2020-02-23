import { logger } from "../logger";
import { sleep } from "../helpers/index";

export class Service {
    constructor() {
        logger.log("ctor");
    }

    public async start() {
        logger.log("Start");
        await sleep(10000);
        logger.log("End");
    }
}
