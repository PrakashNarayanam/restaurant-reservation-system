const http = require('http');

const API_URL = 'http://localhost:5000/api';

const makeRequest = (method, path, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            raw: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting Integration Tests against Express API...\n');

  try {
    // 1. Register a test customer
    console.log('Step 1: Registering test customer...');
    const registerRes = await makeRequest('POST', '/auth/register', {
      username: `testuser_${Date.now()}`,
      password: 'testpassword123',
      role: 'customer'
    });
    console.log(`Status: ${registerRes.statusCode}, Success: ${registerRes.body.success}`);
    const token = registerRes.body.token;

    // 2. Fetch tables (should work with user token)
    console.log('\nStep 2: Fetching available tables...');
    const tablesRes = await makeRequest('GET', '/tables', null, {
      Authorization: `Bearer ${token}`
    });
    console.log(`Status: ${tablesRes.statusCode}, Found tables: ${tablesRes.body.count}`);

    // 3. Create a reservation
    console.log('\nStep 3: Creating reservation for 4 guests...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const bookRes1 = await makeRequest('POST', '/reservations', {
      date: dateStr,
      timeSlot: '18:00-20:00',
      guests: 4
    }, {
      Authorization: `Bearer ${token}`
    });
    console.log(`Status: ${bookRes1.statusCode}, Assigned Table: ${bookRes1.body.data?.table?.tableNumber} (Capacity: ${bookRes1.body.data?.table?.capacity})`);

    // 4. Try to book 4 reservations of 4 guests to occupy all eligible tables (Table 3, 4, 5, 6)
    console.log('\nStep 4: Booking tables to exhaust capacities...');
    
    // Booking 2: Should get assigned Table 4 (cap 4)
    const bookRes2 = await makeRequest('POST', '/reservations', {
      date: dateStr,
      timeSlot: '18:00-20:00',
      guests: 4
    }, {
      Authorization: `Bearer ${token}`
    });
    console.log(`Booking 2 Status: ${bookRes2.statusCode}, Assigned Table: ${bookRes2.body.data?.table?.tableNumber} (Capacity: ${bookRes2.body.data?.table?.capacity})`);

    // Booking 3: Should get assigned Table 5 (cap 6)
    const bookRes3 = await makeRequest('POST', '/reservations', {
      date: dateStr,
      timeSlot: '18:00-20:00',
      guests: 4
    }, {
      Authorization: `Bearer ${token}`
    });
    console.log(`Booking 3 Status: ${bookRes3.statusCode}, Assigned Table: ${bookRes3.body.data?.table?.tableNumber} (Capacity: ${bookRes3.body.data?.table?.capacity})`);

    // Booking 4: Should get assigned Table 6 (cap 8)
    const bookRes4 = await makeRequest('POST', '/reservations', {
      date: dateStr,
      timeSlot: '18:00-20:00',
      guests: 4
    }, {
      Authorization: `Bearer ${token}`
    });
    console.log(`Booking 4 Status: ${bookRes4.statusCode}, Assigned Table: ${bookRes4.body.data?.table?.tableNumber} (Capacity: ${bookRes4.body.data?.table?.capacity})`);

    // Booking 5: Should fail because Table 1 & 2 only have capacity 2, so no tables left for 4 guests!
    console.log('\nStep 4b: Attempting a 5th reservation of 4 guests (should fail with 400)...');
    const bookRes5 = await makeRequest('POST', '/reservations', {
      date: dateStr,
      timeSlot: '18:00-20:00',
      guests: 4
    }, {
      Authorization: `Bearer ${token}`
    });
    console.log(`Booking 5 Status: ${bookRes5.statusCode}`);
    console.log(`Response message: "${bookRes5.body.message}"`);

    // 5. Try to book for capacity exceeding all tables
    console.log('\nStep 5: Attempting to book for 12 guests (exceeds all table capacities)...');
    const bookResExceed = await makeRequest('POST', '/reservations', {
      date: dateStr,
      timeSlot: '12:00-14:00',
      guests: 12
    }, {
      Authorization: `Bearer ${token}`
    });
    console.log(`Status: ${bookResExceed.statusCode}`);
    console.log(`Response message: "${bookResExceed.body.message}"`);

    console.log('\n✅ All integration tests completed successfully.');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
};

runTests();
