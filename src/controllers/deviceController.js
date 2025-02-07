const Device = require('../models/Device'); // Adjust the path as necessary
const Reseller = require("../models/Reseller");
const {runAutofind} = require("./OLT/autofind");
const { createTelnetSession } = require('./OLT/login.js'); 
const {runSearchBySN} = require("./OLT/search");
const {deleteONTBySN} = require("./OLT/delete");
const {getServiceByName} = require("./serviceController");
const {addPON} = require("./OLT/add");
// Create a new device
const createDevice = async (req, res) => {
    const { Device_name, IP, username, password, reseller } = req.body;

    try {
         // Check if the reseller exists
         const resellerExists = await Reseller.findById(reseller);
         if (!resellerExists) {
             return res.status(404).json({ message: 'Reseller not found' });
         }
 
        const newDevice = new Device({ Device_name, IP, username, password, reseller });
        await newDevice.save();
        res.status(201).json({ message: 'Device created successfully', device: newDevice });
    } catch (error) {
        if (error.code === 11000) {
            console.log(error.message)
            return res.status(409).json({ message: 'Device with this IP or name already exists.' });
        }
        console.error('Error creating device:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all non-deleted devices
const getAllDevices = async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.reseller);
        // console.log(reseller)
        if (reseller.name !== "Admin"){
            const devices = await Device.find({ reseller:req.reseller, deleted: false});
            console.log(reseller)
            return res.status(200).json(devices);
        };
        if (reseller.name == "Admin") {
            const devices = await Device.find({deleted: false});
            return res.status(200).json(devices);
        };
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single device by ID
const getDeviceById = async (req, res) => {
    const { id } = req.params;
    try {
        const resellerCheck = await Reseller.findById(req.reseller);
        console.log(resellerCheck)
        if (!resellerCheck) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }
        if (resellerCheck.name == "Admin") {
            const device = await Device.findOne({shortId: id, deleted: false })
            return res.status(200).json(device);
        };
        const device = await Device.findOne({ shortId: id,reseller:req.reseller,deleted: false });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.status(200).json(device);
    } catch (error) {
        console.error('Error fetching device:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a device by ID
const updateDeviceById = async (req, res) => {
    const { id } = req.params;
    const { Device_name, IP, username, password, reseller } = req.body;

    try {
        const device = await Device.findOne({ _id: id, deleted: false });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Update fields
        device.Device_name = Device_name || device.Device_name;
        device.IP = IP || device.IP;
        device.username = username || device.username;
        device.password = password || device.password; // You may want to hash this before saving
        device.reseller = reseller || device.reseller;

        await device.save();
        res.status(200).json({ message: 'Device updated successfully', device });
    } catch (error) {
        console.error('Error updating device:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Soft delete a device by ID
const softDeleteDeviceById = async (req, res) => {
    const { id } = req.params;

    try {
        const device = await Device.findOne({ _id: id, deleted: false });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        await device.softDelete();
        res.status(200).json({ message: 'Device soft deleted successfully' });
    } catch (error) {
        console.error('Error deleting device:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Restore a soft-deleted device by ID
const restoreDeviceById = async (req, res) => {
    const { id } = req.params;

    try {
        const device = await Device.findOne({ _id: id, deleted: true });
        if (!device) {
            return res.status(404).json({ message: 'Device not found or not deleted' });
        }

        await device.restore();
        res.status(200).json({ message: 'Device restored successfully' });
    } catch (error) {
        console.error('Error restoring device:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const autofind = async (req,res) => {
    const { id } = req.params;
    try {
        const device = await Device.findOne({ shortId: id, deleted: false });
        if (!device) {
            return res.status(404).json({ message: 'Device not found or not deleted' });
        };
        console.log(device)
        const telnetOptions = {
            host: device.IP,
            port: 23,
            username: device.username,
            password: device.password,
            loginPrompt: '>>User name:',
            passwordPrompt: '>>User password:',
            prompt: '>'
        };
        const client = await createTelnetSession(telnetOptions); // Create Telnet session
        const ontList = await runAutofind(client, telnetOptions.prompt); // Execute autofind
        console.log('[INFO] Telnet session ended successfully.');
        console.log('[DATA] Extracted ONT List:', JSON.stringify(ontList, null, 2));
        console.log("[DATA]  Total Autofind:",ontList.length)
        client.end();
        res.status(200).json({ message: 'Autofind completed', ontList });
    }
    catch (error) {
        console.error('Error Finding device:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const searchONU = async (req,res) => {
    // check if the req.body provides sn or description
    const { id } = req.params;
    const {sn,description} = req.body;
    console.log(id);
    if (!sn && !description) {
        return res.status(400).json({ message: 'Please provide either SN or Description' });
    }
    try {
        const device = await Device.findOne({ shortId: id, deleted: false });
        if (!device) {
            return res.status(404).json({ message: 'Device not found or not deleted' });
        };
        console.log(device)
        const telnetOptions = {
            host: device.IP,
            port: 23,
            username: device.username,
            password: device.password,
            loginPrompt: '>>User name:',
            passwordPrompt: '>>User password:',
            prompt: '>'
        };
        const client = await createTelnetSession(telnetOptions); // Create Telnet session
        if (sn && !description) {
            const ont = await runSearchBySN(client, telnetOptions.prompt,sn); // Execute autofind
            console.log('[INFO] Telnet session ended successfully.');
            console.log('[DATA] Extracted ONT:', JSON.stringify(ont, null, 2));
            client.end();
            res.status(200).json({ message: 'Search completed', ont
        });
    }
        // const ont = await runSearch(client, telnetOptions.prompt,sn,description); // Execute autofind
        // console.log('[INFO] Telnet session ended successfully.');
        // console.log('[DATA] Extracted ONT:', JSON.stringify(ont, null, 2));
        // res.status(200).json({ message: 'Search completed', ont });
}catch (error) {
        console.error('Error Finding device:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a deleteONU controller
const deleteONU = async (req, res) => {
    const {id} = req.params;
    const {sn} = req.body;
    try {
        const device = await Device.findOne({ shortId: id, deleted: false });
        if (!device) {
            return res.status(404).json({ message: 'Device not found or not deleted' });
        };
        console.log(device)
        const telnetOptions = {
            host: device.IP,
            port: 23,
            username: device.username,
            password: device.password,
            loginPrompt: '>>User name:',
            passwordPrompt: '>>User password:',
            prompt: '>'
        };
        const client = await createTelnetSession(telnetOptions); // Create Telnet session
        const searchResult = await runSearchBySN(client, telnetOptions.prompt, sn);
        if (!searchResult.status) {
            console.error(`[INFO] ${searchResult.message}`);
            return res.status(404).json({ message: searchResult.message });
        }
        const ont = await deleteONTBySN(client,searchResult, telnetOptions.prompt); // Execute autofind
        console.log('[INFO] Telnet session ended successfully.');
        console.log('[DATA] Extracted ONT:', JSON.stringify(ont, null, 2));
        res.status(200).json({ message: 'Search completed', ont });
    }catch (error) {
        console.error('Error Finding device:', error);
        res.status(500).json({ message: 'Server error' });
    }
 };

 const addONU = async (req, res) => {
    const { id } = req.params;
    const { FSP, ontSN, desc,sName} = req.body;
    try {
        const device = await Device.findOne({ shortId: id, deleted: false });
        const service = await getServiceByName(sName)
        if (!device) {
            return res.status(404).json({ message: 'Device not found or not deleted' });
        };
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        };
        console.log(service)
        const telnetOptions = {
            host: device.IP,
            port: 23,
            username: device.username,
            password: device.password,
            loginPrompt: '>>User name:',
            passwordPrompt: '>>User password:',
            prompt: '>'
        };
        const inputData = {
            FSP: FSP,
            ontSN: ontSN,
            desc: desc,
            vlan: service.VLAN,
            profile: service.Profile,
            gem: service.GEM
        };
        const client = await createTelnetSession(telnetOptions); // Create Telnet session
        // For adding
        const ontInfo = await runSearchBySN(client, telnetOptions.prompt, ontSN);
        console.log('[INFO: main] Telnet session ended successfully.');
        console.log(ontInfo);
        if (!ontInfo.status){
            console.log('[INFO] ONT Information:\n', ontInfo);
            console.log('[INFO] Adding PON...');
            await addPON(inputData, client, telnetOptions.prompt);
            client.end(); // Close the connection
        
        }
        else {
            const deleteBySNOutput = await deleteONTBySN(client, ontInfo, telnetOptions.prompt);
            console.log('[INFO] ONT Deletion Output:', deleteBySNOutput);
            console.log('[INFO] ONT Information:\n', ontInfo);
            // console.log('[INFO] Adding PON...');
            await setTimeout(async ()=> {
                await addPON(inputData, client, telnetOptions.prompt);
                await client.end()
            },10000)
            // await client.end(); // Close the connection
        }
        return res.status(200).json({ message: 'Search completed', inputData });
    }catch (error) {
        console.error('Error Finding device:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
module.exports = {
    createDevice,
    getAllDevices,
    getDeviceById,
    updateDeviceById,
    softDeleteDeviceById,
    restoreDeviceById,
    autofind,
    searchONU,
    deleteONU,
    addONU
};