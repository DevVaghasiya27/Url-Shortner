const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const {connectToMongoDB} = require("./connect.js");
const {checkForAuthentication, restrictTo } = require("./middlewares/auth.js")
const URL = require("./models/url.js");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter.js");
const userRoute = require("./routes/user.js");

const app = express();
const PORT = 8001;

// connection
connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(() => 
    console.log("Mongodb connected!")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"))

// middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthentication);  

// Routes
app.use("/url", restrictTo(["NORMAL", "ADMIN"]), urlRoute);    
app.use("/user", userRoute);    
app.use("/", staticRoute);

app.get("/url/:shortId", async(req,res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            $push: {
                visitHistory: {
                    timestamps: Date.now(),
                },
            },
        }
    );  
    res.redirect(entry.redirectURL);
});

// Start the server
app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`))