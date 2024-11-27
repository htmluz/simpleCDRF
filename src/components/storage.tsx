import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { Button } from "./ui/button";
import LoadingButton from "./ui/loadingbutton";
import Failure from "./ui/failure";
import Success from "./ui/success";

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

  useEffect(() => {
    fetchRotinaData();
  }, []);

  const fetchRotinaData = async () => {
    setStatus("loading");
    try {
      const response = await fetch(
        `http://10.90.0.100:5000/rotinas/limpezadias`
      );
      const result: RotinasResponse = await response.json();
      setRotinasData(result);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setStatus("idle");
    }
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
            <p className="text-sm italic text-gray-800 select-none">
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
