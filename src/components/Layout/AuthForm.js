"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function AuthForm({ isLogin = true }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = z.object({
    username: z.string().min(1, "Please enter your username"),
    password: z.string().min(1, "Please enter your password"),
  });

  const registerSchema = z.object({
    username: z.string().min(1, "Username field cannot be empty"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await api.post(endpoint, data);

      if (isLogin) {
        const token = res.data.token;
        const role = res.data.role;

        if (token) {
          localStorage.setItem("access_token", token);
        }

        toast.success("Login Berhasil!");

        setTimeout(() => {
          if (role === "Admin") {
            router.push("/dashboard/admin/artikel");
          } else if (role === "User") {
            router.push("/dashboard/user");
          } else {
            router.push("/dashboard");
          }
        }, 2000);
      } else {
        toast.success("Register Berhasil!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6]">
      <Card className="w-[420px] rounded-2xl shadow-md border-none">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-sm">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/logoLogin.svg"
                alt="Logo"
                className="w-[134px] h-[24px] object-contain"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                {...register("username")}
                placeholder="Input username"
                className="text-sm"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Input password"
                  className="text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role Dropdown (Only for Register) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-sm"
                    >
                      {watch("role") || "Select role"}
                      <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="p-1"
                    style={{ width: "100%" }}
                  >
                    {["User", "Admin"].map((roleOption) => (
                      <DropdownMenuItem
                        key={roleOption}
                        onSelect={(e) => {
                          e.preventDefault();
                          setValue("role", roleOption);
                        }}
                      >
                        {roleOption}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full text-sm cursor-pointer"
              disabled={isLoading}
              style={{ backgroundColor: "#2563EB", color: "white" }}
            >
              {isLoading ? "Processing..." : isLogin ? "Login" : "Register"}
            </Button>

            {/* Footer link */}
            {isLogin ? (
              <p className="text-center text-sm text-gray-500">
                Don’t have an account?{" "}
                <a
                  href="/auth/register"
                  className="text-[#2563EB] font-medium underline"
                >
                  Register
                </a>
              </p>
            ) : (
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="text-[#2563EB] font-medium underline"
                >
                  Login
                </a>
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
