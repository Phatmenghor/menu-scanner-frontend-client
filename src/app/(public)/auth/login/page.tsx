"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ArrowRight, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginService, signUpService } from "@/services/auth/login.service";
import { useTranslations } from "next-intl";
import { AppToast } from "@/components/app/components/app-toast";
import { ROUTES } from "@/constants/app-routed/routes";

const loginSchema = z.object({
  userIdentifier: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    userIdentifier: z.string().min(1, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    gender: z.enum(["Male", "Female"]),
    userType: z.string().optional(),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function CustomerLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSignupMode, setIsSignupMode] = useState(false);

  const router = useRouter();
  const t = useTranslations("auth");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userIdentifier: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userIdentifier: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      gender: "Male",
      userType: "CUSTOMER",
      phoneNumber: "",
    },
  });

  const currentForm = isSignupMode ? signupForm : loginForm;

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await loginService({
        userIdentifier: data.userIdentifier,
        password: data.password,
      });

      if (response) {
        startTransition(() => {
          AppToast({
            type: "success",
            message: response?.welcomeMessage || "Welcome to the dashboard!",
            duration: 3000,
            position: "top-right",
          });

          router.push(ROUTES.CUSTOMER.DASHBOARD);
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.errorMessage === "An unexpected error occurred: Bad credentials"
          ? t("invalidCredentials")
          : error?.errorMessage || t("loginError");

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    try {
      // Prepare credentials for the API
      const credentials = {
        userIdentifier: data?.userIdentifier.trim() ?? undefined,
        password: data?.password.trim(),
        firstName: data?.firstName.trim() ?? undefined,
        lastName: data?.lastName.trim() ?? undefined,
        userType: data.userType || "CUSTOMER",
        phoneNumber: data?.userIdentifier, // Use userIdentifier as phoneNumber
      };

      const response = await signUpService(credentials);

      if (response) {
        AppToast({
          type: "success",
          message: "Account created successfully! Please log in.",
          duration: 3000,
          position: "top-right",
        });

        // Switch back to login mode and clear signup form
        setIsSignupMode(false);
        signupForm.reset();
      }
    } catch (error: any) {
      const errorMessage =
        error?.errorMessage || "Signup failed. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state during login or navigation transition
  const isSubmitting = isLoading || isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="space-y-6 text-center pt-8">
            <CardTitle className="text-2xl font-semibold text-rose-600">
              {isSignupMode ? "Signup" : "Login"}
            </CardTitle>
            <CardDescription className="text-rose-500 text-sm">
              Enter Your Phone Number
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {isSignupMode ? (
              <Form {...signupForm}>
                <form
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={signupForm.control}
                    name="userIdentifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 h-4 w-4" />
                            <Input
                              type="tel"
                              inputMode="tel"
                              placeholder="+855"
                              autoComplete="tel"
                              className="pl-10 h-12 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/30 rounded-lg"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              autoComplete="new-password"
                              disabled={isSubmitting}
                              className="h-12 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/30 rounded-lg pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isSubmitting}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-rose-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-rose-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm Password"
                              autoComplete="new-password"
                              disabled={isSubmitting}
                              className="h-12 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/30 rounded-lg pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              disabled={isSubmitting}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-rose-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-rose-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={signupForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="First Name"
                              disabled={isSubmitting}
                              className="h-12 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/30 rounded-lg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Last Name"
                              disabled={isSubmitting}
                              className="h-12 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/30 rounded-lg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 font-medium rounded-lg mt-6"
                    disabled={isSubmitting}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-rose-200 text-primary font-medium rounded-lg"
                    onClick={() => setIsSignupMode(false)}
                    disabled={isSubmitting}
                  >
                    Log in
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="userIdentifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 h-4 w-4" />
                            <Input
                              type="tel"
                              inputMode="tel"
                              placeholder="+855"
                              autoComplete="tel"
                              className="pl-10 h-12 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/30 rounded-lg"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              autoComplete="current-password"
                              disabled={isSubmitting}
                              className="h-12 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/30 rounded-lg pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isSubmitting}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-rose-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-rose-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg mt-6"
                    disabled={isSubmitting}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-rose-200 text-rose-600 hover:bg-rose-50 font-medium rounded-lg"
                    onClick={() => setIsSignupMode(true)}
                    disabled={isSubmitting}
                  >
                    Sign up
                  </Button>

                  {/* Forgot Password Link */}
                  <div className="text-center mt-4">
                    <a
                      href="#"
                      className="text-rose-600 hover:text-rose-700 text-sm underline"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <div className="px-3 text-sm text-gray-500">OR</div>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  {/* Bot domain invalid message */}
                  <div className="text-center text-sm text-gray-600">
                    Bot domain invalid
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
