"use client";

import { useState, useTransition } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginService } from "@/services/auth/login.service";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { AppToast } from "@/components/app/components/app-toast";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

type formData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const t = useTranslations("auth");

  const router = useRouter();

  const form = useForm<formData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "makarakara79@gmail.com",
      password: "88889999",
    },
  });

  async function onSubmit(values: formData) {
    setIsLoading(true);
    try {
      const response = await loginService({
        email: values.email,
        password: values.password,
      });

      if (response) {
        router.replace(ROUTES.DASHBOARD.INDEX);
        startTransition(() => {
          AppToast({
            type: "success",
            message: response?.welcomeMessage || t("messages.login-success"),
            duration: 3000,
            position: "top-right",
          });
        });
      }
    } catch (error: any) {
      const errorMsg =
        error?.errorMessage === "An unexpected error occurred: Bad credentials"
          ? "Incorrect email or password."
          : error?.errorMessage ||
            error?.rawError?.message ||
            error?.message ||
            "Something went wrong. Please try again.";

      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen justify-center bg-background">
      <section className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <article className="relative group">
          {/* Gradient border animation */}
          <span
            aria-hidden
            className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 opacity-70 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200 animate-gradient-x"
          />
          {/* Login card */}
          <section className="relative rounded-xl border bg-card p-8 shadow-xl">
            <header className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Admin Panel Login
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to continue
              </p>
            </header>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {isLoading ?? (
                  <div className="flex justify-center items-center space-x-2">
                    <Loader2 className="animate-spin h-6 w-6 text-black" />
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          disabled={form.formState.isSubmitting}
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            disabled={form.formState.isSubmitting}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute hover:bg-transparent right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
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
                  className="w-full shadow-md active:scale-95 font-semibold transition-all duration-300 hover:shadow-lg focus:outline-none"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </section>
        </article>
      </section>
    </main>
  );
}
