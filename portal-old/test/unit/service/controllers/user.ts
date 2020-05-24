
import "../../../../src/helpers/extensions/index";

import { SinonSandbox, createSandbox } from "sinon";
import { UserController } from "../../../../src/service/controllers/user";
import * as should from "should";

describe("UserController", () => {
    let sandbox: SinonSandbox;
    let notExistsStub;

    const controllerUnderTest = new UserController();
    const existedId = 1;
    const nonExistedId = 2;

    const mockResponse = () => {
        const res = {};
        (res as any).status = sandbox.stub().returns(res);
        (res as any).json = sandbox.stub().returns(res);
        (res as any).send = sandbox.stub().returns(res);
        return res;
    };

    before(() => {
        sandbox = createSandbox();

        notExistsStub = sandbox.stub(controllerUnderTest, "notExists" as any);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("#get", () => {

        it.only("should return existed user", async () => {
            const request = {
                params: {
                    id: existedId
                }
            };
            const response = mockResponse();
            await controllerUnderTest.get(request as any, response as any);

            // should.strictEqual(actual, expected);
            console.log(response);
            //assert.notCalled(notExistsStub);
        });

        // it("should return 410 status code for non-existed user", () => {
        //     const raw = "";
        //     const actual = encode(raw);
        //     const expected = "";

        //     should.strictEqual(actual, expected);
        //     assert.calledOnce(notExistsStub);
        // });
    });

    describe("#list", () => {

    });

    describe("#post", () => {

    });

    describe("#patch", () => {
        //const notExistsStub = sandbox.stub(controllerUnderTest, "notExists" as any);
    });

    describe("#delete", () => {
        //const notExistsStub = sandbox.stub(controllerUnderTest, "notExists" as any);
    });
});
