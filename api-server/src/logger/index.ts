class Logger {
    public log(message: string) {
        console.log(message);
    }

    public warning(message: string) {
        console.warn(message);
    }

    public error(message: string) {
        console.error(message);
    }

    public info(message: string) {
        console.info(message);
    }
}

export const logger = new Logger();
