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
server.use(express.raw({type: 'application/json'}))
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

// Payments

// This is your test secret API key.
const stripe = require("stripe")('sk_test_51ONgfFSDhB1iNrv7LFhYVPSoAkGEui6Tj5tnIYWzKnNbV8CPgiK0p1fRwqXuTc5sYMWkz5uR50gEZ7c0jkaNk9kD008vkfHfyF');


const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400; // this is 14.00
};

server.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "inr",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});


// Webhook

// TODO: we will capture actual order after deploying out server live on public URL
// This is your test secret API key.
// const stripe = require('stripe')('sk_test_51ONgfFSDhB1iNrv7LFhYVPSoAkGEui6Tj5tnIYWzKnNbV8CPgiK0p1fRwqXuTc5sYMWkz5uR50gEZ7c0jkaNk9kD008vkfHfyF');
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = 'whsec_7285fc3dee9a062c58b748163bb4ed6b0a0a7bf06c702e30c09ffed4228ba83e';
// const express = require('express');
// const app = express();

server.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  let event = request.body;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log({paymentIntent})
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

// app.listen(4242, () => console.log('Running on port 4242'));




// main
main()
  .then(console.log("DB Connected"))
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/react-ecommerce");
}

server.listen(8080, () => {
  console.log(`Server Started at PORT 8080`);
});