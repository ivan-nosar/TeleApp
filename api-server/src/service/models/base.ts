import { Sequelize, Model, DataTypes } from "sequelize";

export class BaseModel extends Model {
    public id!: number;

    public init(sequelize: Sequelize) {
        const fields: string[] = Object.keys(this)
            .filter(key => !((this as any)[key] instanceof Function));
        const initObject: any = {};
        fields.forEach(field => {
            if (field === "id") {
                initObject[field] = {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                };
            } else {
                
            }
        });


        BaseModel.init(initObject, {
            id: {
                type: DataTypes.INTEGER.UNSIGNED, // you can omit the `new` but this is discouraged
                autoIncrement: true,
                primaryKey: true,
            },
            ownerId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            name: {
                type: new DataTypes.STRING(128),
                allowNull: false,
            }
        }, {
            sequelize
        });
    }
}
