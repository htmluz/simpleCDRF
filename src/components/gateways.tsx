import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Success from "./ui/success";
import Failure from "./ui/failure";
import { TrashIcon } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { time } from "console";

interface Gateway {
  name: string;
  ip: string;
}

export default function GatewaysSettings() {
  const [gatewaysData, setGatewaysData] = useState<Gateway[] | null>(null);
  const [gwChange, setGwChange] = useState<{ name: string; ip: string }>({
    name: "",
    ip: "",
  });
  const [status, setStatus] = useState<
    "idle" | "success" | "failure" | "loading"
  >("idle");
  const [isChanged, setIsChanged] = useState<boolean>(false);

  const resetStatus = () => {
    setTimeout(() => {
      setStatus("idle");
    }, 5000);
  };

  const fetchGatewaysData = async () => {
    setStatus("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/gateways`);
      const result: Gateway[] = await response.json();
      setGatewaysData(result);
    } catch (error) {
      console.error("Erro buscando gateways: ", error);
      setStatus("failure");
      resetStatus();
    } finally {
      setStatus("idle");
      resetStatus();
    }
  };

  const handleInputChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    setIsChanged(true);
    setGwChange((prev) => (prev ? { ...prev, name: d } : prev));
  };

  const handleInputChangeIP = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    setIsChanged(true);
    setGwChange((prev) => (prev ? { ...prev, ip: d } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const r = await fetch(`${API_BASE_URL}/gateways`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: gwChange?.name,
        ip: gwChange?.ip,
      }),
    });
    if (r.ok) {
      setStatus("success");
      resetStatus();
    } else {
      setStatus("failure");
      resetStatus();
    }
  };

  const handleDelete = (ip: string) => {
    fetch(`${API_BASE_URL}/gateways`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "",
        ip: ip,
      }),
    });
    fetchGatewaysData();
  };

  useEffect(() => {
    fetchGatewaysData();
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4 mb-6">
          <Input
            type="text"
            placeholder="Nome do Gateway"
            value={gwChange?.name}
            onChange={handleInputChangeName}
            required
          ></Input>
          <Input
            type="text"
            placeholder="IP do Gateway"
            value={gwChange?.ip}
            onChange={handleInputChangeIP}
            required
          ></Input>
          {status === "idle" ? (
            <Button disabled={!isChanged}>Criar Gateway</Button>
          ) : status === "failure" ? (
            <Failure />
          ) : (
            <Success />
          )}
        </div>
      </form>
      <div className="bg-gray-100 dark:bg-neutral-900 rounded-lg shadow-inner h-[90%] px-2">
        {gatewaysData && gatewaysData.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="">
                <th className="text-start w-[40%]">Nome</th>
                <th className="text-start w-[40%]">IP</th>
                <th className="text-start"></th>
              </tr>
            </thead>
            <tbody>
              {gatewaysData.map((gw, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors rounded-xl hover:shadow-sm select-none"
                >
                  <td className="py-1 text-neutral-800 dark:text-neutral-200">
                    {gw.name}
                  </td>
                  <td className="text-neutral-800 dark:text-neutral-200">
                    {gw.ip}
                  </td>
                  <td>
                    <TrashIcon
                      onClick={() => handleDelete(gw.ip)}
                      className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>não tem</p>
        )}
      </div>
    </>
  );
}
