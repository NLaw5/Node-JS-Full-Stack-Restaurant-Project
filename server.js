//Newman Law
//ID: 134543198
//Github Link: https://github.com/NLaw5/WEB-322-Assignment-5.git 
//Heroku Link: https://web-322-assignment5.herokuapp.com/ [Is working at the time of creation, please let me know if theres any error]
//Data Clerk User Account: username: FM@seneca.ca passsword: #654321
const express = require("express");
const app = express();
const file = require("fs");
const path = require("path");
const exphbs = require('express-handlebars');
const product = require("./models/product");
const bodyParser = require('body-parser');
//Assignment 3 addition:
const db = require("./db.js");
const clientSessions = require("client-sessions"); //Assignment 4 addition, should be A3 but prof allowed us to use local variable
const multer = require("multer"); //Assignment 4 addition
const cart = require("./cart.js");

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



//load environment variable file
require('dotenv').config({path:"./config/keys.env"});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true})) //Added body parser to check for form validation
app.use(bodyParser.json());

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
    db.getMealPackages().then((dataTopMealPackages)=>{
            console.log("Testing getmealPackage for root")
            console.log(dataTopMealPackages);
            res.render("home",{
                title : "Home",
                data : product.getAllProducts(), 
                topMealPackages: db.checkMealProducts(dataTopMealPackages) })
            // }).catch((err)=>{
            //     console.log(err)
            //     res.render("home",{
            //     title : "Home",
            //     data : product.getAllProducts(),
            // }) 
        });
    })
// })


app.get("/listings",(req,res)=>{
    db.getMealPackages().then((mealpackages)=>{
        res.render("listings",{
            title : "Listings",
            data: (mealpackages.length!=0)?mealpackages:undefined});
      }).catch((err)=>{
        res.render("listings"); //add an error message or something
    });
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
app.post("/login", (req,res) => {
    db.checkUser(req.body).then((data) =>{
        req.session.user = data; 
        res.render("dashboard", {
            users: req.session.user,
            layout: false
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
    if (!req.session.user || req.session.user[0].role!=true) { 
        res.render("dashboard", {
            users: req.session.user,
            errors: "You do not have Admin access to that page"
        }
      );
    } else {
      next();
    }
}


app.get("/logout", ensureLogin, (req, res) => {
    cart.deleteCart(); //will empty our userCart variable when user Logs out
    req.session.reset();
    res.redirect("/login");
});


app.get("/dashboard", ensureLogin, (req,res) =>
    res.render("dashboard", {
        title: "Dashboard",
        users: req.session.user 
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
        console.log(users[0]);
        res.render("editmp", {
            data: users[0]
        }); //using [0] because students is an array
      }).catch(()=>{
        console.log("Couldn't find the User");
        res.redirect("/edit");
      });
    }
    else
      res.redirect("/dashboard");
});
  
app.post("/edit", (req,res) =>{
    console.log(req.body);
    db.editMealPackage(req.body).then(()=>{
        res.redirect("/mp");
    }).catch((err)=>{
        console.log("Error updating package: " + err);
        res.render("editmp", {
            errorsMessages: err,
            data:req.body
        }
        ); 
    })
})

app.get("/delete", ensureLogin, ensureAdmin, (req,res)=>{
    if (req.query.name){ //checks if there is name 
        db.deleteMealPackage(req.query.name).then(()=>{
            res.redirect("/mp");
        }).catch((err) =>{
            console.log(err);
            res.redirect("/dashboard"); 
        })
    }
    else {
        console.log("No Query");
        res.redirect("/dashboard"); 
    }
    
});

//Assignment 5 Additions
app.get("/orders", ensureLogin, (req,res) =>{
    db.getMealPackages().then(packages=>{
        res.render("orders", {
            title: "Orders",
            data: packages, layout: false});
    }).catch(()=>{
        res.send("Something went wrong with grabbing the package")
    })
})

app.post("/addProduct", ensureLogin, (req,res)=>{
    console.log("Adding prod with name: "+req.body.name);
    db.getMealPackgesforPayment(req.body.name)
    .then((item)=>{
        cart.addItem(item) //cart is what was exported | const cart = require("./cart.js"); | store in variable called userCart in Cart.js
        .then((numItems)=>{
            res.json({data: numItems}); //this is sent back to product.hbs, specificlaly AJAX
        }).catch(()=>{
            res.json({message:"error adding"});
        })
    }).catch(()=>{
        res.json({message: "No Items found"})
    })
});

//Route to see cart and items
app.get("/cart", ensureLogin, (req,res)=>{
    var cartData = {
        cart:[],
        total:0
    } ;
    cart.getCart().then((items)=>{
        cartData.cart = items;
        cart.checkout().then((total)=>{
            cartData.total = total;
            console.log(cartData.total);
            res.render("checkout", {data:cartData, layout:false}); //sending in cartData as Data; therefore, at checkout data = json.data.cart or json.data.total
        }).catch((err)=>{
            res.send("There was an error getting total: " +err);
        });
    })
    .catch((err)=>{
        res.send("There was an error: " + err );
    });
});


//AJAX route to remove item by name. Replies back with total and list of items. 
app.post("/removeItem", ensureLogin, (req,res)=>{ //return the cart to re-render the page
    var cartData = {
        cart:[],
        total:0
    } ;
    cart.removeItem(req.body.name).then(cart.checkout) //cart.checkout is a function
    .then((inTotal)=>{
        cartData.total = inTotal; 
        cart.getCart().then((items)=>{
           cartData.cart = items; 
           res.json({data: cartData}); //will contain both whats in the cartData as well as cart, note userCart in cart.js has everything
        }).catch((err)=>{res.json({error:err});});
    }).catch((err)=>{
        res.json({error:err});
    })
});

//final webpages of A5
app.get("/orderFinished", ensureLogin, (req,res) =>{
    var cartData = {
        cart:[],
        total:0
    };
    cart.getCart().then((items)=>{
        cartData.cart = items;
        cart.checkout().then((total)=>{
            cartData.total = total;
            console.log("Final checkout price: ")
            console.log(cartData.total);

            let finalCheckoutValues = [];
            finalCheckoutValues = cart.finalCheckout(cartData, req.session.user); //will send an email
            console.log("Final Checkout Values: ");
            console.log(finalCheckoutValues);
            cart.deleteCart(); //WILL DELETE ALL ORDERS FROM USERCART IN CART.JS
            res.render("confirmedOrder", {
                users: req.session.user,
                data: finalCheckoutValues,
                Total: cartData.total,
                layout: false
            }); //sending in cartData as Data; therefore, at checkout data = json.data.cart or json.data.total
        }).catch((err)=>{
            res.send("There was an error getting total: " +err);
            res.render("checkout")
        });
    })
    .catch((err)=>{
        res.send("There was an error: " + err );
        res.render("orders");
    });
})


app.use((err, req, res, next) => {
    console.log(err.message);
    res.status(500).render("addmp", {message:`Cannot upload non-images files!`})
});

