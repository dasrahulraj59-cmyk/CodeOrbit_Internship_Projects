# Task 3: Simple REST API with Node.js & Express

**Internship Track:** Full Stack Development (1 Month)  
**Organization:** CodeOrbit Tech (Batch 3)  
**Intern Name:** Rahul Raj Das  
**Intern ID:** COT/BTH3/91388  

---

## 📌 Project Overview
A clean, modular RESTful API built using Node.js and Express to manage Notes and Records. The API implements standard REST principles (GET, POST, PUT, DELETE) with JSON file-based persistence (`data/notes.json`), structured error handling, request logging, and query filtering.

It includes:
- Thorough explanatory comments across `server.js`.
- A ready-to-import Postman Collection (`CodeOrbit_REST_API.postman_collection.json`).
- An automated test script (`test-api.js`) verifying all CRUD operations with zero external test dependencies.
- A built-in web-based interactive test console served at `http://localhost:5000/`.

---

## 🚀 REST API Endpoints Specification

| Method | Endpoint | Description | Request Body | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Server uptime and health diagnostics | None | `200 OK` |
| **GET** | `/api/notes` | Retrieve all notes (Supports query filtering) | None | `200 OK` |
| **GET** | `/api/notes?category=CodeOrbit` | Filter notes by category | None | `200 OK` |
| **GET** | `/api/notes?search=portfolio` | Search notes by title or content | None | `200 OK` |
| **GET** | `/api/notes/:id` | Retrieve a single note by unique ID | None | `200 OK` / `404 Not Found` |
| **POST** | `/api/notes` | Create a new note | JSON: `title*`, `content*`, `category`, `priority` | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/notes/:id` | Update an existing note by ID | JSON: any field (`title`, `content`, etc.) | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/notes/:id` | Delete a note by ID | None | `200 OK` / `404 Not Found` |

---

## 🛠️ Technologies Used
- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web application framework for routing and middleware.
- **File System (`fs`):** Asynchronous JSON file reading/writing for data persistence without requiring an external database setup.
- **Postman:** API testing and collection documentation.

---

## 💻 Setup and Run Instructions

### 1. Installation
Navigate into the Task 3 directory:
```bash
cd Task3_Simple_REST_API
```

Install dependencies (if Node/NPM are installed):
```bash
npm install
```

### 2. Start the Server
```bash
npm start
# or directly:
node server.js
```
The server will start on port `5000`:
```text
=======================================================
🚀 CodeOrbit REST API Server running on port 5000
📡 URL: http://localhost:5000
📝 Interactive API Client: http://localhost:5000
=======================================================
```

### 3. Interactive Web Testing
Open your browser and navigate to:
```text
http://localhost:5000
```
This opens the built-in live API console where you can click buttons to test GET, POST, PUT, DELETE with immediate JSON output.

### 4. Running the Automated Test Suite
In a second terminal window, run the automated test suite:
```bash
npm test
# or:
node test-api.js
```
Output:
```text
======================================================
🧪 Starting Automated REST API Test Suite
   Target: http://localhost:5000
======================================================
  ✅ PASS: Health endpoint returns HTTP 200
  ✅ PASS: Retrieve all notes returns HTTP 200
  ✅ PASS: Create note returns HTTP 201 Created
  ✅ PASS: Retrieve note by ID returns HTTP 200
  ✅ PASS: Update note returns HTTP 200
  ✅ PASS: Delete note returns HTTP 200
  ✅ PASS: Deleted note returns HTTP 404 Not Found
  ✅ PASS: Invalid payload returns HTTP 400 Bad Request
======================================================
📊 Test Results: 8 Passed | 0 Failed
======================================================
```

### 5. Testing with Postman
1. Open **Postman**.
2. Click **Import** in the upper left corner.
3. Select the file `CodeOrbit_REST_API.postman_collection.json`.
4. Run individual requests or execute the entire collection runner!

---

## 📝 Sample `cURL` Commands for Terminal Testing

**Get all notes:**
```bash
curl -X GET http://localhost:5000/api/notes
```

**Create a new note:**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "My Note", "content": "Testing from terminal", "category": "CodeOrbit", "priority": "High"}'
```

**Update note 1:**
```bash
curl -X PUT http://localhost:5000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

**Delete note 1:**
```bash
curl -X DELETE http://localhost:5000/api/notes/1
```
