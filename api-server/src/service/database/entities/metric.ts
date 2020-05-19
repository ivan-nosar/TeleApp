import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { Session } from ".";

@Entity()
export class Metric extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id!: number;

    @CreateDateColumn()
    public timestamp!: Date;

    @Column("json")
    public content!: object;

    @ManyToOne(type => Session, session => session.metrics, {
        cascade: true
    })
    public session!: Session;
}
