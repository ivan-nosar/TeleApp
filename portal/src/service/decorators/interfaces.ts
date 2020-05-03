/*
Documentation about TypeScript decorators: https://www.typescriptlang.org/docs/handbook/decorators.html

There is a well defined order to how decorators applied to various declarations inside of a class are applied:

1. Parameter Decorators, followed by Method, Accessor, or Property Decorators are applied for each instance member.
2. Parameter Decorators, followed by Method, Accessor, or Property Decorators are applied for each static member.
3. Parameter Decorators are applied for the constructor.
4. Class Decorators are applied for the class
*/

export type Class = {
    new (...args: any[]): Object
};

export type MethodDecorator<T> = (
    target: T,
    propertyName: string,
    descriptor: PropertyDescriptor
) => void;
