import { SinonSandbox, createSandbox } from "sinon";
import { encode, decode } from "../../../src/helpers/base64";
import * as should from "should";

describe("base64", () => {
    let sandbox: SinonSandbox;

    before(() => {
        sandbox = createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("#encode", () => {
        it("should properly encode empty string", () => {
            const raw = "";
            const actual = encode(raw);
            const expected = "";

            should.strictEqual(actual, expected);
        });

        it("should properly encode non-empty string", () => {
            const raw = "qwertyuiop[asdfghjkl;'zxcvbnm,./";
            const actual = encode(raw);
            const expected = "cXdlcnR5dWlvcFthc2RmZ2hqa2w7J3p4Y3Zibm0sLi8=";

            should.strictEqual(actual, expected);
        });
    });

    describe("#decode", () => {
        it("should properly decode empty string", () => {
            const raw = "";
            const actual = decode(raw);
            const expected = "";

            should.strictEqual(actual, expected);
        });

        it("should properly encode non-empty string", () => {
            const raw = "cXdlcnR5dWlvcFthc2RmZ2hqa2w7J3p4Y3Zibm0sLi8=";
            const actual = decode(raw);
            const expected = "qwertyuiop[asdfghjkl;'zxcvbnm,./";

            should.strictEqual(actual, expected);
        });
    });
});
