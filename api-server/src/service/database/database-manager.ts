import { createConnection, EntitySchema } from "typeorm";
import { User } from "./models/user";

class DatabaseManager {
    private connectionInfo: DbConnectionInfo;

    constructor(dbConnectionInfo: DbConnectionInfo) {
        this.connectionInfo = dbConnectionInfo;
    }

    public async connect() {
        const entities = [
            User
        ];

        await createConnection({
            type: "mysql",
            host: this.connectionInfo.host,
            port: this.connectionInfo.port,
            username: this.connectionInfo.user,
            password: this.connectionInfo.password,
            database: this.connectionInfo.database,
            entities,
            synchronize: true,
            logging: false
        });
    }
}

interface DbConnectionInfo {
    host: string;
    port: number;
    user: string;
    database: string;
    password: string;
}

// ToDo: Load config with port, passwords (from ENV) and etc.
const dbConnectionInfo: DbConnectionInfo = {
    host: "localhost",
    port: 3306,
    user: "root",
    database: "tele_app",
    password: "1111"
};

export const databaseManager = new DatabaseManager(dbConnectionInfo);
