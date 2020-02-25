// Don't use `import` with Sequelize. Model's methods will be broken
const Sequelize = require("sequelize");

class DatabaseManager {

    private sequelize: any;

    constructor(dbConnectionInfo: DbConnectionInfo) {
        this.sequelize = new Sequelize(
            dbConnectionInfo.database,
            dbConnectionInfo.user,
            dbConnectionInfo.password,
            {
                dialect: "mysql",
                host: dbConnectionInfo.host,
                port: dbConnectionInfo.port,
                define: {
                    timestamps: false
                }
            }
        );
    }

    public async sync() {
        const User = this.sequelize.define("user", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            }
        });

        await this.sequelize.sync();
    }

    private defineModels() {

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
