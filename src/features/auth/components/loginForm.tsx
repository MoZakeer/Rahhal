import { motion } from "framer-motion";
import AuthLayout from "./AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../shared/components/button";
import Input from "../../../shared/components/Input";
import PasswordInput from "../../../shared/components/PasswordInput";
import { useForm } from "react-hook-form";
import { loginSchema, type TLoginInputsType } from "../validation/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../hooks/useLogin";
import toast from "react-hot-toast";
interface LoginFormProps {
  onLoginSuccess: () => void;
}
function LoginForm({ onLoginSuccess }: LoginFormProps) {

 const { isPending, login } = useLogin();
 const navigate = useNavigate();

 const { register, handleSubmit, formState:{errors,isSubmitting}, reset } =
 useForm<TLoginInputsType>({
   resolver:zodResolver(loginSchema),
   mode:"onBlur"
 });

 function onSubmit(payload:TLoginInputsType){
   login(payload,{
     onSuccess:(response)=>{
       const {data}=response||{};
       localStorage.setItem("auth",JSON.stringify(data));
       localStorage.setItem("token",data.token);
       localStorage.setItem("user",JSON.stringify(data));
       onLoginSuccess();
       navigate("/feed");
     },
     onError:(error:Error)=>toast.error(error.message),
     onSettled:()=>reset()
   })
 }

 const isWaiting=isSubmitting||isPending;

 return (

  <AuthLayout>

   <motion.div
   initial={{opacity:0,y:40}}
   animate={{opacity:1,y:0}}
   transition={{duration:0.5}}
   >

    <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
      Login to your profile
    </h1>

    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

     <Input
      label="Email or Username"
      placeholder="username or email"
      {...register("email")}
      error={errors.email?.message}
     />

     <PasswordInput
      label="Password"
      placeholder="Password"
      {...register("password")}
      error={errors.password?.message}
     />

     <Link
      to="/forget-password"
      className="self-end text-sm font-medium text-primary-700 hover:underline"
     >
      Forgot password?
     </Link>

     <Button disabled={isWaiting} loading={isWaiting}>
      Login
     </Button>

     <p className="text-center text-sm text-gray-600">
      Don’t have an account?{" "}
      <Link to="/sign-up" className="text-primary-700 font-medium">
       Sign up
      </Link>
     </p>

    </form>

   </motion.div>

  </AuthLayout>

 )
}

export default LoginForm;