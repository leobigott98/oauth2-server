const Client = require('../models/Client');

// Get Client
async function getClient(client_id) {
    try {
        console.log('Fetching client with ID:', client_id);
        const client = await Client.findOne({client_id}).exec(); 
        console.log('Fetched client:', client);
        return client;
    } catch (err) {
        console.log('Ha ocurrido un error:', err.message);
    }  
}

module.exports = getClient;