import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import PasswordInput from '../components/PasswordInput';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<RegisterFormData>();
  

  const submit = async (data: RegisterFormData) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_ENDPOINT}/customer/register`, data, {withCredentials: true})
      
      if (response.status === 201) {
        navigate('/login');
      } else {
        alert('Registration failed');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/90 p-8 shadow-glow backdrop-blur-xl">
        <h1 className="text-3xl font-semibold text-slate-100">Create account</h1>
        <p className="mt-2 text-slate-400">Register to reserve seats for your favorite shows.</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(submit)}>
          <label className="block">
            <span className="text-sm text-slate-300">First name</span>
            <input
              type="text"
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="Your full name"
              {...register('firstName', { required: true })}
            />
          </label>
          
          <label className="block">
            <span className="text-sm text-slate-300">Last name</span>
            <input
              type="text"
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="Your full name"
              {...register('lastName')}
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="you@example.com"
              {...register('email', { required: true })}
            />
          </label>

          <PasswordInput
            label="Password"
            placeholder="Create a password"
            register={register('password', { required: true })}
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link className="font-medium text-cyan-300 hover:text-cyan-200" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
