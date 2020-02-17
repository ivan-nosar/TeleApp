import { logger } from "./logger/logger";

function sleep(miliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

async function main() {
    while (true) {
        logger.log("Hello log");
        logger.info("Hello info");
        logger.warning("Hello warning");
        logger.error("Hello error");
        logger.log(`${Math.random()}`);
        await sleep(1000);
    }
}

main().then(result => {
    logger.log("Done");
});
