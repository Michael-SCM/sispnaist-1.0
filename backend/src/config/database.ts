import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sispatnaist';

    // Mongoose v8: não aceita mais 'retryWrites' e 'w' como opções diretas.
    // Para Atlas, essas opções já estão incluídas na connection string por padrão.
    await mongoose.connect(mongoUri);

    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('✗ MongoDB connection failed:', message);

    // Tentar reconectar após 5 segundos
    console.warn('⏳ Retrying connection in 5 seconds...');
    setTimeout(() => connectDB(), 5000);
  }
};

export default connectDB;
