import { motion } from "framer-motion";
import AuthLayout from "./AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../shared/components/button";
import Input from "../../../shared/components/Input";
import PasswordInput from "../../../shared/components/PasswordInput";
import { useForm } from "react-hook-form";
import { signUpSchema, type TSignUpType } from "../validation/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "../hooks/useSignUp";
import toast from "react-hot-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

function SignUpForm() {
  usePageTitle("Sign Up");
  const { isPending, signUp } = useSignUp();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TSignUpType>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
  });

  function onSubmit(payload: TSignUpType) {
    signUp(payload, {
      onSuccess: (data) => {
        toast.success(data?.message);
        navigate("/login");
      },
      onError: (error: Error) => toast.error(error.message),
      onSettled: () => reset(),
    });
  }

  const isWaiting = isSubmitting || isPending;

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 text-center mb-6">
          Create your account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full">
              <Input
                placeholder="First name"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
            </div>

            <div className="w-full">
              <Input
                placeholder="Last name"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>
          </div>

          <Input
            placeholder="Username"
            {...register("username")}
            error={errors.username?.message}
          />
          <Input
            placeholder="Email"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            placeholder="Phone number"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="w-full">
              <PasswordInput
                placeholder="Password"
                {...register("password")}
                error={errors.password?.message}
              />
            </div>

            <div className="w-full">
              <PasswordInput
                placeholder="Confirm password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>
          </div>

          <Button disabled={isWaiting} loading={isWaiting}>
            Sign up
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-700 dark:text-blue-400 font-medium"
            >
              Login
            </Link>
          </p>
        </form>
      </motion.div>
    </AuthLayout>
  );
}

export default SignUpForm;
