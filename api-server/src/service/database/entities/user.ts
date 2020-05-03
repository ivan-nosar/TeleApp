import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { App } from "./app";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public username!: string;

    @Column()
    public email!: string;

    @Column()
    public password!: string;

    @OneToMany(type => App, app => app.user)
    public apps!: App[];
}
