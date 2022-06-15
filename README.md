# Node-JS-Full-Stack-Restaurant-Project
[Project Link](https://node-js-restaurant-project.herokuapp.com/)
## About
This Restasurant Application displays a list of top foods that I've declared.
In this restaurant application it will also show orders for users to buy certain products and has a working cart functionality for items.
This project also has features for login and registration of users, and has a dashboard to determine if user is an admin or a regular customer.
If the user is an admin, the user can also add products to our restaurant application. Each user has a certain amount of time/session to stay logged in as well.

## Description
In this application we utilize full-stack development with NodeJS (using ES5 and ES6) with front-end views controlled by express-handlebars, with middle-ware logic to handle any login/registrations/adding product/etc., with back-end development being interactions with MongoDB for any product functionality.
Back-end functionality includes the user information and the meal package, and is called based on routes that the user accesses as well as certain functions that the user can interact with (ex. addProduct).
The flow of data in summary is that server.js handles all routing functionality. Once a specific url is stated, the app will load in data from our back-end database and render in the correct view on handlebars for the user.
This application utilizes an MVC format, with models handled in our database, views handled in our express-handlebars, and controllers handled in our db.js when interacting with our database.

Packages used:
- express
- file
- body-parser
- express-handlebars
- client-sessions
- multer (for storing of images)

