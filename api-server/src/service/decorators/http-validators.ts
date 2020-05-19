import { validate } from "validate-typescript";
import { Response } from "express";
import { BaseController } from "../controllers/base";
import { MethodDecorator } from "./interfaces";
import { HashTable } from "../../helpers/types";

export function ValidateBody(schema: Object, options?: ValidationOptions): MethodDecorator<BaseController> {
    const strict = options && options.strict;
    const allowArray = options && options.allowArray;
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;
        descriptor.value = async function () {
            const args = arguments;
            const body = args && args[0] && args[0].body;
            try {
                if (allowArray && Array.isArray(body)) {
                    // Validate as array
                    body.forEach((element: any) => {
                        if (strict) {
                            validate(schema, element);
                        }
                        validateExcessProperties(schema, element);
                    });
                } else {
                    // Validate as a single entity
                    if (strict) {
                        validate(schema, body);
                    }
                    validateExcessProperties(schema, body);
                }
            } catch (error) {
                const response: Response = args && args[1];
                response.status(400).send(error.toJson());
                return;
            }
            return await method.apply(this, args);
        };

        return descriptor;
    };
}

export function Safe(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = async function () {
        const args = arguments;
        try {
            return await method.apply(this, args);
        } catch (error) {
            const response: Response = args && args[1];
            response.status(500).send(error.toJson());
        }
    };
    return descriptor;
}

export interface ValidationOptions {
    strict?: boolean;
    allowArray?: boolean;
}

function validateExcessProperties(schema: HashTable, object: HashTable) {
    const schemaKeys = Object.getOwnPropertyNames(schema);
    const objectKeys = Object.getOwnPropertyNames(object);

    const diff = objectKeys.diff(schemaKeys);
    if (diff.length !== 0) {
        throw new Error(`Provided body contains unknown properties: ${diff}`);
    }
}
