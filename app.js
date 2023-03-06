const express = require("express");
const bodyParser=require("body-parser");
const date = require(__dirname +  "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");
mongoose.set("strictQuery", false);
mongoose.connect('mongodb+srv://vinay29k:BLACKops@cluster0.3bohyml.mongodb.net/todoListDB',{ useNewUrlParser: true });


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

// const items=["Buy Food","Cook Food","Eat Food"];
// const work = [];
const itemSchema = new mongoose.Schema({
    name: String,
})
const listSchema = new mongoose.Schema({
    name: String ,
    items:[itemSchema],
})

const List = mongoose.model("List",listSchema);
const Item = mongoose.model("Item",itemSchema);
const item1 = new Item({
    name:"Welcome to your todoList"
})
const item2 = new Item({
    name:"Click + to add a new Item"
})
const item3 = new Item({
    name:"Click delete to delete an item"
})

const defaultItems = [item1,item2,item3];

app.get("/",function(req,res){

    let day = date.getDay();
    Item.find({},function(err,foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully added ");
                }
            })

            res.redirect("/");
        }
        else{
            res.render("list",{listTitle:day , newlistitems:foundItems})
        }
    })
    
    
})

app.get("/:customListName",function(req,res){
    const customListName =  _.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,found){
        if(!err){
            if(!found){
                const list = new List({
                    name : customListName,
                    items : defaultItems,
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                res.render("list",{listTitle: found.name, newlistitems: found.items});
            }
        }
        
        
    })

    
})

app.post("/",function(req,res){
    let day = date.getDay();
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name:itemName
    })

    if(listName=== day){
        item.save();
    res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }

    
   
   
})

app.post("/delete", function(req, res) {
    let day = date.getDay();
  
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName===day){
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (!err) {
              console.log("Seccessefully deleted checked item.");
              res.redirect("/");
            } else {
              console.log(err);
            }
          });
         
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
    
    
  });


app.get("/about",function(req,res){
    res.render("about")
})

app.listen(port,function(){
    console.log("Server is running on port 3000");
})