import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

interface PaymentOrder {
  amount: number;
  amount_due: number;
  amount_paid: number;
  attempts: number;
  created_at: number;
  currency: string;
  entity: string;
  id: string;
  notes: [];
  offer_id: null;
  receipt: string;
  status: string;
}

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
    document.body.style.backgroundColor = "#000000"
    console.log(document.body)
  });
};

function RazarpayPayment() {
  const { userData: user } = useSelector((state: any) => state.user);

  const navigate = useNavigate();
  const location = useLocation();
  const { amount, showId } = location.state as {
    amount: number;
    showId: string;
  };

  const handlePayment = async () => {
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Please try again.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}/payment/create`,
        {
          amount,
          currency: "INR",
          receipt: "receipt_1",
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
          withCredentials: true,
        },
      );

      const order = response.data.data as PaymentOrder;

      const api_key = import.meta.env.VITE_ROZARPAY_TEST_API_KEY;

      const options = {
        key: api_key,
        amount: order.amount,
        currency: order.currency,
        name: "Book my ticket",
        description: "Test Transaction",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_ENDPOINT}/payment/verify`,
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
              {
                headers: { authorization: `Bearer ${user.token}` },
                withCredentials: true,
              },
            );

            if (verifyResponse.status === 200) {
              console.log(response.razorpay_payment_id)
              navigate(`/shows/${showId}`, { state: { paymentStatus: true, paymentId: response.razorpay_payment_id } });

              const successMessage = document.createElement("div");
              successMessage.className =
                "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out flex items-center";
              successMessage.innerHTML = `
                  <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="font-semibold">Payment Successful!</span>
                  `;
              document.body.appendChild(successMessage);
              setTimeout(() => {
                successMessage.remove();
              }, 3000);
            } else {
              alert("Payment verification failed!");
            }
          } catch (error) {
            console.error("Verification failed", error);
            const errorMessage = document.createElement("div");
            errorMessage.className =
              "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out flex items-center";
            errorMessage.innerHTML = `
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span class="font-semibold">Payment Failed! Please try again.</span>
              `;
            document.body.appendChild(errorMessage);
            setTimeout(() => {
              errorMessage.remove();
            }, 3000);
          }
        },
        prefill: {
          name: "aman",
          email: "amansaluja017@gmail.com",
          contact: "9306234357",
        },
        theme: { color: "#010101" },
      };

      const razor = new (window as any).Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Payment failed", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010101]">
      <div className="bg-slate-200 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Payment Details
        </h2>
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Amount to Pay:</p>
          <p className="text-3xl font-bold text-gray-800">₹{amount}</p>
        </div>
        <button
          onClick={handlePayment}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 ease-in-out flex items-center justify-center"
        >
          <span>Pay Now</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Secured by Razorpay
        </p>
      </div>
    </div>
  );
}

export default RazarpayPayment;
