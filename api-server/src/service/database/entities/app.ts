import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user";
import { Session } from "./session";

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

    @OneToMany(type => Session, session => session.app)
    public sessions!: Session[];
}
