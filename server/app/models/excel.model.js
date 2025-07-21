import mongoose from 'mongoose';

const excelSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    data: { type: Array, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model('excelData', excelSchema);
