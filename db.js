const mongoose = require("mongoose"); //reqiuiring the model 
const bcrypt = require('bcryptjs');
let Schema = mongoose.Schema; //Schema = Abbreviation for Schematic, acts like a "blueprint" for our database, shows what structure our data will be stored in

let registerUser = new Schema({

    firstName: String,
    lastName: String,
    Email: {
        type: String,
        unique: true,
    },
    Password: {
        type: String,
        unique: true,
    }
});

let mp = new Schema({
    name: String,
    price: String,
    desc: String,
    category: String,
    Quantity: Number,
    topMeal: Boolean,
    img: String
});



let MealPackages;
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
            MealPackages = db.model("Meal Packages", mp);
            console.log("Succesfully connected to Mongoose");
            resolve();
          });
    });
}



module.exports.registerUser = function(body)
{
    return new Promise((resolve,reject)=>{ 

        const errors = [];

        let check_length;

        let re = /(?=.*[!@#$%^&*])/;
    
        check_length = body.Password;

        if(body.Email=="")
        {
            errors.push("You must enter an Email")
        }
     
        if(body.Password=="")
        {
            errors.push("You must enter a Password")
        }
        if(check_length.length < 6 || check_length.length > 12)
        {
            errors.push("You must enter a password that is 6 to 12 characters")
        }
        if(re.test(body.Password) == false)
        {
            errors.push("Your Password must have at least one special character (ex. !@#$%^&*)")
        }
    
        if(errors.length > 0)
        {
            console.log("Form Validation incorrect");
            reject(errors); //will send as error to our post function in server.js
        }
        else 
        {
    
            const {firstName, lastName, Email, Password} = body;
            
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
            //sgMail.setApiKey("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");
            const msg = {
                to: `${Email}`,
                from: "newn.law123@gmail.com",
                subject: 'Welcome Email Web322:Assignment 2',
                html: `Visitor's Full Name: ${firstName} ${lastName} <br>
                       Visitor's Email Address ${Email} <br>
                       Visitor's Password ${Password}`
            };
            sgMail.send(msg)
            .then(()=>{
                //res.redirect("/") 
                res.render("home", {
                    title : "Home",
                    data : product.getAllProducts(),
                    send: Email,
                })
            })
            .catch(err=>{
                console.log(`Error ${err}`);
            })

            //ASSIGNMENT 3 ADDITIONS:
            //set data to null if an empty string ""
            //for in loop, go through each data 

            for (var formEntry in body){
                if (body[formEntry] == "") 
                    body[formEntry] = null; //will assign a null value to the data[index]
            }

            //ADDITIONS TO DB.JS FOR ASSIGNMENT 3+
            //add data
            //NOTE: only works if the field names are the same. "Name" vs "name" doesn't work
            //Ex. if the Name in our form is "Name" but our schema is "name", won't work
            let newUser = new Users(body); //copy constructor
            bcrypt.genSalt(10) //Generate a "salt" using 10 rounds
            .then(salt=>bcrypt.hash(newUser.Password,salt)) //use the generated "salt" to encrypt the password
            .then(hash=> { //returns encrypted password
                newUser.Password = hash;
                newUser.save((err)=>{ //saves student in our Mongo database, throw an error if there is an error 
                    if (err){
                        console.log("There was an error: "+err);
                        reject(err); 
                    }
                    else{
                        console.log("Saved that User: "+body.firstName);
                        resolve(); 
                    }
                });
            })
            .catch(err => {
                console.log(err); //shows errors in console for us
                reject("Hash error has occured");
            })         
        }     
    });
}

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        let input_password = userData.Password;
        const errors = [];

        if(userData.Email=="")
        {
            errors.push("You must enter an Email")
        }
    
        if(userData.Password=="")
        {
            errors.push("You must enter a Password")
        }
    
    
        if(errors.length > 0)
        {
            console.log("Form Validation for Login incorrect");
            reject(errors);
        }

        Users.find({
            Email: userData.Email 
        }).exec()
        .then((users) => {
            if (users.length > 0) {
                bcrypt.compare(userData.Password, users[0].Password).then(res => {
                    if(res === true)
                    {
                        console.log(users[0].Password);
                        console.log(input_password);
                        console.log(Users.Email);
                        resolve(users.map(items=>items.toObject()));
                    }
                    else
                    {
                        console.log(users[0].Password);
                        errors.push("Wrong Password Associated with Email");
                        reject(errors);
                    }
                }).catch(err => {
                    console.log(err);
                    reject("There was an error verifying the user");
                });
            }
            else{
                errors.push("Unable to find Email");
                reject (errors);
            }
        });
    });
}

