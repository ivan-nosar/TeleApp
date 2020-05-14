import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./user";

@Entity()
export class App extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public name!: string;

    @Column()
    public secret!: string;

    @ManyToOne(type => User, user => user.apps, {
        cascade: true
    })
    public user!: User;
}
