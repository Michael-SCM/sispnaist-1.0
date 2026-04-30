import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sispatnaist';

    // Mongoose v8: não aceita mais 'retryWrites' e 'w' como opções diretas.
    // Para Atlas, essas opções já estão incluídas na connection string por padrão.
    const options = {
      maxPoolSize: 10, // Mantém até 10 conexões abertas
      serverSelectionTimeoutMS: 5000, // Falha após 5s se não conseguir selecionar o servidor
      socketTimeoutMS: 45000, // Fecha sockets inativos após 45s
      family: 4 // Força IPv4
    };

    await mongoose.connect(mongoUri, options);

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
