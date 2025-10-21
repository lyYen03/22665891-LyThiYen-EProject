const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config");

class App {
    constructor() {
        this.app = express();
        this.connectDB();
        this.setupRoutes();
        this.setupOrderConsumer();

    }

    async connectDB() {
        await mongoose.connect(config.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    }

    setupRoutes() {
        // ✅ Thêm endpoint để lấy thông tin hóa đơn theo ID
        this.app.get("/api/orders/:id", async(req, res) => {
            try {
                const order = await Order.findOne({ orderId: req.params.id }); // 🔹 tìm theo orderId
                if (!order)
                    return res.status(404).json({ message: "Order not found" });
                res.json(order);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
    }

    async disconnectDB() {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }

    async setupOrderConsumer() {
        console.log("Connecting to RabbitMQ...");

        const connectToRabbit = async(retryCount = 0) => {
            try {
                const connection = await amqp.connect(config.rabbitMQURI, { frameMax: 0 });
                console.log("Connected to RabbitMQ");

                const channel = await connection.createChannel();
                await channel.assertQueue("orders");

                channel.consume("orders", async(data) => {
                    console.log("Consuming ORDER service");
                    const { products, username, orderId } = JSON.parse(data.content);

                    const newOrder = new Order({
                        orderId,
                        products: products.map(p => ({
                            _id: p._id.toString(),
                            name: p.name,
                            price: p.price
                        })), // ✅ lưu cả tên và giá sản phẩm
                        user: username,
                        totalPrice: products.reduce((acc, p) => acc + (p.price || 0), 0),
                    });

                    await newOrder.save();
                    channel.ack(data);
                    console.log("Order saved to DB and ACK sent to ORDER queue");

                    const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
                    channel.sendToQueue(
                        "products",
                        Buffer.from(
                            JSON.stringify({ orderId, user, products: savedProducts, totalPrice })
                        )
                    );
                });
            } catch (err) {
                console.error(
                    `Failed to connect to RabbitMQ (attempt ${retryCount + 1}):`,
                    err.message
                );
                if (retryCount < 5) {
                    console.log("Retrying in 5 seconds...");
                    setTimeout(() => connectToRabbit(retryCount + 1), 5000);
                }
            }
        };

        // Chờ RabbitMQ khởi động xong (20 giây)
        setTimeout(() => connectToRabbit(), 20000);
    }





    start() {
        this.server = this.app.listen(config.port, () =>
            console.log(`Server started on port ${config.port}`)
        );
    }

    async stop() {
        await mongoose.disconnect();
        this.server.close();
        console.log("Server stopped");
    }
}

module.exports = App;