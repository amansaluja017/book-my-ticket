import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../slice/authSlice";
import { useEffect, useState } from "react";

export interface ShowsTypes {
  screenId: string;
  screenName: string;
  screenType: string;
  showDuration: string;
  showId: string;
  showStart: string;
  showEnd: string;
  showName: string;
  showGenre: string;
  createdAt: Date;
}

export function calculateDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

export function convertDate(date: string | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

function HomePage() {
  const { status, userData: user } = useSelector((state: any) => state.user);
  const [shows, setShows] = useState<ShowsTypes[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}/customer/logout`,
        {},
        {
          withCredentials: true,
          headers: { authorization: `Bearer ${user.token}` },
        },
      );

      if (response.status === 200) {
        dispatch(logout());
        navigate("/login");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        alert(error.message);
      }
    }
  };

  useEffect(() => {
    async function loadShows() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_ENDPOINT}/?limit=12&page=${page}`,
          {
            withCredentials: true,
          },
        );
        const data = response.data.data as ShowsTypes[];
        setShows(data);
        setHasNextPage(data.length === 12);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error);
          alert(error.message);
        }
      }
    }
    loadShows();
  }, [page]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-12">
        <nav className="flex flex-col gap-4 rounded-[2rem] border border-slate-700 bg-slate-900/80 p-6 shadow-glow backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]" />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                Book my ticket
              </p>
              <p className="text-sm text-slate-400">
              </p>
            </div>
          </div>

          {!status ? (
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                className="rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-2 text-slate-100 transition hover:border-cyan-500 hover:text-cyan-300"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 transition hover:bg-cyan-400"
                to="/register"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                className="rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-2 text-slate-100 transition hover:border-cyan-500 hover:text-cyan-300"
                to="/profile"
              >
                Profile
              </Link>
              <Link
                onClick={() => handleLogout()}
                className="rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-2 text-slate-100 transition hover:border-cyan-500 hover:text-cyan-300"
                to="/login"
              >
                Logout
              </Link>
            </div>
          )}
        </nav>

        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-slate-700 bg-slate-900/80 p-8 shadow-glow backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
                  Available shows
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-100">
                  Reserve the best seats
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-500 hover:text-cyan-300 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 disabled:hover:border-slate-700"
                >
                  Previous
                </button>
                <span className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100">
                  Page {page}
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {shows.map((show) => (
                <article
                  key={show.showId}
                  className="group rounded-[1.75rem] border border-slate-700 bg-slate-950/90 p-5 transition hover:-translate-y-1 hover:border-cyan-500/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                        show
                      </p>
                      <h3 className="mt-3 text-xl font-semibold text-slate-100">
                        {show.showName}
                      </h3>
                    </div>
                    <div className="rounded-3xl bg-slate-900 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-300">
                      {convertDate(show.showStart)}
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span className="rounded-2xl bg-slate-900 px-3 py-2">
                      {show.showGenre}
                    </span>
                    <span className="rounded-2xl bg-slate-900 px-3 py-2">
                      {calculateDuration(new Date(show.showStart), new Date(show.showEnd))}
                    </span>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-4">
                    <Link
                      to={`/shows/${show.showId}`}
                      className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition group-hover:bg-cyan-400"
                    >
                      View seats
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default HomePage;
