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
        this.timeout(20000);
        app = new App();

        // Khởi tạo kết nối DB & RabbitMQ
        await Promise.all([app.connectDB(), app.setupMessageBroker()]);

        // Đợi Auth service khởi động ổn định (nếu chạy song song trong CI)
        await new Promise((resolve) => setTimeout(resolve, 4000));

        // 🔹 Gọi tới AUTH service thật để login và lấy JWT
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

        // Khởi động Product service
        app.start();
    });

    after(async function() {
        this.timeout(10000);
        await app.disconnectDB();
        app.stop();
    });

    describe("POST /products", () => {
        it("should create a new product", async function() {
            this.timeout(10000);
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