import { Router } from "express";
import { BaseController } from "../controllers/base";
import { MethodDecorator, Class } from "./interfaces";

const supportedMethods = [
    "get",
    "delete",
    "patch",
    "post",
    "put"
] as const;

type SupportedHttpMethod = typeof supportedMethods[number];

export function Controller(path: string) {
    return function (target: Function) {
        const mutable = target.prototype;

        Object.assign(mutable, {
            path,
            router: Router()
        });

        supportedMethods.forEach((method: SupportedHttpMethod) => {
            if (mutable[`$__${method}__`]) {
                registerRoute(
                    mutable,
                    mutable[`$__${method}__`],
                    method,
                    mutable[`$__${method}Route__`]
                );

                delete mutable[`$__${method}__`];
                delete mutable[`$__${method}Route__`];
            }
        });
    };
}

export function Get(path?: string): MethodDecorator<BaseController> {

    return (
        target: any,
        propertyName: string,
        _: PropertyDescriptor
    ) => registerHandlerMethodName(
        target,
        propertyName,
        "get",
        path
    );
}

export function Delete(path?: string): MethodDecorator<BaseController> {

    return (
        target: any,
        propertyName: string,
        _: PropertyDescriptor
    ) => registerHandlerMethodName(
        target,
        propertyName,
        "delete",
        path
    );
}

export function Patch(path?: string): MethodDecorator<BaseController> {

    return (
        target: any,
        propertyName: string,
        _: PropertyDescriptor
    ) => registerHandlerMethodName(
        target,
        propertyName,
        "patch",
        path
    );
}

export function Post(path?: string): MethodDecorator<BaseController> {

    return (
        target: any,
        propertyName: string,
        _: PropertyDescriptor
    ) => registerHandlerMethodName(
        target,
        propertyName,
        "post",
        path
    );
}

export function Put(path?: string): MethodDecorator<BaseController> {

    return (
        target: any,
        propertyName: string,
        _: PropertyDescriptor
    ) => registerHandlerMethodName(
        target,
        propertyName,
        "put",
        path
    );
}

function registerHandlerMethodName(
    target: any,
    handlerMethodName: string,
    method: SupportedHttpMethod,
    path?: string
) {
    const handlerMethodNameKey = `$__${method}__`;
    const handlerMethodRouteKey = `$__${method}Route__`;
    const assignableObject: any = {};
    assignableObject[handlerMethodNameKey] = handlerMethodName;
    assignableObject[handlerMethodRouteKey] = path;

    Object.assign(target, assignableObject);
}

function registerRoute(
    controller: any,
    handlerMethodName: string,
    method: SupportedHttpMethod,
    path?: string
) {
    if (
        controller[handlerMethodName] &&
        controller[handlerMethodName] instanceof Function
    ) {
        const route = path || "/";
        try {
            controller.router[method](route, controller[handlerMethodName]);
        } catch (error) {
            console.log(error);
        }
    }
}
