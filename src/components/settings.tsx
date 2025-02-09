"use client";

import { useEffect, useState } from "react";
import { getTokens, getUserRole } from "@/lib/auth";
import StorageSettings from "@/components/storage";
import UserSettings from "@/components/users";
import GatewaysSettings from "@/components/gateways";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Database, ServerCog, UserCog } from "lucide-react";

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
    <div className="flex h-full min-h-[90vh] rounded-lg shadow-lg overflow-hidden bg-white dark:bg-black p-2">
      <Tabs defaultValue="users" className="flex w-full">
        <TabsList
          className={`font-mono h-full px-1 mr-3 flex flex-col items-start justify-start w-auto border-r border-gray-200 dark:border-neutral-800 transition-all duration-300 ease-in-out}`}
        >
          {userRole == "admin" ? (
            <>
              <TabsTrigger
                value="storage"
                className="px-5 w-full justify-start"
              >
                <Database className="h-4 w-4 mr-1" />
                Armazenamento
              </TabsTrigger>
              <TabsTrigger
                value="gateways"
                className="px-5 w-full justify-start"
              >
                <ServerCog className="h-4 w-4 mr-1" />
                Gateways
              </TabsTrigger>
            </>
          ) : (
            <></>
          )}
          <TabsTrigger value="users" className="px-5 w-full justify-start">
            <UserCog className="h-4 w-4 mr-1" />
            Usuários
          </TabsTrigger>
        </TabsList>
        <div className="w-full">
          <TabsContent value="storage">
            <StorageSettings />
          </TabsContent>
          <TabsContent value="users">
            <UserSettings />
          </TabsContent>
          <TabsContent value="gateways">
            <GatewaysSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
