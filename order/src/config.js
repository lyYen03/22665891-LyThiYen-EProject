require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://mongodb:27017/order_db',
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://guest:guest@rabbitmq:5672',
    rabbitMQQueue: 'orders',
    port: process.env.PORT || 3002
};