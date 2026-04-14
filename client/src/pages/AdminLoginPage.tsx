import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../slice/authSlice";
import { useForm } from "react-hook-form";
import PasswordInput from "../components/PasswordInput";

interface AdminLoginFormData {
  email: string;
  password: string;
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const { register, handleSubmit } = useForm<AdminLoginFormData>();

  const submit = async (data: AdminLoginFormData) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}/admin/login`,
        data,
        { withCredentials: true },
      );

      console.log(response);

      if (response.status === 200) {
        dispatch(login({...response.data.data.user, token: response.data.data.accessToken}));
      }

      navigate("/admin/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Admin login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900/90 p-8 shadow-glow backdrop-blur-xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Admin access
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-100">
            Admin login
          </h1>
          <p className="mt-3 text-slate-400">
            Sign in to manage screens, create shows, and control theater
            listings.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="admin@example.com"
              {...register("email", { required: true })}
            />
          </label>

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            register={register("password", { required: true })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Back to the user view?{" "}
          <Link
            className="font-medium text-cyan-300 hover:text-cyan-200"
            to="/">
            Home
          </Link>
        </p>
      </section>
    </main>
  );
}

export default AdminLoginPage;
