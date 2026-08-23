import mongoose from "mongoose";
import bcrypt from bcrypt;

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: [true, "Email is required"],
        unique : true
    },
    password : {
        type : String,
        required: [true, "password is required"]
    }
})

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model("Users", userSchema);