const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    platform: { type: String, required: true },
    content: { type: String, required: true }
});

module.exports = mongoose.model('Task', taskSchema);