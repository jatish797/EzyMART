const port=4002;
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const jwt=require("jsonwebtoken");
const multer=require("multer");
const path=require("path");
const cors=require("cors");
const { error } = require("console");

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/EzyMart")
//middle ware 

const authMiddleware = (req, res, next) => {
    
    const token = req.header('auth-token');
    console.log(token);

    
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {

        const decoded = jwt.verify(token,'secret-ecom');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

app.get("/",(req,res)=>{
    res.send("Express is running")

})
app.get('/', async (req, res, next) => {
    try {
      let html = fs.readFileSync(path.resolve(root, 'index.html'), 'utf-8')
  
      // Transform HTML using Vite plugins.
      html = await viteServer.transformIndexHtml(req.url, html)
  
      res.send(html)
    } catch (e) {
      return next(e)
    }
  })

// image storage engine

const storage=multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)

    }
})

const upload=multer({storage:storage})
// upload endpoint for images
app.use('/images',express.static('upload/images'))
app.post("/upload",upload.single('product'),(req,res)=>{
    console.log(req.file.filename);
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})
// schema for craeting project 
const Product=mongoose.model("Product",{
    
    name:{
        type:String,
        required:true,
     
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,

    },
    old_price:{
        type:Number,
        required:true,

    },
    date:{
        type:Date,
        default:Date.now,

    },
    available:{
        type:Boolean,
        default:true,

    },
})

app.post('/addproduct',async(req,res)=>{
  
    console.log("hello");
    console.log(req.body);
    const product=new Product({
        
     
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,


    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })

})

// creating api for deleting products

app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({_id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name,
    })
})

//creating API for getting all products
app.get('/allproducts',async(req,res)=>{
    let products=await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})




const productSubSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    products: [productSubSchema],
    date: {
        type: Date,
        default: Date.now
    }
});

const Cart = mongoose.model('Cart', cartSchema);





const deleteFromCart = async (req,res) => {
    
    try {
        const userId=req.user.id;
        const {productId}=req.body;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            res.json({
                success:false,
                message:"cart not found"

            })
        }

        cart.products = cart.products.filter(p => p.productId.toString() !== productId);

        await cart.save();
        res.json({
            success:true,
            message:"deleted",
            cart

        })
    } catch (error) {
        console.log(error.message);

    }

};

const getCart = async (req,res) => {
    try {
        const userId=req.user.id;
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        console.log(cart);
        if (!cart) {
            throw new Error('Cart not found');
        }
        res.json({
            success:true,
            message:"got",
            cart

        })
        
    } catch (error) {
        console.log(error.message);
        
    }
};

const checkout = async (req,res) => {
    try {
        const {userId}=req.body;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            res.json({
                success:false,
                message:"cart not found"
            
            })
            
        }

        // Implement your checkout logic here
        // For example, create an order, charge the user, etc.

        // Clear the cart after checkout
        await Cart.deleteOne({ userId });
        res.json({
            success:true,
            message:"checkout",

        })
        
    } catch (error) {
        console.log(error.message);
    }
};

app.get("/getcart",authMiddleware,getCart);
app.post("/addcart",authMiddleware,async (req,res) => {
    
    try {
        const { productId, price, quantity}=req.body;
        const userId=req.user.id;
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, products: [{ productId, price, quantity }] });
        } else {
            const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId);

            if (existingProductIndex >= 0) {
                cart.products[existingProductIndex].quantity += quantity;
                cart.products[existingProductIndex].price = price;
            } else {
                cart.products.push({ productId, price, quantity });
            }
        }

        await cart.save();
        return res.status(200).send({
            success:true,
            message:"added",
            cart
        })
      
    } catch (error) {
        console.log(error.message);
    }
});
app.post("/deletecart",authMiddleware,deleteFromCart);
app.post("/cartcheckout",authMiddleware,checkout);

// schema creation for users
const Users=mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    // cartData:{
    //     type:Object,
    // },
    date:{
        type:Date,
        default:Date.now,

    }
})
// creating end point for registering the user
app.post('/signup',async(req,res)=>{
    let check=await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with same email address"});
    }
    // let cart={}
    // for(let i=0;i<300;i++){
    //     cart[i]=0;
    // }
    const user=new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        // cartData:cart,
    })
    await user.save();
    const data={
        user:{
            id:user.id
        }

    }
    const token=jwt.sign(data,'secret-ecom');
    res.json({success:true,token})
})

//creating endpoint for user login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(data, 'secret-ecom'); // Ensure consistency with 'secret-ecom'
            res.json({ success: true, token });
        } else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    } else {
        res.json({ success: false, errors: "Wrong Email Id" });
    }
});



//creating endpoint for newcollection data
app.get('/newcollections',async(req,res)=>{
    let products=await Product.find({});
    let newcollection=products.slice(1).slice(-8);
    console.log("new collection fetched");
    res.send(newcollection);
})
//creating end point for popular in women section
app.get('/popularinwomen',async(req,res)=>{
    let products =await Product.find({category:"women"});
    let popular_in_women=products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})
// creating endpoint for adding products in cartdata
// app.post('/addtocart',async(req,res)=>{
//     console.log(req.body);
// })
app.listen(port,(error)=>{
    if(!error){
        console.log("server running on port "+port);
    }
    else{
        console.log("Error : "+error);
    }
})



