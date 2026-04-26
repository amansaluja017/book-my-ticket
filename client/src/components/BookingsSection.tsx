import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

interface BookingType {
  amount: number;
  createdAt: string;
  paymentId: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
}

function BookingSection() {
  const { userData: user } = useSelector((state: any) => state.user);

  const [ticketsData, setTickets] = useState<BookingType[]>([]);

  useEffect(() => {
    async function fetchTickets() {
      const response = await axios.get(
        `${import.meta.env.VITE_API_ENDPOINT}/customer/bookings`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          withCredentials: true,
        },
      );
      setTickets(response.data.data);
    }

    fetchTickets();
  }, []);

  return (
    <SimpleBar
      autoHide={false}
      forceVisible="y"
      style={{ maxHeight: 600 }}
      className="rounded-[2rem] border border-slate-700 bg-slate-900/95 p-8 shadow-glow backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Your bookings
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-100">
            All bookings
          </h2>
        </div>
        <Link
          to="/"
          className="inline-flex items-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Browse shows
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {ticketsData.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((booking) => (
          <div
            key={booking.paymentId}
            className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-2 items-center">
                <p className="text-lg text-slate-400">Booking id: </p>
                <p className="text-xl text-slate-100">
                  {booking.paymentId}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-cyan-300">
                {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">Amount</p>
                <p className="mt-2 text-lg font-medium text-slate-100">
                  {booking.amount}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">Status</p>
                <p className="mt-2 text-lg font-medium text-slate-100">
                  {booking.paymentStatus === "success" ? "confirmed" : "waiting"}
                </p>
              </div>
            </div>
            <div className="text-end ">
              <Link to={`/tickets/${booking.paymentId}`} className="p-1">
                <p className="text-lg text-slate-500">View tickets</p>
              </Link>
            </div>
          </div>
          
          
        ))}
      </div>
    </SimpleBar>
  );
}

export default BookingSection;
