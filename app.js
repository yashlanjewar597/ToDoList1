//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

const mongoose = require("mongoose");

uri = process.env.URI;

async function run() {

    await mongoose.connect("mongodb+srv://yashlanjewar597:yash@cluster0.f8sxdog.mongodb.net/todolists?retryWrites=true&w=majority");
    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  run().catch(err => console.log(err));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name:String
});

const listSchema = new mongoose.Schema({
  name:String,
  items : [itemsSchema]
});

const List = mongoose.model("List", listSchema)

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"Task1"
});

const item2 = new Item({
  name:"Task2"
});

const item3 = new Item({
  name:"Task3"
});



app.get("/", function(req, res) {

  Item.find().then(function(data){

    if (data.length === 0){
      Item.insertMany([item1,item2,item3]);
    }
    res.render("list", {listTitle : "Today", newListItems: data});
    

  }).catch(err => console.log(err));

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const postlist = req.body.list;
  
  const NewItem = new Item({
    name:item
  });
  
  if(postlist === "Today"){
      NewItem.save();
      res.redirect("/");
  }else{
    List.findOne({name:postlist}).then(function(data){
      data.items.push(NewItem);
      data.save();
      res.render("list", {listTitle : data.name, newListItems: data.items});
    });
  }
});

app.post("/delete", async function(req, res) {
  try {
    const obj_id = req.body.checkbox;
    const ListName = req.body.HiddenName;
    
    if(ListName === "Today"){  
      await Item.findByIdAndDelete(obj_id);
      res.redirect("/");
    }else{
      List.findOneAndUpdate({name:ListName},{$pull:{items:{_id:obj_id}}}).then(function(data){
        res.redirect("/" + ListName);
      });
    }}
   catch (error) {
    console.log(error);
  }
});

app.get("/:List", function(req,res){
  listname = req.params.List;
  
  List.findOne({name:listname}).then(function(data){
    if(!data){
      const list = List({
        name:listname,
        items:[item1,item2,item3]});
        list.save();
        res.redirect("/" + listname);
    }else{
      res.render("list",{listTitle : listname , newListItems: data.items})
    }
    
  })
  
  });
 


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
