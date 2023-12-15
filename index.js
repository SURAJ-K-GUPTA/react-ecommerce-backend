const express = require("express");
const server = express();
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const cookieParser = require('cookie-parser')

const productsRouters = require("./routes/Products");
const categoriesRouter = require("./routes/Categories");
const brandsRouter = require("./routes/Brands");
const usersRouter = require("./routes/Users");
const authRouter = require("./routes/Auth");
const cartRouter = require("./routes/Cart");
const ordersRouter = require("./routes/Orders");
const { User } = require("./model/User");
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");

const SECRET_KEY = "SECRET_KEY";
const token = jwt.sign({ foo: "bar" }, SECRET_KEY);
// JWT options


const opts = {};
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.jwtFromRequest = cookieExtractor
opts.secretOrKey = SECRET_KEY; // TODO: should not ne in code;

//middelewares

server.use(express.static('build'))
server.use(cookieParser())
server.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

server.use(passport.authenticate("session"));

server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);
server.use(express.json()); // to parse req.body
server.use("/products", isAuth(), productsRouters.router); // we can also use JWT token for client-only auth
server.use("/categories", isAuth(), categoriesRouter.router);
server.use("/brands", isAuth(), brandsRouter.router);
server.use("/users", isAuth(), usersRouter.router);
server.use("/auth", authRouter.router);
server.use("/cart", isAuth(), cartRouter.router);
server.use("/orders", isAuth(), ordersRouter.router);

// Passport Strategies
passport.use(
  "local",
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    //by default passport uses username
    try {
      const user = await User.findOne({ email: email });
      // TODO : this is just temporary, we will use strong password auth
      if (!user) {
        return done(null, false, { message: "invalid credentials" }); //for safety
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
            if (err) {
                return done(err);
              }

              
              if (!crypto.timingSafeEqual(Buffer.from(user.password, 'base64'), hashedPassword)) {
                return done(null, false, { message: "invalid credentials" });
              }
          const token = jwt.sign(sanitizeUser(user), SECRET_KEY);

          // done(null, {token}); // this line sends to serializer
          done(null, {id:user.id, role:user.role}); // this line sends to serializer
        }
      );
    } catch (error) {
      done(error);
    }
  })
);
passport.use(
  "jwt",
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, sanitizeUser(user)); // this calls serializer
      } else {
        return done(null, false);
        // or you could create a new account
      }
    } catch (error) {
      return done(err, false);
    }
  })
);
// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, sanitizeUser(user));
  });
});
// this changes session variable req.user on being called from authorized request
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

main()
  .then(console.log("DB Connected"))
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/react-ecommerce");
}

server.listen(8080, () => {
  console.log(`Server Started at PORT 8080`);
});
