import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./user";
import { App } from "./app";

@Entity()
export class Session extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id!: number;

    @CreateDateColumn()
    public timestamp!: Date;

    @Column()
    public deviceModelName!: string;

    @Column()
    public deviceId!: string;

    @Column()
    public osVersionName!: string;

    // Name of country/region set on device
    @Column()
    public localeName!: string;

    @ManyToOne(type => App, app => app.sessions, {
        cascade: true
    })
    public app!: App;
}
