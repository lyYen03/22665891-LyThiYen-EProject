import * as chai from "chai";
import chaiHttp from "chai-http";
import App from "../app.js";
import dotenv from "dotenv";

dotenv.config();

// Gắn plugin chai-http
chai.use(chaiHttp);
const { expect } = chai;

describe("User Authentication", () => {
    let app;
    let requester;

    before(async() => {
        app = new App();
        await app.connectDB();
        app.start();

        // ✅ Tạo instance requester từ plugin chai-http
        requester = chaiHttp.request(app.app).keepOpen();
    });

    after(async() => {
        await app.authController.authService.deleteTestUsers();
        await app.disconnectDB();
        app.stop();
        await requester.close(); // đóng requester sau khi test
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