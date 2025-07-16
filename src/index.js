import express from 'express';
import contactsRouter from './routes/contacts.routes.js';
import prisma from '../prisma/client.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/identify', contactsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        prisma.$disconnect();
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    server.close(() => {
        prisma.$disconnect();
        console.log('Server closed');
        process.exit(0);
    });
});

export default app;