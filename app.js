const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://darkdrago46:soumik11c26@cluster0.pcza1.mongodb.net/todolistDB");
const itemsSchema = new mongoose.Schema({
    name : String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name : "Playing Video Games"
});

const item2 = new Item({
    name : "Coding"
});

const item3 = new Item({
    name : "Rapping"
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name : String,
    items : [itemsSchema]
});

const List = mongoose.model("list",listSchema);


app.get("/",function(req,res){
    
    Item.find(function(err,items){
        if(err){
            console.log(err);
        }
        else{
            if(items.length === 0){
               Item.insertMany(defaultItems,function(err){
                   if(err){
                       console.log(err);
                   }
                   else{
                       console.log("Successfully saved default items into the DB");
                   }
               }) 
            }
            res.render("list",{listTitle:"Today",item:items});
        }
    }); 
});

app.get("/:topic",function(req,res){  //Dynamic Routing
    
    const listName = _.capitalize(req.params.topic);
    
    List.findOne({name : listName},function(err,list){
        if(!err){
            if(!list){
                //Creating new List if doesnt exist
                const list = new List({
                    name : listName,
                    items : defaultItems
                });
                list.save();
                res.redirect("/" + listName);
            }
            else{
                //Render existing list
                res.render("list",{listTitle:list.name,item:list.items});
            }
        }
    })

});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const list = req.body.list;
    const itemNew = new Item({
        name : itemName
    });
    
    if(list === "Today"){
       
        itemNew.save();
        res.redirect("/");
    }
    else{
        List.findOne({name : list},function(err,listFound){
            if(!err){
                listFound.items.push(itemNew);
                listFound.save();
                res.redirect("/"+list)
            }
        });
    }
});


app.post("/delete",function(req,res){
    const itemDelete = req.body.checkBox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.deleteOne({_id:itemDelete} , function(err){
            if(err){
            console.log(err);
            }
            else{
            console.log("Record Deleted Successfully");
            }
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name : listName},{$pull:{items:{_id:itemDelete}}},function(err,foundList){
            if(!err){
                console.log("Item removed from list successfully");
                res.redirect("/" + listName);
            }
        })
    }
});

let port = process.env.PORT;
if(port== null || port == ""){
    port=3000;
}

app.listen(port,function(){
    console.log("Server started at port 3000");
});
