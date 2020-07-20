const express = require("express");
const app = express();
const file = require("fs");
const exphbs = require('express-handlebars');
const product = require("./models/product");
const bodyParser = require('body-parser');

//Assignment 3 addition:
const db = require("./db.js");

//load environment variable file
require('dotenv').config({path:"./config/keys.env"});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true})) //Added body parser to check for form validation

const PORT = process.env.PORT || 3000; //THIS IS FOR HEROKU

//Addition to Assignment 3
db.initialize().then(()=>{
  console.log("Data read successfully");
  app.listen(PORT, () => {
    console.log("Express http server listening on: " + PORT);	
});	
})
.catch((data)=>{
  console.log(data); //if it rejects, will pipe out the data 
});

app.get("/",(req,res)=>{

    res.render("home", {
        title : "Home",
        data : product.getAllProducts()
    })
})


app.get("/listings",(req,res)=>{
    res.render("listings", {
        title : "Listings",
        data : product.getAllMealPackages()
    })
})

app.get("/registration",(req,res)=>{
    res.render("registration", {
        title : "Registration"
    });
})

app.get("/login",(req,res)=>{
    res.render("login", {
        title : "Login"
    });
})



app.post("/login", (req,res) => {

    const errors = [];
    let email_value;
    let password_value;

    email_value = req.body.Email;
    password_value = req.body.Password;
    

    if(req.body.Email=="")
    {
        errors.push("You must enter an Email")
    }

    if(req.body.Password=="")
    {
        errors.push("You must enter a Password")
    }


    if(errors.length > 0)
    {
        res.render("login", {
            title:"Incorrect Login",
            errorsMessages: errors,
            ev: email_value,
            pv: password_value
        })
    }
    else 
    {
        res.redirect("/") 
    }
})

app.post("/registration", (req,res) => {

    const errors = [];
    let email_value;
    let password_value;
    let check_length;
    let firstname_value;
    let lastname_value;
    let re = /(?=.*[!@#$%^&*])/;

    check_length = req.body.Password;

    firstname_value = req.body.firstName;
    lastname_value = req.body.lastName;
    password_value = req.body.Password;
    email_value = req.body.Email;

    if(req.body.Email=="")
    {
        errors.push("You must enter an Email")
    }
 
    if(req.body.Password=="")
    {
        errors.push("You must enter a Password")
    }
    if(check_length.length < 6 || check_length.length > 12)
    {
        errors.push("You must enter a password that is 6 to 12 characters")
    }
    if(re.test(req.body.Password) == false)
    {
        errors.push("Your Password must have at least one special character (ex. !@#$%^&*)")
    }


    if(errors.length > 0)
    {
        res.render("registration", {
            title:"Incorrect Registration",
            errorsMessages: errors,
            ev: email_value,
            pv: password_value,
            fn: firstname_value,
            ln: lastname_value
        })
    }
    else 
    {

        const {firstName, lastName, Email, Password} = req.body;
        
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
        
    }
})
