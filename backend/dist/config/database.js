import mongoose from 'mongoose';
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sispatnaist';
        await mongoose.connect(mongoUri, {
            retryWrites: true,
            w: 'majority',
        });
        console.log('✓ MongoDB connected successfully');
    }
    catch (error) {
        console.error('✗ MongoDB connection failed:', error instanceof Error ? error.message : 'Unknown error');
        console.warn('⚠️ Continuing without MongoDB connection...');
        // Não encerra o processo, permite que o servidor continue
    }
};
export default connectDB;
//# sourceMappingURL=database.js.map