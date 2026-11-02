/**
 * ============================================================================
 * CODEORBIT TECH - FULL STACK DEVELOPMENT INTERNSHIP (BATCH 3)
 * TASK 3: SIMPLE REST API WITH NODE.JS & EXPRESS
 * ============================================================================
 * Candidate: Rahul Raj Das
 * Candidate ID: COT/BTH3/91388
 * Role: Full Stack Development Intern
 *
 * Description:
 * A complete, clean RESTful API for managing Notes & Records.
 * Implements full CRUD operations (Create, Read, Update, Delete) with
 * JSON file-based persistence, input validation, structured HTTP status codes,
 * and comprehensive route comments.
 *
 * Endpoints:
 * - GET    /                 -> Interactive API Welcome & Route Directory
 * - GET    /api/health       -> Server Health & Uptime Status
 * - GET    /api/notes        -> Retrieve All Notes (Supports filtering & search)
 * - GET    /api/notes/:id    -> Retrieve Single Note by ID
 * - POST   /api/notes        -> Create a New Note (Requires: title, content)
 * - PUT    /api/notes/:id    -> Update an Existing Note by ID
 * - DELETE /api/notes/:id    -> Delete a Note by ID
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// Server Configuration
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'notes.json');

// Ensure data folder and file exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

/**
 * Helper Functions for JSON Storage (Read & Write)
 */
function readNotesFromFile() {
  try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading data file:', error.message);
    return [];
  }
}

function writeNotesToFile(notes) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to data file:', error.message);
    return false;
  }
}

/**
 * Attempt to initialize Express.js
 * If express is installed, configure Express routes.
 * If express is not installed, provide native HTTP server fallback.
 */
