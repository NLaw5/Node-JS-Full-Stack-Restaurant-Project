const express = require("express");
const app = express();
const file = require("fs");
const path = require("path");
const exphbs = require('express-handlebars');
const product = require("./models/product");
const bodyParser = require('body-parser');
const clientSessions = require("client-sessions"); //Assignment 4 addition, should be A3 but prof allowed us to use local variable
const multer = require("multer"); //Assignment 4 addition

//Setup client-sesions
app.use(clientSessions({
    cookieName: "session", //this is the "cookie" or object name that will be added to 'req', in this case req.session
    secret: "web322_Assignment4and5", //this should be a long un-guessable string
    duration: 2 * 60 * 1000, //duration of the session in milliseconds if no request is made | 1000 = seconds, 60 is a minute, 2 is how many minutes
    activeDuration: 1000 * 60 //the sesion will be extended by this many ms each request (1 minute)
}));

// Multer Assignment 4 addition
const storage = multer.diskStorage({
    destination: "./public/img/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); //keeps the original extension name (whatevername.png or jpg, etc.)
    }
})
;

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      return cb(null, true);
    } else {
      return cb(new Error('Not an image! Please upload an image.', 400), false);
    }
  };
  
const upload = multer({ storage: storage, fileFilter: imageFilter });

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
//End of addition

//OPTIONAL: not really anymore, must be used for datacleark


app.get("/",(req,res)=>{
    // res.render("home", {
    //     title : "Home",
    //     data : product.getAllProducts() //checks our values to determine if product check = true, then returns product
    // })

    db.getMealPackages().then((dataTopMealPackages)=>{
            res.render("home",{
                title : "Home",
                data : product.getAllProducts(), 
                topMealPackages: db.checkMealProducts(dataTopMealPackages)
            }).catch((err)=>{
                res.render("home",{
                title : "Home",
                data : product.getAllProducts(),
            }) 
        });
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

//Assignment 3 Additions

let loggedIn;
let tempUser;

app.post("/login", (req,res) => {
    db.checkUser(req.body).then((data) =>{
        req.session.user = data; //should only be data but if it doesn't work, try data[0]

        //THIS IS not needed because we are using session now from Assignment 3+
        // loggedIn = true;
        // tempUser = data; //this is our temporary user info
        res.render("dashboard", {
            users: req.session.user //not sure, check in case
        })
    }).catch(err => {
        res.render("login", {
            errorsMessages: err,
            ev: req.body.Email,
            pv: req.body.Password
        });
        console.log(err);
        console.log("Something went wrong with Login");
    })
 
})

app.post("/registration", (req,res) => {
    db.registerUser(req.body).then((data) => {
        res.render("registration", {
            successMessage: "User Succesfully Created",
            title: "Registration",
        });
    }).catch(err => {
        res.render("registration", {
            errorsMessages: err,
            ev: req.body.Email,
            pv: req.body.Password,
            fn: req.body.firstName,
            ln: req.body.lastName
        });
        console.log(err);
        console.log("Something went wrong");
    });
})

function ensureLogin(req, res, next){ //our helper middleware function
    if(!req.session.user){
        res.redirect("/login");
    }
    else{
        next();
    }
}

function ensureAdmin(req, res, next) {
    if (!req.session.user && req.session.user.role!= true) //in future, if I was to do it I would put role as boolean, future as in A4+
    {
        console.log(req.session.user.role);
        res.redirect("/login");
    }
    else
    {
        next();
    }
}

app.get("/logout", ensureLogin, (req, res) => {
    req.session.reset();
    //No need for these as Assignent 3+ we will be using session
    // loggedIn = false; //resets loggedIn as false
    // tempUser = ""; //resets tempUser and makes it hold nothing
    res.redirect("/login");
});

app.get("/orders", ensureLogin, (req,res) =>{
    res.render("orders", {
        title: "Orders",
        successMessage: "User Succesfully Created"
    })
})

app.get("/dashboard", ensureLogin, (req,res) =>
    res.render("dashboard", {
        title: "Dashboard",
        users: req.session.user //A4: Change from local variable to sessions
    })
)

//Assignment 4 Additions:
app.get("/mp", ensureLogin, ensureAdmin, (req,res) => {
    db.getMealPackages().then((data)=>{
        res.render("mp",{mealpackage: (data.length!=0)?data:undefined});
      }).catch((err)=>{
        res.render("mp"); //add an error message or something
    });
});


app.get("/addmp", ensureLogin, ensureAdmin, (req,res) => {
    res.render("addmp");
});

app.post("/addmp", upload.single("photo"), (req,res) => {
    req.body.img = req.file.filename;
    db.addMealPackage(req.body).then((data) => {
        res.render("dashboard", {
            title: "Dashboard",
            users: req.session.user
        });
    }).catch(err => {
        res.render("addmp", {
            errorsMessages: err,
        });
        console.log(err);
        console.log("Something went wrong");
    });
});



app.get("/edit", ensureLogin, ensureAdmin, (req,res)=>{
    if (req.query.name){ //checks if there is name 
      db.getMealPackagesforEdit(req.query.name).then((users)=>{
        res.render("editmp", {
            data: users[0]
        }); //using [0] because students is an array
      }).catch(()=>{
        console.log("Couldn't find the User");
        res.redirect("/edit");
      });
    }
    else
      res.redirect("/mp");
});
  
app.post("/edit", (req,res) =>{
    console.log(req.body);
    db.editMealPackage(req.body).then(()=>{
        res.redirect("/mp");
    }).catch((err)=>{
        console.log("Error updating package: " + err);
        res.render("/mp"); //add error message in A5 or A4 I guess
    })
})

app.get("/delete", ensureLogin, ensureAdmin, (req,res)=>{
    if (req.query.name){ //checks if there is name 
        db.deleteMealPackage(req.query.name);
        res.redirect("/dashboard"); 
    }
    else {
        console.log("No Query");
        res.redirect("/dashboard"); //add error message in A5 or A4
    }
    
});



app.use((err, req, res, next) => {
    console.log(err.message);
    res.status(500).render("addmp", {message:`Cannot upload non-images files!`})
});

