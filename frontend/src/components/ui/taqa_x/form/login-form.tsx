"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLoginMutation } from "@/endpoints/auth/auth";

export interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  const loginMutation = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          placeholder="Enter your password"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
} 