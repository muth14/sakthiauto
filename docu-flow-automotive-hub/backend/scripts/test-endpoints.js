const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

/**
 * Test script to verify all API endpoints are working
 */

let authToken = '';
let testUserId = '';

const testEndpoints = async () => {
  console.log('🧪 Testing Sakthi Auto Docs API Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health Check:', healthResponse.data.message);

    // Test 2: API Info
    console.log('\n2. Testing API Info...');
    const apiResponse = await axios.get('http://localhost:5000/api');
    console.log('✅ API Info:', apiResponse.data.message);

    // Test 3: Login
    console.log('\n3. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@sakthiauto.com',
      password: 'password'
    });
    
    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      testUserId = loginResponse.data.data.user._id;
      console.log('✅ Login successful');
      console.log('   Token received:', authToken.substring(0, 20) + '...');
    } else {
      throw new Error('Login failed');
    }

    // Set default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // Test 4: Get Current User
    console.log('\n4. Testing Get Current User...');
    const userResponse = await axios.get(`${BASE_URL}/auth/me`);
    console.log('✅ Current User:', userResponse.data.data.firstName, userResponse.data.data.lastName);

    // Test 5: Get Form Templates
    console.log('\n5. Testing Get Form Templates...');
    const templatesResponse = await axios.get(`${BASE_URL}/forms/templates`);
    console.log('✅ Form Templates:', templatesResponse.data.data.length, 'templates found');

    // Test 6: Get Machines
    console.log('\n6. Testing Get Machines...');
    const machinesResponse = await axios.get(`${BASE_URL}/machines`);
    console.log('✅ Machines:', machinesResponse.data.data.length, 'machines found');

    // Test 7: Get Tools
    console.log('\n7. Testing Get Tools...');
    const toolsResponse = await axios.get(`${BASE_URL}/tools`);
    console.log('✅ Tools:', toolsResponse.data.data.length, 'tools found');

    // Test 8: Get Audit Logs
    console.log('\n8. Testing Get Audit Logs...');
    const auditResponse = await axios.get(`${BASE_URL}/audit/logs`);
    console.log('✅ Audit Logs:', auditResponse.data.data.length, 'logs found');

    // Test 9: Create Form Template
    console.log('\n9. Testing Create Form Template...');
    const newTemplate = {
      title: 'Test Quality Check Form',
      description: 'Test form for API validation',
      department: 'Quality Control',
      category: 'Inspection',
      sections: [
        {
          sectionId: 'test_section',
          title: 'Test Section',
          order: 1,
          fields: [
            {
              fieldId: 'test_field',
              label: 'Test Field',
              type: 'text',
              required: true,
              order: 1
            }
          ]
        }
      ]
    };

    const createTemplateResponse = await axios.post(`${BASE_URL}/forms/templates`, newTemplate);
    console.log('✅ Form Template Created:', createTemplateResponse.data.data.title);

    // Test 10: Create Machine
    console.log('\n10. Testing Create Machine...');
    const newMachine = {
      machineId: 'TEST001',
      name: 'Test Machine',
      model: 'TEST-MODEL',
      manufacturer: 'Test Manufacturer',
      serialNumber: 'TEST123456',
      department: 'Production',
      location: 'Test Location',
      installationDate: new Date().toISOString()
    };

    const createMachineResponse = await axios.post(`${BASE_URL}/machines`, newMachine);
    console.log('✅ Machine Created:', createMachineResponse.data.data.name);

    // Test 11: Create Tool
    console.log('\n11. Testing Create Tool...');
    const newTool = {
      toolId: 'TEST001',
      name: 'Test Tool',
      type: 'Testing',
      material: 'Test Material',
      manufacturer: 'Test Manufacturer',
      department: 'Quality Control',
      location: 'Test Location',
      purchaseDate: new Date().toISOString()
    };

    const createToolResponse = await axios.post(`${BASE_URL}/tools`, newTool);
    console.log('✅ Tool Created:', createToolResponse.data.data.name);

    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('\n📋 Summary:');
    console.log('- Authentication: ✅ Working');
    console.log('- Form Templates: ✅ Working');
    console.log('- Machines: ✅ Working');
    console.log('- Tools: ✅ Working');
    console.log('- Audit Logs: ✅ Working');
    console.log('- CRUD Operations: ✅ Working');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Make sure the backend server is running (npm run dev)');
    console.log('3. Make sure you have run the seeder (npm run seed)');
    console.log('4. Check the .env file configuration');
  }
};

// Run tests if called directly
if (require.main === module) {
  testEndpoints();
}

module.exports = { testEndpoints };
