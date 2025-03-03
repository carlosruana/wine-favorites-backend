"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const WineRoutes_1 = __importDefault(require("./routes/WineRoutes"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
dotenv_1.default.config();
// Create the express app instance
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Connect to MongoDB before starting the server
(0, db_1.connectDB)().then(() => {
    // Use the port from environment variable, or default to 5000
    const port = process.env.PORT || 5000;
    app.listen(+port, "0.0.0.0", () => {
        console.log("Server running on port 3000");
    });
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from the uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Use wine routes
app.use(WineRoutes_1.default);
exports.default = app;
//# sourceMappingURL=server.js.map