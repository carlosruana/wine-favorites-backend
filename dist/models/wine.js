"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const db_1 = require("../db");
let winesCollection = null;
class Wine {
    // Initialize wines collection once
    static initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!winesCollection) {
                winesCollection = db_1.db.collection('wines');
                console.log("Wines collection initialized");
            }
        });
    }
    // Ensure the collection is initialized before use
    static ensureInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!winesCollection) {
                yield this.initialize();
            }
        });
    }
    // Getter to ensure winesCollection is always initialized
    static get collection() {
        if (!winesCollection) {
            throw new Error("Wine collection has not been initialized!");
        }
        return winesCollection;
    }
    static find() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            return yield this.collection.find().toArray();
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            return yield this.collection.findOne({ _id: new mongodb_1.ObjectId(id) });
        });
    }
    static findOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            return yield this.collection.findOne({ name: query.name });
        });
    }
    static save(wine) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            const result = yield this.collection.insertOne(wine);
            return Object.assign(Object.assign({}, wine), { _id: result.insertedId });
        });
    }
    static update(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            const result = yield this.collection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updates });
            if (result.matchedCount === 0) {
                return null; // Wine not found
            }
            return Object.assign(Object.assign({}, updates), { _id: new mongodb_1.ObjectId(id) });
        });
    }
    static findFavorites() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            return yield this.collection.find({ favorite: true }).toArray();
        });
    }
}
exports.default = Wine;
//# sourceMappingURL=Wine.js.map