const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const http       = require('http');
const socketIo   = require('socket.io');
const path       = require('path');
const bcrypt     = require('bcryptjs');
const User       = require('./models/User');
const bodyParser = require('body-parser');

// Import routes and controllers
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const matchRoutes        = require('./routes/matchRoutes');
const sessionRoutes      = require('./routes/sessionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { setSocketIO: setSessionSocketIO }          = require('./controllers/sessionController');
const { setSocket: setNotificationSocketIO }       = require('./controllers/notificationController');
const adminRoutes  = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();

const app    = express();
const server = http.createServer(app);

// ─── CORS OPTIONS (single source of truth) ────────────────────────
const corsOptions = {
  origin: 'https://skill-swap-virid.vercel.app',   // ✅ no trailing slash
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token'], // ✅ proper array, not one string
  credentials: true,
};

// ─── SOCKET.IO ────────────────────────────────────────────────────
const io = socketIo(server, { cors: corsOptions });

// Create namespaces
const sessionSocket      = io.of('/sessions');
const notificationSocket = io.of('/notifications');

// Pass socket instances to controllers
setSessionSocketIO(sessionSocket);
setNotificationSocketIO(notificationSocket);

// ─── MIDDLEWARE (order matters!) ──────────────────────────────────
app.use(cors(corsOptions));                          // ✅ CORS must come first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profile-pictures', express.static(path.join(__dirname, 'uploads/profile-pictures')));
app.use('/uploads/message-uploads', express.static(path.join(__dirname, 'uploads')));

// ─── MONGODB CONNECTION ───────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PIC_URL } = process.env;

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      admin = new User({
        name:           ADMIN_NAME || 'Administrator',
        email:          ADMIN_EMAIL,
        password:       hash,
        role:           'admin',
        profilePicture: ADMIN_PIC_URL ? path.basename(ADMIN_PIC_URL) : '',
      });
      await admin.save();
      console.log('🚀 Admin user seeded:', ADMIN_EMAIL);
    }
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

// ─── ROUTES ───────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/matches',       matchRoutes);
app.use('/api/sessions',      sessionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/reports',       reportRoutes);

// ─── SOCKET EVENTS ────────────────────────────────────────────────
sessionSocket.on('connection', (socket) => {
  console.log('A user connected to session socket');
  const sessionId = socket.handshake.query.sessionId;
  console.log('Received sessionId:', sessionId);
  socket.on('disconnect', () => {
    console.log('A user disconnected from session socket');
  });
});

notificationSocket.on('connection', (socket) => {
  console.log('A user connected to notification socket');
  socket.on('disconnect', () => {
    console.log('A user disconnected from notification socket');
  });
});

// ─── DEFAULT ROUTE ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('SkillSwap API is running');
});

// ─── START SERVER ─────────────────────────────────────────────────
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});