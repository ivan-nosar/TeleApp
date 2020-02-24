import { Service } from "./service/service";

// ToDo: Load config with port, FFs and etc.

const service: Service = new Service(4939);
service.start();
