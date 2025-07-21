import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const fileSchema = new Schema(
  {
    name: { type: String, required: true },
    downloadUrl: { type: String, required: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default model('File', fileSchema);
