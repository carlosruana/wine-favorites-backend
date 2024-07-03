import mongoose, { Schema, Document } from 'mongoose';

export interface IWine extends Document {
  name: string;
  rating: number;
  comments: string;
  type: 'white' | 'red' | 'rosé' | 'other';
  favorite: boolean;
}

const WineSchema: Schema = new Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comments: { type: String, required: true },
  type: { type: String, required: true, enum: ['white', 'red', 'rosé', 'other'] },
  favorite: { type: Boolean, default: false }
});

export default mongoose.model<IWine>('Wine', WineSchema);
