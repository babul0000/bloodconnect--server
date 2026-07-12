"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const donors_1 = __importDefault(require("./routes/donors"));
const requests_1 = __importDefault(require("./routes/requests"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || '5000', 10);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Mount Routers
app.use('/api', auth_1.default);
app.use('/api', admin_1.default);
app.use('/api/donors', donors_1.default);
app.use('/api/requests', requests_1.default);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});
async function startServer() {
    try {
        await (0, db_1.connectDB)();
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
}
if (process.env.VERCEL) {
    (0, db_1.connectDB)().catch((error) => {
        console.error('Failed to connect to database on Vercel', error);
    });
}
else {
    startServer();
}
exports.default = app;
//# sourceMappingURL=index.js.map