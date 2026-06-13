import app from './app';
import connectDB from './config/db';
import { env } from './config/env';

const PORT = parseInt(env.PORT, 10);

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB first
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('');
      console.log('🌿 ─────────────────────────────────────────── 🌿');
      console.log(`   KidEnDu API Server`);
      console.log(`   Environment  : ${env.NODE_ENV}`);
      console.log(`   Port         : ${PORT}`);
      console.log(`   Client URL   : ${env.CLIENT_URL}`);
      console.log('🌿 ─────────────────────────────────────────── 🌿');
      console.log('');
    });

    // Graceful shutdown handlers
    const shutdown = (signal: string) => {
      console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      console.error('❌ Unhandled Rejection:', reason);
      shutdown('unhandledRejection');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
