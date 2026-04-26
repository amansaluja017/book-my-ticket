import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { calculateDuration } from "../pages/HomePage";

interface TicketType {
  createdAt: string;
  seatName: string;
  seatPrice: number;
  seatType: string;
  showDuration: string;
  showEnd: string;
  showName: string;
  showStart: string;
  ticketId: string;
}

function CustomerTicketsPage() {
  const { userData: user } = useSelector((state: any) => state.user);
  
  const { paymentId } = useParams();

  const [ticketsData, setTickets] = useState<TicketType[]>([]);

  useEffect(() => {
    async function fetchTickets() {
      const response = await axios.get(
        `${import.meta.env.VITE_API_ENDPOINT}/customer/tickets/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          withCredentials: true,
        },
      );
      console.log("bookings", response);
      setTickets(response.data.data);
    }

    fetchTickets();
  }, [paymentId]);

  return (
    <section className="p-10 flex justify-center items-center flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Your Tickets
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Browse shows
        </Link>
      </div>

      <div className="mt-8 grid gap-4 grid-cols-3">
        {ticketsData.map((ticket) => (
          <div
            key={ticket.ticketId}
            className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Show</p>
                <p className="mt-2 text-xl font-semibold text-slate-100">
                  {ticket.showName}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-cyan-300">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">Price</p>
                <p className="mt-2 text-lg font-medium text-slate-100">
                  {ticket.seatPrice}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">Seat</p>
                <p className="mt-2 text-lg font-medium text-slate-100">
                  {ticket.seatName}
                </p>
              </div>
            </div>
            
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">Type</p>
                <p className="mt-2 text-lg font-medium text-slate-100">
                  {ticket.seatType}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">Show Timings</p>
                <p className="mt-2 text-lg font-medium text-slate-100">
                  {new Date(ticket.showStart).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} - {new Date(ticket.showEnd).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>
          
          
        ))}
      </div>
    </section>
  );
}

export default CustomerTicketsPage;
