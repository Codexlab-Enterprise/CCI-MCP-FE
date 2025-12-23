import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { Eye, EyeClosed } from "lucide-react";

import { fadeIn, staggerContainer } from "@/utils/motion";
import { login } from "@/api/auth";

const _window = typeof window !== "undefined" ? window : null;
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   // const toastId=toast.loading('Logging in...');
  //   e.preventDefault();
  //   if (!formData.email.trim() || !formData.password.trim()) {
  //     toast.warning("Please fill in all required fields.");

  //     return;
  //   }
  //   console.log(formData);
  //   setLoading(true);
  //   const res = await login(formData.email, formData.password);

  //   console.log("=== LOGIN DEBUG INFO ===");
  // console.log("Status:", res.status);
  // console.log("Response data:", res.data);
  // console.log("Response headers:", res.headers);
  // console.log("Cookies after login:", document.cookie);
  // console.log("=========================");

  //   if (res.status === 200) {
  //     Cookies.set("user", JSON.stringify(res?.data?.user));
  //     _window.sessionStorage.setItem("user", JSON.stringify(res?.data?.user));
  //     toast.success(res?.data?.message);

  //     if (res.data.accessToken) {
  //       Cookies.set("accessToken", res.data.accessToken, { 
  //         expires: 1 / 24 
  //       });
  //     }
  //     if (res.data.refreshToken) {
  //       Cookies.set("refreshToken", res.data.refreshToken, { 
  //         expires: 7 
  //       });
  //     }
      
  //     setLoading(false);
  //     router.push("/members");
  //   } else {
  //     toast.error(res?.response?.data?.message);
  //     setLoading(false);
  //   }
  // };


  // Add this before the login call

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.email.trim() || !formData.password.trim()) {
    toast.warning("Please fill in all required fields.");
    return;
  }
  
  setLoading(true);

  login(formData.email, formData.password)
    .then((res) => {

      if (res.status === 200) {
        // Store user info
        const userData = res.data.user;
        Cookies.set("user", JSON.stringify(userData));
        if (_window) {
          _window.sessionStorage.setItem("user", JSON.stringify(userData));
        }
        
        // if (userData.accessToken) {
        //   Cookies.set("accessToken", userData.accessToken, { 
        //     expires: 0.5/1440, // 1 hour
        //     path: '/',
        //     secure: false, // false for HTTP localhost
        //     sameSite: 'lax'
        //   });
        // }
        
        // if (userData.refreshToken) {
        //   Cookies.set("refreshToken", userData.refreshToken, { 
        //     expires: 0.5/1440, // 7 days
        //     path: '/',
        //     secure: false, // false for HTTP localhost
        //     sameSite: 'lax'
        //   });
        // }
        
        toast.success(res.data.message || "Login successful!");
        router.push("/members");
      }
    })
    .catch((err) => {
      toast.error(err.response?.data?.message || "Login failed");
    })
    .finally(() => {
      setLoading(false);
    });
};

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-900"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <div className="flex justify-center h-[100dvh]">
        <motion.div
          animate={{ x: 0, opacity: 1 }}
          className="hidden bg-cover lg:block lg:w-2/3"
          initial={{ x: -100, opacity: 0 }}
          style={{
            backgroundImage: `url('/images/login.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
            <motion.div
              animate="show"
              initial="hidden"
              variants={staggerContainer(0.1, 0.3)}
            >
              <motion.h2
                className="text-2xl font-bold text-white sm:text-3xl"
                variants={fadeIn("up", "tween", 0.2, 1)}
              >
                The Cricket Club of India
              </motion.h2>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center w-full max-w-md px-6 mx-auto backdrop-blur-xs h-full lg:w-2/6 bg-white/70"
          initial={{ x: 100, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            animate="show"
            className="flex-1"
            initial="hidden"
            variants={staggerContainer()}
          >
            <motion.div
              className="text-center"
              variants={fadeIn("up", "tween", 0.2, 1)}
            >
              <div className="flex justify-center mx-auto">
                <motion.img
                  alt=""
                  animate={{ scale: 1 }}
                  className="w-auto h-20 sm:h-20"
                  initial={{ scale: 0 }}
                  src="/images/logo.png"
                  transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
                />
              </div>

              <motion.p
                className="mt-3 text-gray-500 dark:text-gray-300"
                variants={fadeIn("up", "tween", 0.4, 1)}
              >
                Sign in to access your account
              </motion.p>
            </motion.div>

            <motion.div
              className="mt-8"
              variants={fadeIn("up", "tween", 0.6, 1)}
            >
              <form onSubmit={handleSubmit}>
                <motion.div variants={fadeIn("up", "tween", 0.6, 1)}>
                  <Input
                    id="email"
                    label={"Email"}
                    name="email"
                    placeholder="example@example.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </motion.div>

                <motion.div
                  className="mt-6"
                  variants={fadeIn("up", "tween", 0.8, 1)}
                >
                  <Input
                    endContent={
                      <>
                        <button
                          aria-label="toggle password visibility"
                          className="focus:outline-solid outline-transparent"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeClosed className="text-2xl text-default-400 pointer-events-none" />
                          ) : (
                            <Eye className="text-2xl text-default-400 pointer-events-none" />
                          )}
                        </button>
                      </>
                    }
                    id="password"
                    label={"Password"}
                    name="password"
                    placeholder="Your Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </motion.div>

                <motion.div
                  className="mt-6"
                  variants={fadeIn("up", "tween", 1, 1)}
                >
                  <Button
                    isLoading={loading}
                    type="submit"
                    className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                    // whileHover={{ scale: 1.02 }}
                    // whileTap={{ scale: 0.98 }}
                  >
                    Sign in
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      {/* <Toaster richColors /> */}
    </motion.div>
  );
};

export default Login;