module.exports.addMealPackage = (userData) => {
    return new Promise((resolve, reject) => {

        for (var formEntry in userData){
            if (userData[formEntry] == "") 
            userData[formEntry] = null; //will assign a null value to the data[index]
        }


        userData.topMeal = (userData.topMeal)? true: false;

        if (userData.topMeal == null)
        {
            userData.topMeal = false;
        }

        
        let newMealPackage = new MealPackages(userData);

        newMealPackage.save((err)=>{ //saves student in our Mongo database, throw an error if there is an error 
            if (err){
                console.log("There was an error: "+err);
                reject(err); 
            }
            else{
                console.log("Saved that Meal Package: "+userData.name);
                resolve(); 
            }
        });
    })
}

module.exports.getMealPackages = function(){
    return new Promise((resolve,reject)=>{
        MealPackages.find() //gets all and returns an array. Even if 1 or less entries
        .exec() //tells mongoose that we should run this find as a promise.
        .then((returnedMealPackages)=>{
            //resolve(filteredMongoose(returnedStudents));
            resolve(returnedMealPackages.map(item=>item.toObject()));
        }).catch((err)=>{
                console.log("Error Retriving Meal Packages:"+err);
                reject(err);
        });
    });
}

module.exports.getMealPackagesforEdit = function(inName){
    return new Promise((resolve,reject)=>{
        MealPackages.find({name: inName}) //gets all and returns an array. Even if 1 or less entries
        .exec() //tells mongoose that we should run this find as a promise.
        .then((returnedMealPackages)=>{
            if(returnedMealPackages.length !=0 )
            //resolve(filteredMongoose(returnedStudents));
                resolve(returnedMealPackages.map(item=>item.toObject()));
            else
                reject("No Meal Packages found");
        }).catch((err)=>{
                console.log("Error Retriving Meal Package:"+err);
                reject(err);
        });
    });
}

module.exports.editMealPackage = (editData) => {
    return new Promise((resolve, reject) => {
        editData.topMeal = (editData.topMeal)? true: false;

        console.log("Testing editData:");
        console.log(editData);
        console.log("Testing editData Name:")
        console.log(editData.name);

        if (editData.topMeal == null)
        {
            editData.topMeal = false;
        }

        MealPackages.updateOne(
            {name : editData.name},
        {$set: {
            price: editData.price,
            desc: editData.desc,
            category: editData.category,
            Quantity: editData.Quantity,
            topMeal: editData.topMeal,
        }})
        .exec()
        .then(()=>{
            console.log(`Quantity ${editData.Quantity} has been updated`)
            console.log(`MealPackage ${editData.name} has been updated`);
            resolve();
        }).catch((err)=>{
            reject(err);
        });

    });
}

module.exports.deleteMealPackage = (inputName) => {
    setTimeout(function(){
        MealPackages.deleteOne({name: inputName})
    .exec()   //run as a promise
    .then(()=>{
        //resolve();
    }).catch(()=>{
       //reject();  //maybe a problem communicating with server
    });
    },2000);

}

module.exports.checkMealProducts = (userData) => {
  
        console.log("Checking data being sent through");
        console.log(userData);
        if(userData.length > 0)
        {
            let finalArray = [];

            for (let i=0; i < userData.length; i++)
            {
                if (userData[i].topMeal != false)
                {
                    finalArray.push(userData[i]);
                }
                
            }
             return finalArray;
        }
}

