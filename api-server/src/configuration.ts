class Configuration {
    public readonly jwsPrivateKey: string;
    public readonly port: number;

    constructor() {
        this.port = 4939;
        this.jwsPrivateKey = "51ghjnsP6QZzphymzBkTKEUZZXZ5qK7EZE3myW0jZPshT601Gt";
    }
}

// ToDo: Load config with port, FFs and etc.
export const configuration = new Configuration();
