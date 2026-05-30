const express = require("express");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "CodeAI Plus" },
            unit_amount: 499,
          },
          quantity: 1,
        },
      ],
      success_url: "https://israelandarcia11-a11y.github.io/CodeAI/success.html",
      cancel_url: "https://israelandarcia11-a11y.github.io/CodeAI/",
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/get-plan", (req, res) => {
  res.json({ plan: "free" });
});

app.listen(process.env.PORT || 10000, () => {
  console.log("Servidor corriendo en puerto 10000 🚀");
});
