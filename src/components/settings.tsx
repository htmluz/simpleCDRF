"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTokens, getUserRole } from "@/lib/auth";
import StorageSettings from "@/components/storage";
import UserSettings from "@/components/users";
import GatewaysSettings from "@/components/gateways";

export default function Configs() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "usuarios" | "gateways" | "rotinas"
  >("usuarios");

  useEffect(() => {
    const { access_token } = getTokens();
    setUserRole(getUserRole(access_token));
    const theme = localStorage.getItem("theme");
    if (theme) {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, []);

  return (
    <div className="flex h-full min-h-[80vh] rounded-lg shadow-lg overflow-hidden bg-white dark:bg-black">
      <div className="w-1/4 bg-gray-200 dark:bg-neutral-900 select-none p-4 flex flex-col space-y-4">
        {userRole == "admin" ? (
          <>
            <Button
              variant={selectedTab === "rotinas" ? "default" : "outline"}
              onClick={() => setSelectedTab("rotinas")}
            >
              Armazenamento
            </Button>
            <Button
              variant={selectedTab === "gateways" ? "default" : "outline"}
              onClick={() => setSelectedTab("gateways")}
            >
              Gateways
            </Button>
          </>
        ) : (
          <></>
        )}
        <Button
          variant={selectedTab === "usuarios" ? "default" : "outline"}
          onClick={() => setSelectedTab("usuarios")}
        >
          Usuários
        </Button>
      </div>
      <div className="flex-1 p-6 bg-white dark:bg-black relative">
        {selectedTab === "rotinas" && <StorageSettings />}
        {selectedTab === "usuarios" && <UserSettings />}
        {selectedTab === "gateways" && <GatewaysSettings />}
      </div>
    </div>
  );
}
