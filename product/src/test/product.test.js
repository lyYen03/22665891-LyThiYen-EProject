const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);

describe("Products", () => {
    let app;
    let authToken;

    before(async function() {
        this.timeout(30000);
        app = new App();

        console.log("🔹 Kết nối MongoDB và RabbitMQ...");
        await app.connectDB();
        await new Promise((r) => setTimeout(r, 2000));
        await app.setupMessageBroker();

        // Khởi động service product (tránh khởi động lại nhiều lần)
        if (!app.server) {
            app.start();
            await new Promise((r) => setTimeout(r, 2000));
        }

        console.log("Lấy JWT token từ AUTH service...");
        try {
            const authRes = await chai
                .request("http://localhost:3000")
                .post("/login")
                .send({
                    username: process.env.LOGIN_TEST_USER || "user1",
                    password: process.env.LOGIN_TEST_PASSWORD || "12345",
                });

            expect(authRes).to.have.status(200);
            authToken = authRes.body.token;
            console.log("Token from Auth:", authToken);
        } catch (err) {
            console.error("Lỗi khi lấy token từ Auth:", err.message);
            throw err;
        }
    });

    after(async function() {
        this.timeout(15000);
        console.log("🧹 Dọn dẹp kết nối MongoDB và dừng server...");
        try {
            await app.disconnectDB();
            if (app.server) {
                await new Promise((resolve) => {
                    app.server.close(() => {
                        console.log("Server stopped");
                        resolve();
                    });
                });
            }
        } catch (err) {
            console.warn("Lỗi khi dừng server:", err.message);
        }
    });

    describe("POST /products", () => {
        it("should create a new product", async function() {
            this.timeout(15000);

            const product = {
                name: "Product 1",
                description: "Description of Product 1",
                price: 10,
            };

            const res = await chai
                .request(app.app)
                .post("/api/products")
                .set("Authorization", `Bearer ${authToken}`)
                .send(product);

            expect(res).to.have.status(201);
            expect(res.body).to.have.property("_id");
            expect(res.body).to.have.property("name", product.name);
            expect(res.body).to.have.property("description", product.description);
            expect(res.body).to.have.property("price", product.price);
        });

        it("should return an error if name is missing", async function() {
            this.timeout(10000);

            const product = {
                description: "Description without name",
                price: 10.99,
            };

            const res = await chai
                .request(app.app)
                .post("/api/products")
                .set("Authorization", `Bearer ${authToken}`)
                .send(product);

            expect(res).to.have.status(400);
        });
    });
});