const Task = require('../models/Task');

const taskHandlers = {
    // Xem danh sách task
    async listTasks(msg, bot) {
        try {
            const tasks = await Task.find();
            if (tasks.length === 0) {
                bot.sendMessage(msg.chat.id, `🎉 Không có task nào cần làm!`);
            } else {
                const taskList = tasks.map((task, index) => `📌 *${index + 1}. ${task.content}*`).join("\n");
                bot.sendMessage(msg.chat.id, `📝 Danh sách task còn lại:\n${taskList}`, { parse_mode: 'Markdown' });
            }
        } catch (err) {
            console.error(err);
            bot.sendMessage(msg.chat.id, '❌ Có lỗi xảy ra khi lấy danh sách task!');
        }
    },

    // Thêm task mới
    async addTask(msg, platform, content, bot) {
        try {
            const lastTask = await Task.findOne().sort({ id: -1 });
            const newId = lastTask ? lastTask.id + 1 : 1;
            
            const newTask = new Task({ id: newId, platform, content });
            await newTask.save();
            
            bot.sendMessage(msg.chat.id, `✅ Đã thêm task [${platform}]: *${content}* (ID: ${newId})`, { parse_mode: 'Markdown' });
        } catch (err) {
            console.error(err);
            bot.sendMessage(msg.chat.id, '❌ Có lỗi xảy ra khi thêm task!');
        }
    },

    // Xóa task theo ID
    async deleteTaskById(msg, taskId, bot) {
        try {
            const task = await Task.findOneAndDelete({ id: taskId });
            if (task) {
                bot.sendMessage(msg.chat.id, `✅ Đã xoá task [${task.platform}]: *${task.content}* (ID: ${taskId})`, { parse_mode: 'Markdown' });
            } else {
                bot.sendMessage(msg.chat.id, `⚠ Không tìm thấy task có ID: ${taskId}`);
            }
        } catch (err) {
            console.error(err);
            bot.sendMessage(msg.chat.id, '❌ Có lỗi xảy ra khi xóa task!');
        }
    },

    // Danh sách tất cả task
    async listAllTasks(msg, bot) {
        try {
            const tasks = await Task.find();
            if (tasks.length === 0) {
                bot.sendMessage(msg.chat.id, "📭 Không có task nào trong danh sách.");
            } else {
                const taskList = tasks.map(t => `${t.id} - ${t.platform}: ${t.content}`).join("\n");
                bot.sendMessage(msg.chat.id, `📌 *Danh sách Task còn lại:*\n${taskList}`, { parse_mode: 'Markdown' });
            }
        } catch (err) {
            console.error(err);
            bot.sendMessage(msg.chat.id, '❌ Có lỗi xảy ra khi lấy danh sách task!');
        }
    },

    // Lọc task theo platform
    async filterTasksByPlatform(msg, platform, bot) {
        try {
            const filteredTasks = await Task.find({ platform: new RegExp(platform, 'i') });
            if (filteredTasks.length === 0) {
                bot.sendMessage(msg.chat.id, `📭 Không có task nào thuộc *${platform}*.`);
            } else {
                const taskList = filteredTasks.map(t => `${t.id} - ${t.content}`).join("\n");
                bot.sendMessage(msg.chat.id, `📌 *Danh sách Task ${platform}:*\n${taskList}`, { parse_mode: 'Markdown' });
            }
        } catch (err) {
            console.error(err);
            bot.sendMessage(msg.chat.id, '❌ Có lỗi xảy ra khi lọc task!');
        }
    },

    // Báo cáo hàng ngày
    async sendDailyBugReport(bot, CHAT_ID) {
        try {
            const tasks = await Task.find();
            if (tasks.length === 0) {
                bot.sendMessage(CHAT_ID, "📭 Không có lỗi nào trong hệ thống hôm nay.");
                return;
            }

            let platforms = ["Android", "iOS", "Web", "BE"];
            let report = "📢 *Báo cáo Bug hàng ngày:*\n\n";

            platforms.forEach(platform => {
                const platformBugs = tasks.filter(task => task.platform.toLowerCase() === platform.toLowerCase());
                if (platformBugs.length > 0) {
                    report += `*${platform}:*\n`;
                    platformBugs.forEach(task => {
                        report += `+ ${task.id} - ${task.content}\n`;
                    });
                    report += "\n";
                }
            });

            bot.sendMessage(CHAT_ID, report, { parse_mode: "Markdown" });
        } catch (err) {
            console.error(err);
        }
    }
};

module.exports = taskHandlers;