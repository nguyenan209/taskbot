const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Đã kết nối tới MongoDB');
    } catch (err) {
        console.error('Lỗi kết nối MongoDB:', err);
        process.exit(1); // Thoát nếu kết nối thất bại
    }
};

module.exports = connectDB;