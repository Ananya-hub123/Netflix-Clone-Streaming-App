const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/UserRoutes")

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://ananyashetty069:psEOHTdzz1TogaMQ@cluster0.tlpxhsa.mongodb.net/Netflix-Clone?retryWrites=true&w=majority&appName=Cluster0",{
    useNewUrlParser: true,
    useUnifiedTopology:true,
})
.then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/user",userRoutes);

app.listen(5000,console.log("server started"));