import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    OneToMany
} from "typeorm";
import { App } from "./app";
import { Log } from "./log";
import { Metric } from "./metric";

@Entity()
export class Session extends BaseEntity {

    @PrimaryGeneratedColumn({ type: "bigint" })
    public id!: number;

    @CreateDateColumn()
    public timestamp!: Date;

    @Column()
    public deviceModelName!: string;

    @Column()
    public osVersionName!: string;

    // Name of country/region set on device
    @Column()
    public localeName!: string;

    @ManyToOne(type => App, app => app.sessions, {
        cascade: true
    })
    public app!: App;

    @OneToMany(type => Log, log => log.session)
    public logs!: Log[];

    @OneToMany(type => Metric, metric => metric.session)
    public metrics!: Log[];
}
