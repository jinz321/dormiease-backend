import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import routes from './router';
import { initializeSocket } from './config/socket';
import { errorHandler, requestLogger } from './middleware/errorHandler';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// Request logging
app.use(requestLogger);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cors());

app.use("/api", routes);

app.get("/", (req, res) => {
    res.send("Backend is running with WebSocket support");
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Network access: http://192.168.100.33:${PORT}`);
    console.log('WebSocket server initialized');
});

