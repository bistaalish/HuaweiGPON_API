/**
 * Formats and sends Telnet commands to add a PON and extract ONTID.
 *
 * @param {Object} inputData - The input data object containing PON details.
 * @param {Object} client - The connected Telnet client instance.
 * @param {string} basePrompt - The base Telnet prompt string.
 */
async function addPON(inputData, client, basePrompt) {
    try {
        const { FSP, ontSN, desc, vlan, profile, gem } = inputData;
        const [f, s, p] = FSP.split('/'); // Split F/S/P into components

        const interfacePrompt = `(config-if-gpon-${f}/${s})#`; // Construct interface-specific prompt

        console.log('[INFO] Entering interface configuration...');
        await client.write(`interface gpon ${f}/${s}\r\n`);
        await waitForPrompt(client, interfacePrompt);

        console.log('[INFO] Sending "ont confirm" command...');
        const ontConfirmCommand = `ont add ${p} sn-auth ${ontSN} omci ont-lineprofile-id ${profile} ont-srvprofile-id ${profile} desc ${desc}`;
        await client.write(`${ontConfirmCommand}\r\n`);
        const response = await waitForResponse(client, interfacePrompt);

        console.log('[INFO] Extracting ONTID...');
        const ontID = extractONTID(response);
        if (!ontID) {
            throw new Error('ONTID not found in response.');
        }
        console.log(`[SUCCESS] ONTID extracted: ${ontID}`);

        console.log('[INFO] Exiting interface configuration...');
        await client.write(`quit\r\n`);
        await client.write(`service-port vlan ${vlan} gpon ${FSP} ont ${ontID} gemport ${gem} multi-service user-vlan ${vlan} tag-transform translate\r\n`)
        await client.write("\r\n")
        await client.write("\r\n")
        await client.write("\r\n")
        await client.write(`display service-port port ${FSP} ont ${ontID} \r\n`);
        await client.write("\r\n");
        await client.write("\r\n");
        await client.write("\r\n");
        const responseServicePort = await waitForResponse(client, interfacePrompt);
        await console.log(type(responseServicePort));
        // const regexTotal = /Total\s*:\s*(\d+)/;
        const match = await responseServicePort.match(regexTotal);

        if (match) {
            console.log("Total:", match[1]);
            return true;
        } else {
            console.log("Total not found");
            return false;
        }
        // Use ONTID for further configurations
        console.log(`[INFO] Ready for further configurations with ONTID: ${ontID}`);
    } catch (error) {
        console.error('[ERROR] Failed to add PON:', error);
    }
}

/**
 * Waits for the Telnet command prompt to indicate readiness for the next command.
 *
 * @param {Object} client - The Telnet client instance.
 * @param {string} prompt - The expected prompt string.
 * @returns {Promise<void>}
 */
function waitForPrompt(client, prompt) {
    return new Promise((resolve, reject) => {
        let buffer = '';
        const timeout = setTimeout(() => {
            client.removeAllListeners('data');
            reject('[ERROR] Timeout waiting for prompt.');
        }, 20000);

        client.on('data', (data) => {
            buffer += data.toString();
            console.log(`[DEBUG] Data received: ${buffer}`); // Log received data for debugging
            if (buffer.includes(prompt)) {
                clearTimeout(timeout);
                client.removeAllListeners('data');
                resolve();
            }
        });
    });
}

/**
 * Waits for the Telnet command response to capture the ONTID.
 *
 * @param {Object} client - The Telnet client instance.
 * @param {string} prompt - The expected prompt string.
 * @returns {Promise<string>} The command response text.
 */
function waitForResponse(client, prompt) {
    return new Promise((resolve, reject) => {
        let buffer = '';
        const timeout = setTimeout(() => {
            client.removeAllListeners('data');
            reject('[ERROR] Timeout waiting for response.');
        }, 20000);

        client.on('data', (data) => {
            buffer += data.toString();
            console.log(`[DEBUG] Data received: ${buffer}`); // Log received data for debugging
            if (buffer.includes(prompt)) {
                clearTimeout(timeout);
                client.removeAllListeners('data');
                resolve(buffer);
            }
        });
    });
}

/**
 * Extracts the ONTID from the Telnet command response.
 *
 * @param {string} response - The command response string.
 * @returns {string|null} The extracted ONTID, or null if not found.
 */
function extractONTID(response) {
    const match = response.match(/ONTID :(\d+)/);
    return match ? match[1] : null;
}

module.exports = { addPON };
