const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=function(done){
    const url='mongodb+srv://thesneemmohammed:4KWawZlWmriAkWbL@cluster0.wbmy4d4.mongodb.net/?retryWrites=true&w=majority';
    const dbname='Ramiz';

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}
    module.exports.get=function(){
        return state.db;
    }
    