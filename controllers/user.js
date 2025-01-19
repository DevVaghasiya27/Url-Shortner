const {v4: uuidv4} = require("uuid");
const User = require("../models/user");
const {setUser} = require("../service/auth");

async function handleUserSignup(req, res) {
    const { name, email, password, role } = req.body;
    await User.create({
        name,
        email,
        password,
        role,
    });
    return res.redirect("/login");  
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if(!user) 
        return res.render("login", {
            error: "Invalid Username or Password"
        });
    
    const token = setUser(user);
    // console.log("=====================token======================="+token);
    res.cookie("token", token);
    return res.redirect("/"); 
    // return res.json({token})
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
};