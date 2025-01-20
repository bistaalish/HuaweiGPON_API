const net = require('net');

async function runAutofind(client, prompt) {
    return new Promise((resolve, reject) => {
        let buffer = '';
        let ontList = [];

        client.write('enable\r\n');
        console.log('[INFO] Sent "enable" command.');

        client.once('data', () => {
            client.write('config\r\n');
            console.log('[INFO] Sent "config" command.');

            client.once('data', () => {
                client.write('display ont autofind all\r\n');
                console.log('[INFO] Sent "display ont autofind all" command.');
            });
        });

        client.on('data', (data) => {
            const response = data.toString();
            console.log('[DEBUG] Data received during autofind:', response); // Debugging raw data
            buffer += response;

            // Handle "Failure" message
            if (buffer.includes("Failure: The automatically found ONTs do not exist")) {
                console.log('[INFO] No ONTs found. Exiting early.');
                client.removeAllListeners('data'); // Remove event listeners
                // client.end(); // Close the connection
                resolve([]); // Resolve with an empty list
                return {};
            }

            // Handle pagination prompt
            if (buffer.includes("---- More ( Press 'Q' to break ) ----")) {
                console.log('[INFO] Handling "More" prompt...');
                client.write("\n");
                buffer = buffer.replace("---- More ( Press 'Q' to break ) ----", '');
            }

            // Check if the command execution is complete
            if (buffer.includes("The number of GPON autofind ONT is")) {
                console.log('[INFO] Autofind command completed.');
                const matchBlock = buffer.match(/display ont autofind all[\s\S]*?The number of GPON autofind ONT is \d+/);
                if (matchBlock) {
                    const rawOutput = matchBlock[0];

                    // Extract ONT details
                    const ontMatches = rawOutput.match(/Number\s*:\s*(\d+)[\s\S]*?Ont autofind time\s*:\s*(.+)/g);
                    if (ontMatches) {
                        ontList = ontMatches.map((ontEntry) => {
                            try {
                                const number = ontEntry.match(/Number\s*:\s*(\d+)/)?.[1];
                                const FSP = ontEntry.match(/F\/S\/P\s*:\s*([\d/]+)/)?.[1];
                                const ontSN = ontEntry.match(/Ont SN\s*:\s*([\s\S]+?)\s*\(/)?.[1];
                                const password = ontEntry.match(/Password\s*:\s*([\s\S]+?)\s*(Loid|$)/)?.[1]?.trim();
                                const loid = ontEntry.match(/Loid\s*:\s*(.+?)(\s|$)/)?.[1] || null;
                                const checkcode = ontEntry.match(/Checkcode\s*:\s*(.+?)(\s|$)/)?.[1] || null;
                                const vendorID = ontEntry.match(/VendorID\s*:\s*(.+?)(\s|$)/)?.[1];
                                const ontVersion = ontEntry.match(/Ont Version\s*:\s*(.+?)(\s|$)/)?.[1];
                                const ontSoftwareVersion = ontEntry.match(/Ont SoftwareVersion\s*:\s*(.+?)(\s|$)/)?.[1];
                                const ontEquipmentID = ontEntry.match(/Ont EquipmentID\s*:\s*(.+?)(\s|$)/)?.[1];
                                const ontAutofindTime = ontEntry.match(/Ont autofind time\s*:\s*(.+)/)?.[1];

                                return {
                                    number,
                                    FSP,
                                    ontSN,
                                    password,
                                    loid,
                                    checkcode,
                                    vendorID,
                                    ontVersion,
                                    ontSoftwareVersion,
                                    ontEquipmentID,
                                    ontAutofindTime,
                                };
                            } catch (e) {
                                console.warn('[WARN] Error parsing ONT entry:', ontEntry);
                                return null;
                            }
                        }).filter(Boolean); // Remove null entries
                    }
                }

                console.log('[INFO] Extracted ONT list:', JSON.stringify(ontList, null, 2));
                client.removeAllListeners('data'); // Remove event listeners
                // client.end(); // Close the connection
                resolve(ontList); // Resolve with the list of ONT objects
            }
        });

        client.on('error', (err) => {
            reject(`[ERROR] Telnet session error: ${err.message}`);
        });
    });
}

module.exports = { runAutofind };
