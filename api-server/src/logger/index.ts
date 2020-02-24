class Logger {
    public log(message: any) {
        console.log(message);
    }

    public warning(message: any) {
        console.warn(message);
    }

    public error(message: any) {
        console.error(message);
    }

    public info(message: any) {
        console.info(message);
    }
}

export const logger = new Logger();
