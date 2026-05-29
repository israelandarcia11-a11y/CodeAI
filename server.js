
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   TEST
========================= */

app.get("/", (req, res) => {
res.send("Backend CodeAI funcionando 🚀");
});

/* =========================
   CREATE CHECKOUT
========================= */

app.post("/create-checkout-session", async (req, res) => {

try {

const session = await stripe.checkout.sessions.create({

payment_method_types: ["card"],

line_items: [
{
price_data: {
currency: "usd",
product_data: {
name: "CodeAI Plus"
},
unit_amount: 499 // 4.99$
},
quantity: 1
}
],

mode: "payment",

success_url: `${process.env.DOMAIN}/success.html`,
cancel_url: `${process.env.DOMAIN}/cancel.html`

});

res.json({ url: session.url });

} catch (err) {
res.status(500).json({ error: err.message });
}

});

/* =========================
   START
========================= */

app.listen(3000, () => {
console.log("Servidor en http://localhost:3000");
});