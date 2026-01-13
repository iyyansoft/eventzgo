const dns = require('node:dns');

// Monkey patch dns.lookup to force IPv4
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    options = { ...options, family: 4 };
    console.log(`[DNS] Resolving ${hostname} (Force IPv4)`);
    return originalLookup(hostname, options, callback);
};

const url = "https://sleek-reindeer-280.convex.cloud/api/action/auth/authActions:signInAction";
console.log("Testing connection to:", url);

(async () => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ args: { username: "test" } }),
        });
        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response:", text.substring(0, 100));
    } catch (err) {
        console.error("Connectivity Test Failed:", err.message);
        if (err.cause) console.error("Cause:", err.cause);
    }
})();
