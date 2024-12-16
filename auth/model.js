const bcrypt = require('bcrypt');

// Mock data
const users = [{ id: '1', username: 'test', password: bcrypt.hashSync('password', 10) }];
const clients = [{ id: 'client1', secret: 'secret', redirectUri: 'http://localhost:3000/' }];
const tokens = new Map();

function getClient(clientId) {
    console.log('Fetching client with ID:', clientId);
    const client = clients.find((client) => client.id === clientId);
    console.log('Fetched client:', client);
    return client;
}

function getUser(username, password) {
    const user = users.find((u) => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        return user;
    }
    return null;
}

function saveToken(token, user, client) {
    tokens.set(token, { user, client });
}

module.exports = { getClient, getUser, saveToken };
