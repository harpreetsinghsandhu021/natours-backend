const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const stripe = require("stripe")(
  "sk_test_51MVDk7SJNwQAwY18OXV6ErQY56nW70WI6Fd9N2B3qY7G23XzI6PF2Tl6ehpqVqlazCikaQq5SgK19y0qFCKXq7zy00WjbeNeo4"
);
const catchAsync = require("../utils/catchAsync");
const Tour = require("../models/tourModel");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://localhost:3000/tour/${tour.slug}?`,
    cancel_url: `${req.protocol}://localhost:3000/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.description,
            images: [`http://localhost:8000/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

async function createBookingCheckout(session) {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.line_items[0].amount / 100;
  await Booking.create({ tour, user, price });
}

exports.webhookBooking = async (req, res, next) => {
  console.log(req.headers["stripe-signature"]);

  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      "whsec_8552bdb6f22688cc41d6c328dd17b30b7974a0f65c84a03d26cbbd28f2975ba5"
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};
