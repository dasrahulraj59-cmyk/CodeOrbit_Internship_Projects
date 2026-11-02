/**
 * AUTOMATED REST API TEST SUITE
 * Run with: node test-api.js
 * (Uses native Node.js http module - zero dependencies required)
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
let passed = 0;
let failed = 0;

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Automated REST API Test Suite');
  console.log('   Target: http://localhost:5000');
  console.log('======================================================\n');

  try {
    // 1. Health Check
    console.log('1. Testing Health Endpoint: GET /api/health');
    const healthRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
    assert(healthRes.data.status === 'UP', 'Health status is UP');

    // 2. GET all notes
    console.log('\n2. Testing Retrieve All Notes: GET /api/notes');
    const allNotesRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notes',
      method: 'GET'
    });
    assert(allNotesRes.status === 200, 'Retrieve all notes returns HTTP 200');
    assert(Array.isArray(allNotesRes.data.data), 'Data returned is an array');

    // 3. POST new note
    console.log('\n3. Testing Create Note: POST /api/notes');
    const newNotePayload = {
      title: 'Automated Test Note',
      content: 'Testing REST API endpoint functionality automatically.',
      category: 'Testing',
      priority: 'High'
    };
    const postRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notes',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, newNotePayload);

    assert(postRes.status === 201, 'Create note returns HTTP 201 Created');
    assert(postRes.data.data && postRes.data.data.title === newNotePayload.title, 'Created note title matches');
    const createdId = postRes.data.data ? postRes.data.data.id : null;

    // 4. GET note by ID
    if (createdId) {
      console.log(`\n4. Testing Retrieve Note by ID: GET /api/notes/${createdId}`);
      const getSingleRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/notes/${createdId}`,
        method: 'GET'
      });
      assert(getSingleRes.status === 200, 'Retrieve note by ID returns HTTP 200');
      assert(getSingleRes.data.data.id === createdId, 'Returned note ID matches requested ID');

      // 5. PUT update note
      console.log(`\n5. Testing Update Note: PUT /api/notes/${createdId}`);
      const putRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/notes/${createdId}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }, { title: 'Automated Test Note (Updated)', priority: 'Low' });

      assert(putRes.status === 200, 'Update note returns HTTP 200');
      assert(putRes.data.data.title === 'Automated Test Note (Updated)', 'Updated title matches');

      // 6. DELETE note
      console.log(`\n6. Testing Delete Note: DELETE /api/notes/${createdId}`);
      const delRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/notes/${createdId}`,
        method: 'DELETE'
      });
      assert(delRes.status === 200, 'Delete note returns HTTP 200');

      // 7. Verify deletion
      console.log(`\n7. Testing Note Not Found after Deletion: GET /api/notes/${createdId}`);
      const verifyRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/notes/${createdId}`,
        method: 'GET'
      });
      assert(verifyRes.status === 404, 'Deleted note returns HTTP 404 Not Found');
    }

    // 8. Validation Test
    console.log('\n8. Testing Validation Failure: POST /api/notes with missing fields');
    const invalidPostRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notes',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { content: 'Missing title' });
    assert(invalidPostRes.status === 400, 'Invalid payload returns HTTP 400 Bad Request');

    // Summary
    console.log('\n======================================================');
    console.log(`📊 Test Results: ${passed} Passed | ${failed} Failed`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n❌ Error connecting to server:', err.message);
    console.error('👉 Make sure server is running first with: npm start or node server.js\n');
    process.exit(1);
  }
}

runTests();
