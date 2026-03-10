import Client, {IClient} from '../models/Client';

// Get Client
export const getClient = async (client_id: string): Promise<IClient | null> => {
    try {
        const client = await Client.findOne({client_id}).exec(); 
        return client;
    } catch (err) {
        console.log('Ha ocurrido un error:', err);
        return null;
    }  
}