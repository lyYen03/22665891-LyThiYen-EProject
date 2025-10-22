import express from "express";
import mongoose from "mongoose";
import config from "./config.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import AuthController from "./controllers/authController.js";

class App {
    constructor() {
        this.app = express();
        this.authController = new AuthController();
        this.connectDB();
        this.setMiddlewares();
        this.setRoutes();
    }

    async connectDB() {
        await mongoose.connect(config.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    }

    async disconnectDB() {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }

    setMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
    }

    setRoutes() {
        this.app.post("/login", (req, res) => this.authController.login(req, res));
        this.app.post("/register", (req, res) => this.authController.register(req, res));
        this.app.get("/dashboard", authMiddleware, (req, res) =>
            res.json({ message: "Welcome to dashboard" })
        );
    }

    start() {
        this.server = this.app.listen(3000, () =>
            console.log("Server started on port 3000")
        );
    }

    async stop() {
        await mongoose.disconnect();
        this.server.close();
        console.log("Server stopped");
    }
}

export default App;