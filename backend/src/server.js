const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // For demo purposes, allow all origins
        methods: ['GET', 'POST']
    }
});

const { initSocket } = require('./services/socketService');
initSocket(io);

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';

// ─── Middleware ───
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/schedule', require('./routes/scheduleRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/leave', require('./routes/leaveRoutes'));
app.use('/api/overtime', require('./routes/overtimeRoutes'));
app.use('/api/correction', require('./routes/correctionRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', async (req, res) => {
    res.status(200).json({ message: 'Workly API is running 🚀' });
});


app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});


app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Lỗi server nội bộ',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});


const startServer = async () => {
    try {
     
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');
        await sequelize.sync({ alter: false });
        console.log('✅ Models synced');

        server.listen(port, () => {
            console.log(`🚀 Server running at http://${hostname}:${port}/`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error.message);
        process.exit(1);
    }
};

startServer();
