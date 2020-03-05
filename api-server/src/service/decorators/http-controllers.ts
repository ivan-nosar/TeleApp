import { Router } from "express";
import { BaseController } from "../controllers/base";
import { MethodDecorator } from "./interfaces";

const supportedMethods = [
    "get",
    "delete",
    "patch",
    "post",
    "put"
] as const;

const handlerMethodNameTemplate: string = "&__{0}__%{1}%__" as const;
const handlerMethodRouteTemplate: string = "&__{0}Route__%{1}%__" as const;

type SupportedHttpMethod = typeof supportedMethods[number];

export function Controller(path: string) {
    return function (target: Function) {
        const mutable = target.prototype;

        Object.assign(mutable, {
            path,
            router: Router()
        });

        supportedMethods.forEach((method: SupportedHttpMethod) => {
            const pattern = RegExp(handlerMethodNameTemplate.format(method, "(.*)"));
            const methodRelatedKeys = Object
                .keys(mutable)
                .filter(key => key.search(pattern) !== -1)
                .map(key => {
                    const matches = key.match(pattern);
                    if (matches && matches.length > 1) {
                        return {
                            name: key,
                            route: handlerMethodRouteTemplate.format(method, matches[1])
                        };
                    }
                    return {};
                });

            methodRelatedKeys.forEach(keys => {
                if (mutable[keys.name!]) {
                    registerRoute(
                        mutable,
                        mutable[keys.name!],
                        method,
                        mutable[keys.route!]
                    );

                    delete mutable[keys.name!];
                    delete mutable[keys.route!];
                }
            });
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
    const handlerMethodNameKey =
        handlerMethodNameTemplate.format(method, path || "");
    const handlerMethodRouteKey =
        handlerMethodRouteTemplate.format(method, path || "");
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
        // We have to `bind` method because Express calls router methods losing their context
        controller.router[method](route, controller[handlerMethodName].bind(controller));
    }
}
