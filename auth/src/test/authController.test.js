import chai from "chai";
import chaiHttp from "chai-http";
import App from "../app.js";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình Chai và plugin HTTP
chai.use(chaiHttp);
const { expect, request } = chai;

describe("User Authentication", () => {
    let app;

    before(async() => {
        app = new App();
        await app.connectDB();
        app.start();
    });

    after(async() => {
        await app.authController.authService.deleteTestUsers();
        await app.disconnectDB();
        app.stop();
    });

    describe("POST /register", () => {
        it("should register a new user", async() => {
            const res = await request(app.app)
                .post("/register")
                .send({ username: "testuser", password: "password" });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("_id");
            expect(res.body).to.have.property("username", "testuser");
        });
    });
});