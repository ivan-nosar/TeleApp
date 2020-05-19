import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { Session } from ".";

@Entity()
export class Log extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id!: number;

    @CreateDateColumn()
    public timestamp!: Date;

    @Column("varchar", { length: 2000 })
    public text!: string;

    @ManyToOne(type => Session, session => session.logs, {
        cascade: true
    })
    public session!: Session;
}
