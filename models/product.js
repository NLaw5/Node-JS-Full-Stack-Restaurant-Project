const product =
{

    topMeals : [],
    
    initTopMeals() 
    {
        this.topMeals.push({
        Check: true,
        Image: `pho.jpg`,
        Name: `Vietnamese Pho`,
        Cost: `$12.00` 
       }),

       this.topMeals.push({
        Check: false,
        Image: `nasty.jpg`,
        Name: "Nasty Pizza",
        Cost: "$9999.99"
       }),

    
       this.topMeals.push({
        Check: true,
        Image: `burger.jpg`,
        Name: "Wagyu Burger",
        Cost: "$20.00"
       }),
       
       this.topMeals.push({
            Check: true,
            Image:  `sashimi.jpg`,
            Name: "24-Piece Sashimi",
            Cost: "$30.00"
       }),

       this.topMeals.push({
            Check: true,
            Image:`poke.jpg`,
            Name: "Poke Bowl",
            Cost: "$12.50"
       })
    },

    topMealPackages: [],

    initTopMealPackages() 
    {
        this.topMealPackages.push({
            Check: true,
            Image: `asianmp.jpg`,
            Name: `Asian Meal Package`,
            Desc: `High protein, with a mix of vegetables and calories for your 
            nutrition every day!`
       }),

       this.topMealPackages.push({
            Check: false,
            Image: `img/medimp.jpg`,
            Name: "Nasty Pizza PACKAGE",
            Desc: "You shouldn't be seeing this, if you do somethings wrong"
       }),

    
       this.topMealPackages.push({
           Check: true,
           Image: `medimp.jpg`,
           Name: "Mediterranean Meal Package",
           Desc: `Comes with the platter, extremely nutritious and a treat for all!`
       }),
       
       this.topMealPackages.push({
            Check: true,
            Image:  `amerplatter.jpg`,
            Name: `American Meal Plan`,
            Desc: `Extremely high protein, with high carbohydates and fats. A treat for those that want
            to cheat a bit on their diet!`
       }),

       this.topMealPackages.push({
            Check: true,
            Image: `japmp.jpg`,
            Name: `Japanese Meal Plan`,
            Desc: `High carb, high Protein and calorie portions to help support you in your life!`
       })
    },
    
    getAllProducts()
    {
        console.log("Testing getallProducts")
        let finalArray = [];

        for (let i=0; i < this.topMeals.length; i++)
        {
            if (this.topMeals[i].Check != false)
            {
                finalArray.push(this.topMeals[i]);
            }
            
        }
        return finalArray;
    },

    getAllMealPackages()
    {
        let finalArray = [];

        for (let i=0; i < this.topMealPackages.length; i++)
        {
            if (this.topMealPackages[i].Check != false)
            {
                finalArray.push(this.topMealPackages[i]);
            }
            
        }
        return finalArray;
    }

}

product.initTopMeals();
product.initTopMealPackages();
module.exports = product;

// Tested code with node before exportation, ignore 
//---------------------------------
// let Newman = [];
// let packages = [];
// Newman = product.getAllProducts();
// packages = product.getAllMealPackages();
// //console.log(Newman[0]);
// console.log(packages);




