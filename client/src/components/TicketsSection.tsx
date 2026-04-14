import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

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

function TicketsSection() {
  const { userData: user } = useSelector((state: any) => state.user);
  
  const [ticketsData, setTickets] = useState<TicketType[]>([]);
  
  useEffect(() => {
    async function fetchTickets() {
      const response = await axios.get(`${import.meta.env.VITE_API_ENDPOINT}/customer/tickets`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        withCredentials: true
      });
      setTickets(response.data.data);
    }

    fetchTickets();
  }, []);
  
  return (
    <section className="rounded-[2rem] border border-slate-700 bg-slate-900/95 p-8 shadow-glow backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Your tickets
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-100">
            All booked shows
          </h2>
          <p className="mt-3 text-slate-400">
            Review all your booked tickets with seat, genre, duration and show time.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Browse shows
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {ticketsData.map((ticket) => (
          <div
            key={ticket.ticketId ?? `${ticket.showName}-${ticket.seatName}`}
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
                  {new Date(ticket.showStart).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900 p-4">
                  <p className="text-sm text-slate-500">Seat</p>
                  <p className="mt-2 text-lg font-medium text-slate-100">
                    {ticket.seatName}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-4">
                  <p className="text-sm text-slate-500">Duration</p>
                  <p className="mt-2 text-lg font-medium text-slate-100">
                    {ticket.showDuration.split(".")[0]}h {ticket.showDuration.split(".")[1]}m
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-4">
                  <p className="text-sm text-slate-500">Show time</p>
                  <p className="mt-2 text-lg font-medium text-slate-100">
                    {new Date(ticket.showStart).toLocaleTimeString()}-{new Date(ticket.showEnd).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
    </section>
  )
}

export default TicketsSection;
