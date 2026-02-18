async function main(){
    try{
        return {customAlphabet} = await import('nanoid');
    }catch(err){
        console.log(err);
    }
};

module.exports = { main };