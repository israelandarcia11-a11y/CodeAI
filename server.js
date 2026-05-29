require("dotenv").config();

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());

/* =========================
   TEST ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("CodeAI Backend funcionando 🚀");
});

/* =========================
   CREATE STRIPE CHECKOUT
========================= */

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

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

      success_url: "https://https://israelandarcia11-a11y.github.io/CodeAI//success.html",
      cancel_url: "https://https://israelandarcia11-a11y.github.io/CodeAI//cancel.html"
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   START SERVER (RENDER SAFE)
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT} 🚀`);
});
