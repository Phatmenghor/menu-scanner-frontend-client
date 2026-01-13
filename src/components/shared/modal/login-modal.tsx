"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { loginService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  userIdentifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, dispatch } = useAuthState();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIdentifier: "",
      password: "",
    },
  });

  async function onSubmit(values: FormData) {
    try {
      await dispatch(
        loginService({
          userIdentifier: values.userIdentifier,
          password: values.password,
        })
      ).unwrap();

      showToast.success("Welcome! You've successfully logged in.");
      onOpenChange(false);
      form.reset();

      // Reload to initialize auth state
      window.location.reload();
    } catch (err: any) {
      showToast.error(err || "Login failed. Please check your credentials.");
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome Back</DialogTitle>
          <DialogDescription>
            Sign in to your account to continue shopping
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email/Username Field */}
            <FormField
              control={form.control}
              name="userIdentifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email or Username
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="name@example.com"
                        disabled={isLoading}
                        className="pl-10"
                        onKeyDown={handleKeyPress}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={isLoading}
                        className="pl-10 pr-10"
                        onKeyDown={handleKeyPress}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
