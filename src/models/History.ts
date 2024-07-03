import { Schema, model, Document } from 'mongoose';

interface IHistory extends Document {
  imageUrl: string;
  wineName: string;
  uploadDate: Date;
}

const HistorySchema = new Schema<IHistory>({
  imageUrl: { type: String, required: true },
  wineName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

const History = model<IHistory>('History', HistorySchema);
export default History;
