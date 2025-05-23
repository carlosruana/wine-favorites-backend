import { ObjectId, Collection, DeleteResult } from 'mongodb';
import { db } from "../db";

let winesCollection: Collection<IWine> | null = null;

export interface IWine {
    _id?: ObjectId;
    name: string;
    rating?: number;
    comments?: string;
    mimeType: string;
    favorite: boolean;
    image?: Buffer;
	uploadDate: Date;
	userId: string;
}

export default class Wine {
    // Initialize wines collection once
    static async initialize() {
        if (!winesCollection) {
            winesCollection = db.collection<IWine>('wines');
            console.log("Wines collection initialized");
        }
    }

    // Ensure the collection is initialized before use
    private static async ensureInitialized() {
        if (!winesCollection) {
            await this.initialize();
        }
    }

    // Getter to ensure winesCollection is always initialized
    private static get collection(): Collection<IWine> {
        if (!winesCollection) {
            throw new Error("Wine collection has not been initialized!");
        }
        return winesCollection;
    }

    static async find(query: Partial<IWine> = {}): Promise<IWine[]> {
        await this.ensureInitialized();
        return await this.collection.find(query).toArray();
    }

    static async findById(id: string): Promise<IWine | null> {
        await this.ensureInitialized();
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    static async findOne(query: { name: string }): Promise<IWine | null> {
        await this.ensureInitialized();
        return await this.collection.findOne({ name: query.name });
    }

    static async deleteOneById(query: { id: string }): Promise<DeleteResult> {
        await this.ensureInitialized();
        return await this.collection.deleteOne({ _id: new ObjectId(query.id) });
    }

    static async save(wine: IWine): Promise<IWine> {
        await this.ensureInitialized();
        const result = await this.collection.insertOne(wine);
        return { ...wine, _id: result.insertedId };
    }

    static async update(id: string, updates: Partial<IWine>): Promise<IWine | null> {
        await this.ensureInitialized();
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );
        if (result.matchedCount === 0) {
            return null; // Wine not found
        }
        return { ...updates, _id: new ObjectId(id) } as IWine;
    }

    static async findFavorites(): Promise<IWine[]> {
        await this.ensureInitialized();
        return await this.collection.find({ favorite: true }).toArray();
    }
}