import "./helpers/extensions/index";
import { Service, ServiceParams } from "./service/service";

// ToDo: Load config with port, FFs and etc.
const serviceParams: ServiceParams = {
    port: 4939,
    jwsPrivateKey: "51ghjnsP6QZzphymzBkTKEUZZXZ5qK7EZE3myW0jZPshT601Gt",
};

const service: Service = new Service(serviceParams);
service.start();
