"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersCollection = exports.profilesCollection = exports.requestsCollection = exports.donorsCollection = exports.db = exports.client = void 0;
exports.connectDB = connectDB;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI is not defined in .env');
}
exports.client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
exports.db = exports.client.db(process.env.MONGODB_DATABASE || 'StayNest');
exports.donorsCollection = exports.db.collection('donors');
exports.requestsCollection = exports.db.collection('requests');
exports.profilesCollection = exports.db.collection('profiles');
exports.usersCollection = exports.db.collection('user');
async function connectDB() {
    await exports.client.connect();
    console.log('Connected to MongoDB via configuration module');
}
//# sourceMappingURL=db.js.map