const { runSearchBySN } = require('./search'); // Import the search function

/**
 * Deletes the ONT by Serial Number (SN) after removing the service-port.
 *
 * @param {object} client - Telnet client instance.
 * @param {string} sn - Serial number of the ONT.
 * @param {string} prompt - Command prompt indicator.
 * @returns {Promise<object>} - Result of the operation.
 */
async function deleteONTBySN(client, searchResult, prompt) {
  try {
    // Search for the ONT by SN
    // const searchResult = await runSearchBySN(client, prompt, sn);
    // if (!searchResult.status) {
    //   console.error(`[INFO] ${searchResult.message}`);
    //   return { success: false, message: searchResult.message };
    // }

    const { fsp, ontId } = searchResult.data;
    console.log(`[INFO] ONT found: F/S/P=${fsp}, ONT-ID=${ontId}`);

    // Delete the service-port associated with the ONT
    console.log(`[INFO] Deleting service-port for F/S/P=${fsp}, ONT-ID=${ontId}`);
    client.write(`undo service-port port ${fsp} ont ${ontId}\r\n`);
    client.write(`\n`); // Send newline to confirm
    client.write(`y\n`); // Send 'y' to confirm action
    // await waitForPrompt(client, prompt);

    // Split F/S/P into its components
    const [f, s, p] = fsp.split('/');

    // Delete the ONT
    console.log(`[INFO] Deleting ONT: Interface GPON ${f}/${s}, ONT-ID=${ontId}`);
    client.write(`interface gpon ${f}/${s}\r\n`);
    // await waitForPrompt(client, prompt);

    client.write(`ont delete ${p} ${ontId}\r\n`);
    await waitForDeletionCompletion(client, prompt); // Wait for a short timeout after deletion
    await client.write("quit\r\n")
    console.log('[INFO] ONT deletion completed.');
    return { success: true, message: 'ONT successfully deleted.' };
  } catch (error) {
    console.error(`[ERROR] Failed to delete ONT: ${error}`);
    return { success: false, message: `Error: ${error}` };
  }
}

/**
 * Waits for the command prompt to appear in the Telnet session.
 *
 * @param {object} client - Telnet client instance.
 * @param {string} prompt - Command prompt indicator.
 * @returns {Promise<void>}
 */
function waitForPrompt(client, prompt) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    client.on('data', (data) => {
      buffer += data.toString();
      if (buffer.includes(prompt)) {
        resolve();
      }
    });

    setTimeout(() => reject('Timeout waiting for command prompt.'), 10000); // Increased timeout
  });
}

/**
 * Waits for the deletion completion and returns early if the ONT deletion is done.
 *
 * @param {object} client - Telnet client instance.
 * @param {string} prompt - Command prompt indicator.
 * @returns {Promise<void>}
 */
function waitForDeletionCompletion(client, prompt) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    client.on('data', (data) => {
      buffer += data.toString();
      // Use regex to match the expected deletion confirmation message
      const regex = /Number of ONTs that can be deleted: \d+, success: \d+/;
      if (regex.test(buffer)) {
        console.log("[INFO] ONT deletion confirmed.");
        resolve();
      }
    });

    setTimeout(() => reject('Timeout waiting for ONT deletion confirmation.'), 10000); // Adjust timeout if needed
  });
}

module.exports = { deleteONTBySN };
