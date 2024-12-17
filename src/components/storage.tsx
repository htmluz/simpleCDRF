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

  return (
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
            <p className="text-sm italic text-gray-800 dark:text-gray-400 select-none">
              Atualizado a última vez em{" "}
              {format(new Date(rotinasData.updated_at), "dd/MM/yyyy HH:mm")}
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
  );
}