let expressApp = null;
try {
  const express = require('express');
  let cors = null;
  try { cors = require('cors'); } catch (e) {}

  const app = express();

  // 1. Core Middlewares
  app.use(express.json()); // Parse incoming JSON request bodies
  app.use(express.urlencoded({ extended: true }));
  if (cors) app.use(cors()); // Enable Cross-Origin Resource Sharing

  // 2. Request Logging Middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });

  // 3. Serve Static Frontend Client (Interactive API Tester)
  app.use(express.static(path.join(__dirname, 'public')));

  // ==================== ROUTES DEFINITION ====================

  /**
   * @route   GET /
   * @desc    API Directory & Documentation
   */
  app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    res.status(200).json({
      success: true,
      message: 'CodeOrbit Tech - Full Stack Internship Task 3: REST API',
      intern: {
        name: 'Rahul Raj Das',
        id: 'COT/BTH3/91388',
        role: 'Full Stack Development Intern'
      },
      endpoints: {
        "GET /api/health": "System health and uptime",
        "GET /api/notes": "Get all notes (Query: ?category=, ?search=, ?priority=)",
        "GET /api/notes/:id": "Get note by ID",
        "POST /api/notes": "Create new note (Body: title, content, category, priority)",
        "PUT /api/notes/:id": "Update existing note by ID",
        "DELETE /api/notes/:id": "Delete note by ID"
      }
    });
  });

  /**
   * @route   GET /api/health
   * @desc    Health check & server diagnostics
   */
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform
    });
  });

  /**
   * @route   GET /api/notes
   * @desc    Retrieve all notes with optional search & category filtering
   * @access  Public
   */
  app.get('/api/notes', (req, res) => {
    let notes = readNotesFromFile();
    const { category, search, priority } = req.query;

    // Filter by category
    if (category) {
      notes = notes.filter(n => n.category && n.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by priority
    if (priority) {
      notes = notes.filter(n => n.priority && n.priority.toLowerCase() === priority.toLowerCase());
    }

    // Filter by keyword search (title or content)
    if (search) {
      const q = search.toLowerCase();
      notes = notes.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  });

  /**
   * @route   GET /api/notes/:id
   * @desc    Retrieve a single note by its unique ID
   * @access  Public
   */
  app.get('/api/notes/:id', (req, res) => {
    const notes = readNotesFromFile();
    const noteId = parseInt(req.params.id, 10);

    const note = notes.find(n => n.id === noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        error: `Note with ID ${req.params.id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  });

  /**
   * @route   POST /api/notes
   * @desc    Create a new note record
   * @access  Public
   */
  app.post('/api/notes', (req, res) => {
    const { title, content, category, priority } = req.body;

    // Field Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: "title" field is required.'
      });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: "content" field is required.'
      });
    }

    const notes = readNotesFromFile();

    // Auto-generate incrementing ID
    const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
    const now = new Date().toISOString();

    const newNote = {
      id: newId,
      title: title.trim(),
      content: content.trim(),
      category: category ? category.trim() : 'General',
      priority: priority ? priority.trim() : 'Medium',
      createdAt: now,
      updatedAt: now
    };

    notes.push(newNote);
    writeNotesToFile(notes);

    res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      data: newNote
    });
  });

  /**
   * @route   PUT /api/notes/:id
   * @desc    Update an existing note record by ID
   * @access  Public
   */
  app.put('/api/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id, 10);
    const { title, content, category, priority } = req.body;

    const notes = readNotesFromFile();
    const index = notes.findIndex(n => n.id === noteId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: `Note with ID ${req.params.id} not found.`
      });
    }

    // Update note fields if provided
    if (title !== undefined) notes[index].title = title.trim();
    if (content !== undefined) notes[index].content = content.trim();
    if (category !== undefined) notes[index].category = category.trim();
    if (priority !== undefined) notes[index].priority = priority.trim();
    notes[index].updatedAt = new Date().toISOString();

    writeNotesToFile(notes);

    res.status(200).json({
      success: true,
      message: `Note ID ${noteId} updated successfully.`,
      data: notes[index]
    });
  });

  /**
   * @route   DELETE /api/notes/:id
   * @desc    Delete a note record by ID
   * @access  Public
   */
  app.delete('/api/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id, 10);
    const notes = readNotesFromFile();
    const index = notes.findIndex(n => n.id === noteId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: `Note with ID ${req.params.id} not found.`
      });
    }

    const deletedNote = notes.splice(index, 1)[0];
    writeNotesToFile(notes);

    res.status(200).json({
      success: true,
      message: `Note ID ${noteId} deleted successfully.`,
      data: deletedNote
    });
  });

  // Catch-all 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Cannot ${req.method} ${req.url}. Route not found.`
    });
  });

  expressApp = app;
} catch (e) {
  // Express not installed yet - will fall back to native HTTP
  expressApp = null;
}

/**
 * Start Server (Express if available, else native Node.js HTTP fallback)
 */
if (expressApp) {
  expressApp.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 CodeOrbit REST API Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📝 Interactive API Client: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
} else {
  // Native Node.js HTTP fallback (Zero external dependencies)
  const http = require('http');
  const url = require('url');

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Enable CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    // Helper to send JSON
    const sendJSON = (statusCode, payload) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload, null, 2));
    };

    // Helper to parse JSON body
    const parseBody = (cb) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          cb(null, parsed);
        } catch (err) {
          cb(err);
        }
      });
    };

    // Logging
    console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

    // Serve HTML client for GET /
    if (pathname === '/' && method === 'GET') {
      const htmlPath = path.join(__dirname, 'public', 'index.html');
      if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(fs.readFileSync(htmlPath));
      }
      return sendJSON(200, {
        success: true,
        message: 'CodeOrbit REST API (Native Node.js Mode)',
        intern: 'Rahul Raj Das'
      });
    }

    // Health
    if (pathname === '/api/health' && method === 'GET') {
      return sendJSON(200, {
        success: true,
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version
      });
    }

    // GET /api/notes
    if (pathname === '/api/notes' && method === 'GET') {
      let notes = readNotesFromFile();
      const { category, search, priority } = parsedUrl.query;
      if (category) notes = notes.filter(n => n.category && n.category.toLowerCase() === category.toLowerCase());
      if (priority) notes = notes.filter(n => n.priority && n.priority.toLowerCase() === priority.toLowerCase());
      if (search) {
        const q = search.toLowerCase();
        notes = notes.filter(n => (n.title && n.title.toLowerCase().includes(q)) || (n.content && n.content.toLowerCase().includes(q)));
      }
      return sendJSON(200, { success: true, count: notes.length, data: notes });
    }

    // Single note match /api/notes/:id
    const noteIdMatch = pathname.match(/^\/api\/notes\/(\d+)$/);

    if (noteIdMatch && method === 'GET') {
      const id = parseInt(noteIdMatch[1], 10);
      const notes = readNotesFromFile();
      const note = notes.find(n => n.id === id);
      if (!note) return sendJSON(404, { success: false, error: `Note with ID ${id} not found.` });
      return sendJSON(200, { success: true, data: note });
    }

    // POST /api/notes
    if (pathname === '/api/notes' && method === 'POST') {
      return parseBody((err, body) => {
        if (err || !body.title || !body.content) {
          return sendJSON(400, { success: false, error: 'Validation Error: title and content are required.' });
        }
        const notes = readNotesFromFile();
        const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
        const now = new Date().toISOString();
        const newNote = {
          id: newId,
          title: body.title.trim(),
          content: body.content.trim(),
          category: body.category ? body.category.trim() : 'General',
          priority: body.priority ? body.priority.trim() : 'Medium',
          createdAt: now,
          updatedAt: now
        };
        notes.push(newNote);
        writeNotesToFile(notes);
        return sendJSON(201, { success: true, message: 'Note created successfully.', data: newNote });
      });
    }

    // PUT /api/notes/:id
    if (noteIdMatch && method === 'PUT') {
      const id = parseInt(noteIdMatch[1], 10);
      return parseBody((err, body) => {
        const notes = readNotesFromFile();
        const idx = notes.findIndex(n => n.id === id);
        if (idx === -1) return sendJSON(404, { success: false, error: `Note with ID ${id} not found.` });

        if (body.title !== undefined) notes[idx].title = body.title.trim();
        if (body.content !== undefined) notes[idx].content = body.content.trim();
        if (body.category !== undefined) notes[idx].category = body.category.trim();
        if (body.priority !== undefined) notes[idx].priority = body.priority.trim();
        notes[idx].updatedAt = new Date().toISOString();

        writeNotesToFile(notes);
        return sendJSON(200, { success: true, message: `Note ID ${id} updated.`, data: notes[idx] });
      });
    }

    // DELETE /api/notes/:id
    if (noteIdMatch && method === 'DELETE') {
      const id = parseInt(noteIdMatch[1], 10);
      const notes = readNotesFromFile();
      const idx = notes.findIndex(n => n.id === id);
      if (idx === -1) return sendJSON(404, { success: false, error: `Note with ID ${id} not found.` });

      const deleted = notes.splice(idx, 1)[0];
      writeNotesToFile(notes);
      return sendJSON(200, { success: true, message: `Note ID ${id} deleted.`, data: deleted });
    }

    // Not found
    sendJSON(404, { success: false, error: `Route ${pathname} not found.` });
  });

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 CodeOrbit REST API Server running on port ${PORT} (Native Node Mode)`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}
