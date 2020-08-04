//start off with the cart empty. 
var userCart = [];

//adds a item from systems to the cart
module.exports.addItem = (inItem)=>{
    console.log("Adding cart" + inItem.name);
    return new Promise((resolve,reject)=>{
        userCart.push(inItem);
        resolve(userCart.length); //replies back the length (so the Cart will display Cart #)
    });
}

//removes an item from the cart
module.exports.removeItem = (inItem)=>{
    return new Promise((resolve,reject)=>{
        for(var i = 0; i< userCart.length; i++){
            if(userCart[i].name == inItem){
                userCart.splice(i,1); //if it has same name, cut it OUT of array
                i = userCart.length;
            }
        }
        resolve();
    });
}

module.exports.checkout = ()=>{
    return new Promise((resolve, reject)=>{
        var price=0;//basically resets price back to 0 everytime checkout is called, handy in retrieving 
        if(userCart){
            userCart.forEach(x => {
                price += x.price;
            });
        }
        price = parseFloat(price).toFixed(2);
        resolve(price);
    });
}

module.exports.getCart = ()=>{
    return new Promise((resolve, reject)=>{
            resolve(userCart); //CANNOT USE GETMEALPACKAGE, as this function allows for userCart to be sent back NOT just the meal packages
    });
}

module.exports.deleteCart = () => {
    return new Promise((resolve, reject)=>{
        userCart = []; //WILL ERASE array
        resolve(); //CANNOT USE GETMEALPACKAGE, as this allows for userCart to be sent back NOT just the meal packages
});
}

module.exports.finalCheckout = (finalCart, User) => {
    //Pseudo code:
    //The function should send an email to the logged in user's email (all information should be in user as being sent as sessions)
    //Indicates all the packages purchased in the email (all in userCart)
    //Quantity amount for each meal package purchased, as well as total (all of this in userCart):
        //Loop through all of userCart to find unique names and store in a name array[] --> should only store unique name
        //Create a parallel array with our name array[], loop through userCart and compare to name Array
    let name = []
    console.log("User Cart Names: ");
    if(userCart){
        userCart.forEach(x => {
            name.push(x.name);
        });
    }
    console.log(name);
    let uniqueNames = [...new Set(name)];//creates our array of uniqueNames
    console.log("Unique Names");
    console.log(uniqueNames);

    let quantity = [];
    let price = [];
    for(let i=0; i < uniqueNames.length; i++)
    {
        let count = 0;
        let inputPrice = 0;
        for(let j=0; j < userCart.length; j++)
        {
            if(uniqueNames[i] == userCart[j].name)
            {
                count++;
                inputPrice += userCart[j].price;
            }
        }
        console.log("Input Price: ");
        console.log(inputPrice);
        quantity.push(count); //each quantity will then be
        price.push(inputPrice);
    }

    console.log("Unique Names: ");
    console.log(uniqueNames);
    console.log("Quantity: ");
    console.log(quantity);
    console.log("Price: ");
    console.log(price);

    let finalInput = [];

    let z = 0;
    for(z = 0; z < uniqueNames.length; z++)
    {
        finalInput.push
        ({
            UniqueName: uniqueNames[z],
            Quantity: quantity[z],
            Price: price[z]
        })
    }
    // console.log("Final Input");
    // console.log(finalInput);

    // let finalPrice;
    // console.log("Final Total:")
    // finalPrice = finalCart.total;    //achieve final price     
    // console.log(finalPrice);
    console.log("Checking Final Input")
    console.log(finalInput);
    return finalInput;

    // const sgMail = require('@sendgrid/mail');

    // sgMail.setApiKey("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");
    // const msg = {
    //     to: `${User.Email}`,
    //     from: "newn.law123@gmail.com",
    //     subject: 'Welcome Email Web322:Assignment 2',
    //     html: `Customer's's Full Name: ${User.firstName} ${User.lastName} <br>
    //            Order Summary: <br>
    //            Total: ${finalPrice}
    //            ${finalInput}`
    // };
    // sgMail.send(msg)
    // .then(()=>{
    //     //res.redirect("/") 
    //     console.log("Email sent!");
    // })
    // .catch(err=>{
    //     console.log(`Error ${err}`);
    // })
}