import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { login } from "../slice/authSlice";
import { useState } from "react";
import PasswordInput from "../components/PasswordInput";

interface loginFormData {
  email: string;
  password: string;
}

function LoginPage() {
  const [error, setError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, reset } = useForm<loginFormData>();

  const submit = async (data: loginFormData) => {
    setError("");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}/customer/login`,
        data,
        { withCredentials: true },
      );

      if (response.status === 200) {
        const data = response.data.data;
        dispatch(login({ ...data.user, token: data.accessToken }));
        navigate("/");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.data.message) {
          setError(error.response.data.message);
        }
      } else {
        alert(error instanceof Error ? error.message : String(error));
      }
    } finally {
      reset();
    }
  };

  async function handleOAuthLogin() {
    const clientId = import.meta.env.VITE_CLIENT_ID;
    const redirectUri = `http://localhost:5173/callback/oauth/login`;
    const state = "EfgXYhPQUvVNASTpBX6PpCz8mgEuI8oLiW7NpbEi3rD"; // You should generate a random state for security
    const nonce = "EfgXYhPQUvVNASTpBX6PpCz8mgEuI8oLiW7NpbEi3rD"; // You should generate a random nonce for security
    const oauthUrl = `http://localhost:3001/o/authenticate?response_type=code&client_id=${clientId}&redirect_url=${encodeURIComponent(redirectUri)}&scope=openid profile email&state=${state}&&nonce=${nonce}`;

    sessionStorage.setItem("oauth_state", state);
    sessionStorage.setItem("oauth_nonce", nonce);

    window.location.href = oauthUrl;
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/90 p-8 shadow-glow backdrop-blur-xl">
        <h1 className="text-3xl font-semibold text-slate-100">Welcome back</h1>
        <p className="mt-2 text-slate-400">
          Sign in to manage your movie bookings.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(submit)}>
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="you@example.com"
              {...register("email", { required: true })}
            />
          </label>

          <div className="space-y-2">
            <div className="">
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                register={register("password", { required: true })}
              />
              <div className="text-end mt-3">
                <Link
                  className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
                  to="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 font-mono font-bold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Login
          </button>
        </form>

        <div className="mt-5">
          <button
            type="button"
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400"
            onClick={() => handleOAuthLogin()}
          >
            Login with Our OAuth
          </button>
        </div>

        <div className="flex justify-around items-center mt-6">
          <p className="text-center text-sm text-slate-400">
            New here?{" "}
            <Link
              className="font-medium text-cyan-300 hover:text-cyan-200"
              to="/register"
            >
              Create an account
            </Link>
          </p>

          <Link
            className="font-medium text-sm text-red-600 hover:opacity-80 hover:underline"
            to="/admin/login"
          >
            Admin login
          </Link>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
