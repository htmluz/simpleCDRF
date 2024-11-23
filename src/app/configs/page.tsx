"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface RotinasResponse {
  days: number;
  updated_at: string;
}

export default function Configs() {
  const [selectedTab, setSelectedTab] = useState("rotinas");
  const [rotinasData, setRotinasData] = useState<RotinasResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const fetchRotinaData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://192.168.65.157:5000/rotinas/limpezadias`
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

  // TODO tratar response
  const handleSubmit = () => {
    try {
      fetch("http://192.168.65.157:5000/rotinas/limpezadias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days: rotinasData?.days }),
      });
    } catch (error) {
      console.error(error);
    }
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
                      <Button
                        onClick={handleSubmit}
                        disabled={!isChanged}
                        className="absolute bottom-6 right-6"
                      >
                        Alterar
                      </Button>
                    </>
                  ) : (
                    <p></p>
                  )}
                </div>
              )}
              {selectedTab === "usuarios" && (
                <div>
                  <ul>
                    <li>pipokinha123</li>
                    <li>GroToziKNTC</li>
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
