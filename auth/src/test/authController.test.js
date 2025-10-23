import * as chai from "chai";
import chaiHttp from "chai-http";
import App from "../app.js";
import dotenv from "dotenv";

dotenv.config();

// Dùng default export của plugin
const { expect } = chai;
chai.use(chaiHttp);

// 🟢 Chai HTTP không có `chaiHttp.request()`
// nên dùng `chai.request()` sau khi .use()
describe("User Authentication", () => {
    let app;
    let requester;

    before(async() => {
        app = new App();
        await app.connectDB();
        app.start();

        // tạo instance requester sau khi server start
        requester = chai.request.agent(app.app);
    });

    after(async() => {
        await app.authController.authService.deleteTestUsers();
        await app.disconnectDB();
        app.stop();
        requester.close();
    });

    describe("POST /register", () => {
        it("should register a new user", async() => {
            const res = await requester
                .post("/register")
                .send({ username: "testuser", password: "password" });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("_id");
            expect(res.body).to.have.property("username", "testuser");
        });
    });
});