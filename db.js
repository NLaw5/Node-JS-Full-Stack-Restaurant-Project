const mongoose = require("mongoose"); //reqiuiring the model 
let Schema = mongoose.Schema; //Schema = Abbreviation for Schematic, acts like a "blueprint" for our database, shows what structure our data will be stored in

let registerUser = new Schema({

    firstname: String,
    lastname: String,
    email: String,
    password: {
        type: String,
        unique: true
    }
});

let Users;

module.exports.initialize = function(){ //all our connection is moved to our initialize function, moved here as it makes sure that the server
    //must connect first before connecting to DB
    return new Promise((resolve, reject)=>{
        let db = mongoose.createConnection("mongodb+srv://dbUser:Kingofkings123@senecaweb.zisxl.mongodb.net/Web322NAA?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true });
        
        db.on('error', (err)=>{
            reject(err);
        });

        db.once('open', ()=>{
            //create a collection called "students" and "courses"
            //use the above schemas for their layout
            Users = db.model("Registered Users", registerUser); //first is the name of the connection that we will create which will show up on atlas
            resolve();
          });
    });
}

module.exports.addUser = function(data){
    return new Promise((resolve,reject)=>{ 
        //set data to null if an empty string ""
        //for in loop, go through each data 
        for (var formEntry in data){
            if (data[formEntry] == "") 
                data[formEntry] = null; //will assign a null value to the data[index]
        }

        //add data
        //NOTE: only works if the field names are the same. "Name" vs "name" doesn't work
        //Ex. if the Name in our form is "Name" but our schema is "name", won't work
        var newUser = new Users(data); //copy constructor

        newUser.save((err)=>{ //saves student in our Mongo database, throw an error if there is an error 
            if (err){
                console.log("Woopsie there was an error: "+err);
                reject(); //will send this error back to server.js .catch(err) 
            }
            else{
                console.log("Saved that student: "+data.name);
                resolve(); 
            }
        });
    });
}