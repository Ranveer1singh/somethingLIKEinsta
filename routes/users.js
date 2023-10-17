var mongoose = require("mongoose");
var PLM = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/my-app");


var userSchema = mongoose.Schema({
  username : String,
  password : String,
  age : Number,
  email : String,
  image: {
    type: String,
    default: "def.png"
  },
  post : [
    {type : mongoose.Schema.Types.ObjectId,
    ref: 'post'  }
]
})

userSchema.plugin(PLM);

module.exports = mongoose.model('user',userSchema);