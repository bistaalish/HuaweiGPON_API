// Function to generate a unique 4-digit ID
const generateUniqueId = async () => {
    let newId;
    let isUnique = false;

    while (!isUnique) {
        newId = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a random 4-digit number
        const existingReseller = await Reseller.findOne({ shortId: newId });
        isUnique = !existingReseller; // Check if the ID is unique
    }

    return newId;
};
