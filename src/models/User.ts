import { ObjectId, Collection } from "mongodb";
import { db } from "../db";
import bcrypt from "bcryptjs";

export interface IUser {
  _id?: ObjectId;
  email: string;
  password: string;
}

export default class User {
  private static _userCollection: Collection<IUser> | null = null;

  // Initialize the user collection
  static async initialize() {
    if (!this._userCollection) {
      this._userCollection = db.collection<IUser>("users");
    }
  }

  // Ensure the collection is initialized before use
  private static async ensureInitialized() {
    if (!this._userCollection) {
      await this.initialize();
    }
  }

  // Getter to ensure userCollection is initialized
  private static get collection(): Collection<IUser> {
    if (!this._userCollection) {
      throw new Error("User collection has not been initialized!");
    }
    return this._userCollection;
  }

  // Find a user by email
  static async findByEmail(email: string): Promise<IUser | null> {
    await this.ensureInitialized();
    return await this.collection.findOne({ email });
  }

  // Find a user by ID
  static async findById(id: string): Promise<IUser | null> {
    await this.ensureInitialized();
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  // Save a new user
  static async save(user: IUser): Promise<IUser> {
    await this.ensureInitialized();
    const hashedPassword = await bcrypt.hash(user.password, 10); // Hash the password
    const insertResult = await this.collection.insertOne({
      ...user,
      password: hashedPassword,
    });
    return { ...user, _id: insertResult.insertedId };
  }

  // Compare passwords
  static async comparePassword(
    candidatePassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
}