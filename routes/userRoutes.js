const express = require("express");
const router = express.Router();
const User = require("../models/user");
const {jwtAuthMiddleware, generateToken} = require("./../jwt");
const Candidate = require("../models/candidate");

router.post("/signup", async (req, res) => {
  try {
    const data = req.body; // assuming that body parser store the data at req.body
    const newUser = new User(data);

    // save user data to the database

    const response = await newUser.save();
    console.log(" User Data Saved");
    const payload = {
      id:response.id // user name contain the addhar card number(sensitive data)
    }
    const token = generateToken(payload);
    console.log("Token Generated", token);
    
    res.status(200).json({response:response,token:token});

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: " Internal Server Error" });
  }
});

// login route method for the person data
router.post("/login", async(req,res)=>{
    try {
      // extract pas and addharCardNumber as username from req body
      const {addharCardNumber,password} = req.body;
      //find user
      const user = await User.findOne({addharCardNumber:addharCardNumber});
      if(!user || !(await user.comparePassword(password))) return res.status(401).json({error:"Invalid username or apssword"});

      // generate token
      const payload = {
        id : user.id
      }

      const token = generateToken(payload);

      res.status(200).json({token:token});

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: " Internal Server Error" });
    }
})
// profile route
 router.get("/profile", jwtAuthMiddleware, async(req,res)=>{
      try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json(user);
        
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: " Internal Server Error" });
      }
 })




// update person data

router.put("/profile/password",jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user; // extract the id(id assigned by mongodb) from the token
   const {currentPassword,newPassword} = req.body;

    // find the user by userId
    const user = await User.findById(userId);

    // if password doesnot match then return error
    if(!user.comparePassword(currentPassword)){
      return res.status(401).json({error:"Invalid Password"});
    }
    // update the password 
    user.password = newPassword;
    await user.save();

    console.log("Password Updated");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: " Internal Server Error" });
  }
});




module.exports = router;
