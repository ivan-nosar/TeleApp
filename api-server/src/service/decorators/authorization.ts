import { verify } from "jsonwebtoken";
import { configuration } from "../../configuration";
import { User } from "../database/entities";

export function AutnorizedByUser(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const { jwsPrivateKey } = configuration;
    descriptor.value = async function () {
        const args = arguments;
        const [req, res] = args;
        try {
            const authToken: string = req.headers["authorization"];
            if (!authToken) {
                res.status(401).send("No valid authorization header provided");
            }
            const verified = verify(authToken.replace("Bearer ", ""), jwsPrivateKey);
            const id = (verified as any).id;
            const user = await User.findOne(id);
            if (user) {
                return await method.apply(this, [user, ...args]);
            } else {
                res.status(410).send({
                    message: `User with id = ${id} doesn't exists`
                });
            }
        } catch (error) {
            if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
                res.status(401).send("Invalid authorization header provided");
            } else {
                res.status(500).send(error.toJson());
            }
        }
    };
    return descriptor;
}
