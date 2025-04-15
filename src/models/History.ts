import { ObjectId, WithId, Collection, Db } from "mongodb";
import { db } from "../db";

export interface IHistory {
    _id?: ObjectId;
    wineName: string;
    uploadDate?: string;
    image: string;  // Changed from Buffer to string since we're storing URLs
    userId: string;
}

export default class History {
    private static _historyCollection: Collection<IHistory> | null = null;

    // Initialize the history collection once
    static async initialize() {
        if (!this._historyCollection) {
            this._historyCollection = db.collection<IHistory>("history");
        }
    }

    // Ensure the collection is initialized before use
    private static async ensureInitialized() {
        if (!this._historyCollection) {
            await this.initialize();
        }
    }

    // Getter to ensure historyCollection is initialized
    private static get collection(): Collection<IHistory> {
        if (!this._historyCollection) {
            throw new Error("History collection has not been initialized!");
        }
        return this._historyCollection;
    }

    // Get all history entries for a user
    static async find(userId?: string): Promise<IHistory[]> {
        await this.ensureInitialized();
        const query = userId ? { userId } : {};
        const result: WithId<IHistory>[] = await this.collection
            .find(query, { projection: { _id: 1, wineName: 1, uploadDate: 1, image: 1, userId: 1 } })
            .sort({ uploadDate: -1 })
            .toArray();
        
        return result.map(history => ({
            _id: history._id,
            wineName: history.wineName,
            uploadDate: history.uploadDate,
            image: history.image,
            userId: history.userId,
        }));
    }

    // Get a history entry by ID
    static async findById(id: string): Promise<IHistory | null> {
        await this.ensureInitialized();
        const result: WithId<IHistory> | null = await this.collection.findOne(
            { _id: new ObjectId(id) },
            { projection: { _id: 1, wineName: 1, uploadDate: 1, image: 1, userId: 1 } }
        );
        if (!result) return null;
        return {
            _id: result._id,
            wineName: result.wineName,
            uploadDate: result.uploadDate,
            image: result.image,
            userId: result.userId,
        };
    }

    // Save a new history entry
    static async save(entry: IHistory): Promise<IHistory> {
        await this.ensureInitialized();
        entry.uploadDate = new Date().toISOString();
        const insertResult = await this.collection.insertOne({
            ...entry,
            _id: entry._id ? new ObjectId(entry._id) : new ObjectId(),
        });
        return { ...entry, _id: insertResult.insertedId };
    }

    // Delete a history entry by ID
    static async deleteById(id: string): Promise<void> {
        await this.ensureInitialized();
        await this.collection.deleteOne({ _id: new ObjectId(id) });
    }
}