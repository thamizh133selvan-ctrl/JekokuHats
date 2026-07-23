const axios = require('axios');

async function simulateLoad() {
    const API_URL = 'http://localhost:3000/test';
    const limit = 30;
    const totalRequests = 32;
    
    console.log(`🚀 Starting simulation: ${totalRequests} unique IP requests to ${API_URL}`);

    const requests = [];
    for (let i = 1; i <= totalRequests; i++) {
        const fakeIp = `1.1.1.${i}`;
        requests.push(
            axios.get(API_URL, {
                headers: { 'x-forwarded-for': fakeIp }
            }).then(res => {
                console.log(`✅ [${fakeIp}] SUCCESS: ${res.data.message || res.statusText}`);
            }).catch(err => {
                if (err.response && err.response.status === 503) {
                    console.log(`❌ [${fakeIp}] REJECTED: ${err.response.data.message}`);
                } else {
                    console.log(`❗ [${fakeIp}] ERROR: ${err.message}`);
                }
            })
        );
    }

    await Promise.allSettled(requests);
    console.log('\n🏁 Simulation finished.');
}

simulateLoad();
