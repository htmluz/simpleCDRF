import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { Button } from "./ui/button";
import LoadingButton from "./ui/loadingbutton";
import Failure from "./ui/failure";
import Success from "./ui/success";
import { refreshAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { Check, RefreshCcw } from "lucide-react";

interface RotinasResponse {
  days: number;
  updated_at: string;
}

export default function StorageSettings() {
  const [rotinasData, setRotinasData] = useState<RotinasResponse | null>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "failure" | "loading"
  >("idle");
  const router = useRouter();

  useEffect(() => {
    fetchRotinaData();
  }, []);

  const fetchRotinaData = async () => {
    setStatus("loading");
    const makeRequest = async () => {
      const response = await fetch(`${API_BASE_URL}/rotinas/limpezadias`);
      if (response.status === 401) {
        const new_access_token = await refreshAccessToken();
        if (new_access_token) {
          return makeRequest();
        } else {
          router.push("/login");
          return null;
        }
      }
      if (!response.ok) {
        console.error(`Erro ${response.status}`);
        router.push("/login");
        return null;
      }
      return response.json();
    };
    const result: RotinasResponse = await makeRequest();
    if (result) {
      setRotinasData(result);
    }
    setStatus("idle");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChanged(true);
    const d = Number(e.target.value);
    setRotinasData((prev) => (prev ? { ...prev, days: d } : prev));
  };

  const resetStatus = () => {
    setTimeout(() => {
      setStatus("idle");
    }, 5000);
  };

  const handleSubmit = async () => {
    setStatus("loading");
    const makeRequest = async () => {
      const r = await fetch(`${API_BASE_URL}/rotinas/limpezadias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days: rotinasData?.days }),
      });
      if (r.status === 401) {
        const new_access_token = await refreshAccessToken();
        if (new_access_token) {
          return makeRequest();
        } else {
          router.push("/login");
          return null;
        }
      }
      if (!r.ok) {
        console.error(`Erro ${r.status}`);
        router.push("/login");
        return null;
      }
      return r.json();
    };
    const result = await makeRequest();
    if (result) {
      setStatus("success");
      resetStatus();
    } else {
      setStatus("failure");
      resetStatus();
    }
  };

  const StatusButton = () => {
    switch (status) {
      case "loading":
        return <LoadingButton />;
      case "success":
        return <Success />;
      case "failure":
        return <Failure />;
      default:
        return (
          <Button onClick={handleSubmit} disabled={!isChanged}>
            Alterar
          </Button>
        );
    }
  };

  if (!rotinasData) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative space-y-1">
      <div className="flex flex-col shadow w-1/4 p-2 rounded-lg dark:border dark:border-neutral-700">
        <div className="flex items-center space-x-2 font-mono">
          <label htmlFor="cleanup_days" className="whitespace-nowrap">
            Limpar chamadas Radius a cada
          </label>
          <Input
            id="cleanup_days"
            type="number"
            className="w-10 h-5 shadow-none border-none bg-neutral-100 dark:bg-neutral-800 p-0 px-1 mt-1 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={rotinasData.days}
            onChange={handleInputChange}
          />
          <span>dias.</span>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic font-mono">
            Última atualização:{" "}
            {format(new Date(rotinasData.updated_at), "dd/MM/yyyy HH:mm")}
          </p>
          {isChanged ? (
            <RefreshCcw className="h-4 w-4 text-gray-500" />
          ) : (
            <Check className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>
      <div className="mt-auto flex justify-start font-mono pt-1">
        <StatusButton />
      </div>
    </div>
  );
}
