import React from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const PayPalButton = ({ amount, onSuccess, onError }) => {

  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  return (
    <PayPalScriptProvider
      options={{
        "client-id": clientId,
        currency: "USD",
        intent: "capture"
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}

        createOrder={(data, actions) => {
          console.log("Creating order:", amount);

          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toString() // 🔥 IMPORTANT FIX
                }
              }
            ]
          });
        }}

        onApprove={(data, actions) => {
          console.log("Approved:", data);

          return actions.order.capture().then((details) => {
            console.log("Captured:", details);
            onSuccess(details);
          });
        }}

        onError={(err) => {
          console.log("PayPal error:", err);
          onError(err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
