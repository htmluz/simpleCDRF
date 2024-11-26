"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Success from "@/components/ui/success";
import { format } from "date-fns";
import Link from "next/link";
import Failure from "@/components/ui/failure";
import LoadingButton from "@/components/ui/loadingbutton";

interface RotinasResponse {
  days: number;
  updated_at: string;
}

export default function Configs() {
  const [selectedTab, setSelectedTab] = useState("rotinas");
  const [rotinasData, setRotinasData] = useState<RotinasResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "failure" | "loading"
  >("idle");

  const fetchRotinaData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://10.90.0.100:5000/rotinas/limpezadias`
      );
      const result: RotinasResponse = await response.json();
      setRotinasData(result);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChanged(true);
    const d = Number(e.target.value);
    setRotinasData((prev) => (prev ? { ...prev, days: d } : prev));
  };

  const handleSubmit = async () => {
    try {
      setStatus("loading");
      const r = await fetch("http://10.90.0.100:5000/rotinas/limpezadias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days: rotinasData?.days }),
      });
      if (r.ok) {
        setStatus("success");
        resetStatus();
      } else {
        setStatus("failure");
        resetStatus();
      }
    } catch (error) {
      console.error(error);
      setStatus("failure");
      resetStatus();
    }
  };

  const resetStatus = () => {
    setTimeout(() => {
      setStatus("idle");
    }, 5000);
  };

  useEffect(() => {
    fetchRotinaData();
  }, [selectedTab]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-[1280px] h-[720px] rounded-lg shadow-lg overflow-hidden bg-white">
        <Link href="/" passHref>
          <button className="absolute top-4 left-4 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-black/90 shadow">
            ↩
          </button>
        </Link>
        <div className="w-1/4 bg-gray-200 select-none p-4 flex flex-col space-y-4">
          <Button
            variant={selectedTab === "rotinas" ? "default" : "outline"}
            onClick={() => setSelectedTab("rotinas")}
          >
            Armazenamento
          </Button>
          <Button
            variant={selectedTab === "usuarios" ? "default" : "outline"}
            onClick={() => setSelectedTab("usuarios")}
          >
            Usuários
          </Button>
        </div>
        <div className="flex-1 p-6 bg-white relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Carregando</p>
            </div>
          ) : (
            <>
              {selectedTab === "rotinas" && (
                <div>
                  {rotinasData ? (
                    <>
                      <div className="flex items-center select-none">
                        <label htmlFor="cleanup_days">Limpar a cada</label>
                        <Input
                          id="cleanup_days"
                          type="number"
                          className="w-1/12 ml-2 mr-2 h-8"
                          value={rotinasData.days}
                          onChange={handleInputChange}
                        ></Input>
                        <p>dias.</p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm italic text-gray-800 select-none">
                          Atualizado a última vez em{" "}
                          {format(
                            new Date(rotinasData.updated_at),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                      </div>
                      {status === "idle" && (
                        <Button
                          onClick={handleSubmit}
                          disabled={!isChanged}
                          className="absolute bottom-6 right-6"
                        >
                          Alterar
                        </Button>
                      )}
                      {status === "loading" && (
                        <div className="absolute bottom-6 right-6">
                          <LoadingButton></LoadingButton>
                        </div>
                      )}
                      {status === "success" && (
                        <div className="absolute bottom-6 right-6">
                          <Success></Success>
                        </div>
                      )}
                      {status === "failure" && (
                        <div className="absolute bottom-6 right-6">
                          <Failure></Failure>
                        </div>
                      )}
                    </>
                  ) : (
                    <p></p>
                  )}
                </div>
              )}
              {selectedTab === "usuarios" && (
                <div>
                  <ul>
                    <li></li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
