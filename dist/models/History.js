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
class History {
    // Initialize the history collection once
    static initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._historyCollection) {
                this._historyCollection = db_1.db.collection("history");
            }
        });
    }
    // Ensure the collection is initialized before use
    static ensureInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._historyCollection) {
                yield this.initialize();
            }
        });
    }
    // Getter to ensure historyCollection is initialized
    static get collection() {
        if (!this._historyCollection) {
            throw new Error("History collection has not been initialized!");
        }
        return this._historyCollection;
    }
    // Get all history entries
    static find() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            const result = yield this.collection
                .find({}, { projection: { _id: 1, wineName: 1, uploadDate: 1, image: 1 } }) // Selecting necessary fields
                .sort({ uploadDate: -1 })
                .toArray();
            return result.map(history => ({
                _id: history._id, // Keep _id as ObjectId
                wineName: history.wineName,
                uploadDate: history.uploadDate,
                image: history.image,
            }));
        });
    }
    // Get a history entry by ID
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            const result = yield this.collection.findOne({ _id: new mongodb_1.ObjectId(id) }, { projection: { _id: 1, wineName: 1, uploadDate: 1, image: 1 } });
            if (!result)
                return null;
            return {
                _id: result._id,
                wineName: result.wineName,
                uploadDate: result.uploadDate,
                image: result.image,
            };
        });
    }
    // Save a new history entry
    static save(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            entry.uploadDate = new Date().toISOString();
            const insertResult = yield this.collection.insertOne(Object.assign(Object.assign({}, entry), { _id: entry._id ? new mongodb_1.ObjectId(entry._id) : new mongodb_1.ObjectId() }));
            return Object.assign(Object.assign({}, entry), { _id: insertResult.insertedId });
        });
    }
    // Delete a history entry by ID
    static deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            yield this.collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        });
    }
}
History._historyCollection = null;
exports.default = History;
//# sourceMappingURL=History.js.map