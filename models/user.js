 const mongoose = require('mongoose');
 const bcrypt = require("bcrypt");

 // Define the user schema
 const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String

    },
    address:{
        type:String,
        required:true
    },
    addharCardNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['admin','voter'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }
  });
  

  
userSchema.pre("save",async function(next){
    const person = this;
    if(!person.isModified("password")) return next();
      try {
        //generating salt
  
        const salt = await bcrypt.genSalt(10);
  
        // hashing password
        const hashPassword = await bcrypt.hash(person.password,salt);
        // override the plain text with hashed password
        person.password = hashPassword;
        next();
      } catch (error) {
        return next(error);
      }
  })
  
  
  userSchema.methods.comparePassword = async function(candidatePassword){
      try {
        const isPasswordMatch = await bcrypt.compare(candidatePassword, this.password);
        return isPasswordMatch; 
        // salt + password = hash = stored hash if match then return true;
      } catch (error) {
        throw error;
      }
  }

  
  const User = mongoose.model('User', userSchema)
  module.exports = User;