"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface loginResponse {
  access_token: string;
  refresh_token: string;
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("http://10.90.0.100:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (r.ok) {
      const { access_token, refresh_token }: loginResponse = await r.json();
      setTokens(access_token, refresh_token);
      router.push("/main");
    } else {
      console.error("falha no login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900">
      <div className="flex flex-col w-[600px] p-6 rounded-lg shadow-lg overflow-hidden bg-white dark:bg-black">
        <h1 className="text-2xl font-bold mb-6">CDRs Unifique</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 mb-6">
            <Input
              placeholder="Usuário"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            ></Input>
            <Input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            ></Input>
          </div>
          <Button className="w-[100%]" type="submit">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
