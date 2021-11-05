import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(
  "mongodb://localhost:27017/myloginDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("DB connected");
  }
);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

const client = new OAuth2Client("1011870679214-0vnm9tq196n9roo85bej42d92cv39n06.apps.googleusercontent.com");

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      if (password === user.password) {
        res.send({ message: "Login Successfull", user: user });
      } else {
        res.send({ message: "Password didn't match" });
      }
    } else {
      res.send({ message: "User not registered" });
    }
  });
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ message: "User already registerd" });
    } else {
      bcrypt.hash(password, 12)
      .then(hashedpassword => {
      const user = new User({
        name,
        email,
        password:hashedpassword,
      });
      user.save((err) => {
        if (err) {
          res.send(err);
        } else {
          res.send({ message: "Successfully Registered, Please login now." });
        }
      });
    })
    }
  });
});




app.post('/googlelogin', (req,res) => {
  const {tokenId} = req.body;

  client.verifyIdToken({idToken: tokenId, audience: "1011870679214-0vnm9tq196n9roo85bej42d92cv39n06.apps.googleusercontent.com"}).then(res => {
    const {email_verified, name, email} = res.payload;
    if(email_verified) {
      User.findOne({email: email}, (err, user) => {
        if(err) {
          res.send({message: "Something went wrong..."})
        } else {
          if(user){
           if  (password === user.password) {
            res.send({ message: "User already registerd",  user: data });
          } else {
            let password = user.password;
            let newUser = new User ({name, email, password});
            newUser.save((err, data) => {
              if (err) {
                res.send({message: "Something went wrong..."})
              } else {
                if(data){
                  res.send({ message: "User registerd",  newUser: newUser });
                }
              }
            })
          }
        }}
      }
    )}
  })
  console.log()
})



app.listen(9002, () => {
  console.log("BE started at port 9002");
});