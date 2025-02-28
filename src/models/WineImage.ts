import { ObjectId, Collection } from "mongodb";
import { db, connectDB } from "../db";

export interface IWineImage {
  _id?: ObjectId;
  filename: string;
  contentType: string;
  image: Buffer;
  wineName: string;
  uploadDate?: Date;
}

export default class WineImage {
  private static _wineImagesCollection: Collection<IWineImage> | null = null;

  /**
   * Ensures the database connection and collection initialization.
   */
  private static async ensureInitialized() {
    if (!this._wineImagesCollection) {
      await connectDB();
      this._wineImagesCollection = db.collection<IWineImage>("wineimages");
      console.log("WineImages collection initialized");
    }
  }

  /**
   * Getter for the wineImages collection that ensures initialization before use.
   */
  private static get collection(): Collection<IWineImage> {
    if (!this._wineImagesCollection) {
      throw new Error("WineImages collection has not been initialized!");
    }
    return this._wineImagesCollection;
  }

  /**
   * Initializes the collection.
   * Must be called once on app startup.
   */
  static async initialize() {
    await this.ensureInitialized();
  }

  /**
   * Saves a new wine image.
   */
  static async save(wineImage: IWineImage): Promise<IWineImage> {
    await this.ensureInitialized();
    wineImage.uploadDate = new Date();
    const result = await this.collection.insertOne(wineImage);
    return { ...wineImage, _id: result.insertedId };
  }

  /**
   * Finds a wine image by wine name.
   */
  static async findByWineName(wineName: string): Promise<IWineImage | null> {
    await this.ensureInitialized();
    return await this.collection.findOne({ wineName });
  }

  /**
   * Finds a wine image by ID.
   */
  static async findById(id: string): Promise<IWineImage | null> {
    await this.ensureInitialized();
    const image = await this.collection.findOne({ _id: new ObjectId(id) });
    return image;
  }

  /**
   * Deletes a wine image by ID.
   */
  static async deleteById(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}