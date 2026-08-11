"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../src/app"));
const db_1 = __importDefault(require("../src/config/db"));
// Connect to DB for serverless environment
// Ensure we don't connect multiple times in warm containers
let isConnected = false;
exports.default = async (req, res) => {
    if (!isConnected) {
        await (0, db_1.default)();
        isConnected = true;
    }
    // Hand off to Express
    (0, app_1.default)(req, res);
};
//# sourceMappingURL=index.js.map