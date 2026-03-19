import dotenv from 'dotenv';
import Scope from '../models/Scope';
import { connectDB, closeDBConnection } from '../utils/db';

dotenv.config();

async function addCustomScope(name: string, description: string) {
    try {
        await connectDB();

        // Usamos upsert: si el scope ya existe, solo actualiza la descripción. Si no, lo crea.
        await Scope.updateOne(
            { name }, 
            { $set: { name, description } }, 
            { upsert: true }
        );

        console.log(`✅ Scope '${name}' agregado o actualizado exitosamente!`);
        await closeDBConnection();
    } catch (error) {
        console.error("❌ Error agregando el scope:", error);
        process.exit(1);
    }
}

// Parseamos los argumentos de la consola
const scopeName = process.argv[2];
const scopeDesc = process.argv[3];

if (require.main === module || process.argv[1].includes('addScope')) {
    if (!scopeName || !scopeDesc) {
        console.log('⚠️ Uso: npx ts-node addScope.ts <nombre_del_scope> "<Descripción del scope>"');
        console.log('💡 Ejemplo: npx ts-node addScope.ts erp:customers:write "Permite a la IA registrar clientes en el ERP"');
        process.exit(1);
    }
    addCustomScope(scopeName, scopeDesc);
}