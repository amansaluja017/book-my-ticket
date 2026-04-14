import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Camera } from "lucide-react";
import axios, { AxiosError } from "axios";
import { Update } from "../slice/authSlice";
import TicketsSection from "../components/TicketsSection";

function ProfilePage() {
  const { userData: user } = useSelector((state: any) => state.user);

  const dispatch = useDispatch();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_API_ENDPOINT}/customer/profile/avatar`,
          {
            avatar: e.currentTarget.files[0],
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user?.token}`,
            },
            withCredentials: true,
          },
        );
        
        dispatch(Update({ ...user, avatar: response.data.data }));
      } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error) {
          throw new Error(error.message);
        } else if (error instanceof AxiosError) {
          throw new Error(error.response?.data?.message || error.message);
        }
        throw new Error("An unknown error occurred");
      }
    }
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-[2rem] border border-slate-700 bg-slate-900/95 p-8 shadow-glow backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Profile
              </p>
              <h1 className="mt-2 text-4xl font-semibold text-slate-100">
                Your account details
              </h1>
              <p className="mt-3 max-w-2xl text-slate-400">
                Manage your booking profile, review membership perks, and see
                your next selected screening.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
            >
              Back to home
            </Link>
          </div>
        </div>

        <div className="grid gap-8">
          <section className="rounded-[2rem] border border-slate-700 bg-slate-900/95 p-8 shadow-glow backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500 text-3xl font-bold text-slate-950">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="h-full w-full object-cover rounded-3xl"
                  />
                ) : (
                  <span>
                    {user.firstName[0].toUpperCase()}
                    {user.lastName[0].toUpperCase()}
                  </span>
                )}
                <label className="absolute bottom-0 right-0 bg-black text-white rounded-full p-2 cursor-pointer hover:scale-105">
                  <Camera size={20} />
                  <input
                    title="avatar"
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                  Hello,
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-100">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="mt-2 text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl bg-slate-950/80 p-5 text-slate-300">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-2 text-lg font-medium text-slate-100">
                  {user.email}
                </p>
              </div>
            </div>
          </section>
          
          <TicketsSection />
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
