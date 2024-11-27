"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTokens, getUserRole } from "@/lib/auth";
import StorageSettings from "@/components/storage";
import UserSettings from "@/components/users";

export default function Configs() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("usuarios");

  useEffect(() => {
    const { access_token } = getTokens();
    setUserRole(getUserRole(access_token));
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-[1280px] h-[720px] rounded-lg shadow-lg overflow-hidden bg-white">
        <Link href="/main" passHref>
          <button className="absolute top-4 left-4 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-black/90 shadow">
            ↩
          </button>
        </Link>
        <div className="w-1/4 bg-gray-200 select-none p-4 flex flex-col space-y-4">
          {userRole == "admin" ? (
            <Button
              variant={selectedTab === "rotinas" ? "default" : "outline"}
              onClick={() => setSelectedTab("rotinas")}
            >
              Armazenamento
            </Button>
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
        <div className="flex-1 p-6 bg-white relative">
          {selectedTab === "rotinas" && <StorageSettings />}
          {selectedTab === "usuarios" && <UserSettings />}
        </div>
      </div>
    </div>
  );
}
