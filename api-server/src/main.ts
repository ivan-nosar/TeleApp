import "reflect-metadata";
import { Service, ServiceParams } from "./service/service";

// ToDo: Load config with port, FFs and etc.
const serviceParams: ServiceParams = {
    port: 4939
};

const service: Service = new Service(serviceParams);
service.start();
