import { createConnection, Connection } from "typeorm";
import { App, Session, User, Log, Metric } from "./entities";

class DatabaseManager {
    private connectionInfo: DbConnectionInfo;
    // tslint:disable-next-line: variable-name
    private _connection?: Connection;

    constructor(dbConnectionInfo: DbConnectionInfo) {
        this.connectionInfo = dbConnectionInfo;
    }

    public async connect() {
        const entities = [
            User,
            App,
            Session,
            Log,
            Metric
        ];

        this._connection = await createConnection({
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

    public get connection(): Connection {
        if (!this._connection) {
            throw new Error("Connection to database is not initiated");
        }
        return this._connection;
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
