"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HistorySchema = new mongoose_1.Schema({
    imageUrl: { type: String, required: true },
    wineName: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
});
const History = (0, mongoose_1.model)('History', HistorySchema);
exports.default = History;
//# sourceMappingURL=History.js.map