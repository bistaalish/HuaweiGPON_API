const net = require('net');

async function runSearchBySN(client, prompt, sn) {
  try {
    // Send the "enable" command
    client.write('enable\r\n');

    // Wait for the "enable" response
    await new Promise((resolve, reject) => {
      client.once('data', (data) => {
        resolve(data.toString());
      });

      setTimeout(() => reject('Timeout waiting for "enable" response.'), 10000);
    });

    // Send the "config" command
    client.write('config\r\n');

    // Wait for the "config" response
    await new Promise((resolve, reject) => {
      client.once('data', (data) => {
        resolve(data.toString());
      });

      setTimeout(() => reject('Timeout waiting for "config" response.'), 10000);
    });

    // Send the "display ont info by-sn <sn>" command
    const command = `display ont info by-sn ${sn}`;
    client.write(`${command}\r\n`);

    // Capture the output until the prompt or "---- More" is encountered
    const output = await new Promise((resolve, reject) => {
      let response = '';
      client.on('data', (data) => {
        response += data.toString();

        // Check if the end of the command's output is reached
        if (response.includes(prompt) || response.includes("---- More")) {
          resolve(response);
        }
      });

      setTimeout(() => reject(`Timeout waiting for "${command}" response.`), 10000);
    });

    // Check if the required ONT does not exist
    const notFoundRegex = /\sThe required ONT does not exist/;
    if (notFoundRegex.test(output)) {
      console.log('[INFO] The required ONT does not exist.');
      return { status: false, message: "SN not found" }; // Return the status false
    }

    // Now, extract the required fields and return as an object
    const extractedData = await extractONTData(output);
    client.write("q\n")
    // Return the extracted data without closing the Telnet session
    return extractedData;
  } catch (error) {
    console.error(`Error: ${error}`);
    return { status: false }; // Return status false in case of error
  }
}

// Function to extract data and return an object
function extractONTData(output) {
  const response = {
    status: true,
    message: "Serial is found"
  };
  const result = {};

  // Match patterns and extract relevant data
  const regexPatterns = {
    fsp: /F\/S\/P\s*:\s*(\S+)/,
    ontId: /ONT-ID\s*:\s*(\d+)/,
    controlFlag: /Control flag\s*:\s*(\S+)/,
    runState: /Run state\s*:\s*(\S+)/,
    authenticType: /Authentic type\s*:\s*(\S+)/,
    sn: /SN\s*:\s*(\S+)/,
    description: /Description\s*:\s*(\S+)/,
    lastDownCause: /Last down cause\s*:\s*(.*?)(\r\n|\n)/,
    lastUpTime: /Last up time\s*:\s*(.*?)(\r\n|\n)/,
    lastDownTime: /Last down time\s*:\s*(.*?)(\r\n|\n)/,
    lastDyingGaspTime: /Last dying gasp time\s*:\s*(.*?)(\r\n|\n)/,
  };

  // Extract data based on regex patterns
  result.status = true;
  result.fsp = output.match(regexPatterns.fsp)?.[1] || null;
  result.ontId = output.match(regexPatterns.ontId)?.[1] || null;
  result.controlFlag = output.match(regexPatterns.controlFlag)?.[1] || null;
  result.runState = output.match(regexPatterns.runState)?.[1] || null;
  result.authenticType = output.match(regexPatterns.authenticType)?.[1] || null;
  result.sn = output.match(regexPatterns.sn)?.[1] || null;
  result.description = output.match(regexPatterns.description)?.[1] || null;

  // If the run state is offline, include additional details
  if (result.runState === 'offline') {
    result.lastDownCause = output.match(regexPatterns.lastDownCause)?.[1] || null;
    result.lastUpTime = output.match(regexPatterns.lastUpTime)?.[1] || null;
    result.lastDownTime = output.match(regexPatterns.lastDownTime)?.[1] || null;
    result.lastDyingGaspTime = output.match(regexPatterns.lastDyingGaspTime)?.[1] || null;
  }
  response.data = result;
  return response;
}

module.exports = { runSearchBySN };
