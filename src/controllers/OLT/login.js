const net = require('net');

/**
 * Create a Telnet session with the provided options.
 * @param {Object} options - Connection details (host, port, username, password, etc.)
 * @returns {Promise<net.Socket>} - The connected Telnet client.
 */
async function createTelnetSession(options) {
    const { host, port, username, password, loginPrompt, passwordPrompt, prompt } = options;

    return new Promise((resolve, reject) => {
        const client = net.createConnection({ host, port }, () => {
            console.log('[INFO] Connected to Telnet server.');
        });

        let buffer = '';

        // Process incoming data and handle responses
        client.on('data', (data) => {
            const response = data.toString();
            console.log('[DEBUG] Data received:', response); // Debugging raw data

            buffer += response;

            // Handle login prompt
            if (buffer.includes(loginPrompt)) {
                console.log('[INFO] Sending username...');
                client.write(`${username}\r\n`);
                buffer = buffer.slice(buffer.indexOf(loginPrompt) + loginPrompt.length); // Remove processed part
            } 
            // Handle password prompt
            else if (buffer.includes(passwordPrompt)) {
                console.log('[INFO] Sending password...');
                client.write(`${password}\r\n`);
                buffer = buffer.slice(buffer.indexOf(passwordPrompt) + passwordPrompt.length); // Remove processed part
            } 
            // Handle successful login prompt
            else if (buffer.includes(prompt)) {
                console.log('[INFO] Login successful.');
                resolve(client); // Return the connected client
            }
        });

        // Handle connection errors
        client.on('error', (err) => {
            reject(`[ERROR] Connection failed: ${err.message}`);
        });

        // Handle disconnection
        client.on('end', () => {
            console.log('[INFO] Disconnected from Telnet server.');
        });
    });
}

module.exports = { createTelnetSession };
