const   express = require("express"),
        app = express(),
        bodyParser = require("body-parser"),
        methodOverride = require("method-override"),
        expressSanitizer = require("express-sanitizer"),
        mongoose = require("mongoose");
        
//app config        
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//connect to mongodb
mongoose.connect("mongodb://localhost:27017/restful_blog", {useNewUrlParser: true});
//CREATE BLOG SCHEMA AND MODEL
var blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

//make NEW BLOG
/*Blog.create({
    title: "German Shepherd Love",
    image: "https://pixabay.com/get/eb31b9092af61c22d2524518b7444795ea76e5d004b0144297f6c778aee4b1_340.jpg"
});*/

//make restful "INDEX" GET ROUTES
app.get("/", function(req, res){
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err) return console.error(err);
        res.render("index", {blogs: blogs});
    });
});

//create restful "NEW" GET routes
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//make restful "CREATE" POST route fROM NEW "GET"
app.post("/blogs", function(req, res){
    //sanitize blog
    req.body.blog.title = req.sanitize(req.body.blog.title);
    req.body.blog.image = req.sanitize(req.body.blog.image);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //create blog
    Blog.create(req.body.blog,
        function(err, newBlog){
           if(err) return console.error(err);
           //redirect to the INDEX page
           res.redirect("/blogs");
    });
});

//make restful "SHOW" GET route
app.get("/blogs/:id", function(req, res){
    
    //grab the GET request id
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err) {
            console.error(err); 
            res.redirect("/blogs");
            //render show template
        }else {
            res.render("show", {blog: foundBlog});
        }
    });
});

//add "EDIT" GET Route
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.error(err);
            res.redirect("/blogs/:id");
            //render edit template
        }else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//add "UDPDATE" GET Route
app.put("/blogs/:id", function(req, res){
        //sanitize blog
    req.body.blog.title = req.sanitize(req.body.blog.title);
    req.body.blog.image = req.sanitize(req.body.blog.image);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //update blog
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            console.error(err);
            res.redirect("/blogs");
            //redirect to the edited show page
        }else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
    
});

//add "DELETE" GET Route
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/blogs");
        }else {
            res.redirect("/blogs");
        }
    });
});

app.listen(8081, function(){
    console.log("RESTFUL SERVER HAS STARTED!!!");
});