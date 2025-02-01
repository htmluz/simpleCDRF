import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Success from "./ui/success";
import Failure from "./ui/failure";
import { Plus, Trash, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface Gateway {
  name: string;
  ip: string;
}

export default function GatewaysSettings() {
  const [gatewaysData, setGatewaysData] = useState<Gateway[] | null>(null);
  const [gwChange, setGwChange] = useState<Gateway>({
    name: "",
    ip: "",
  });
  const [status, setStatus] = useState<
    "idle" | "success" | "failure" | "loading"
  >("idle");
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);

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
    setGwChange((prev) => ({ ...prev, name: d }));
  };

  const handleInputChangeIP = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    setIsChanged(true);
    setGwChange((prev) => ({ ...prev, ip: d }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const r = await fetch(`${API_BASE_URL}/gateways`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gwChange),
      });
      if (r.ok) {
        setStatus("success");
        fetchGatewaysData();
        setIsEditing(false);
        setGwChange({ name: "", ip: "" });
      } else {
        setStatus("failure");
      }
    } catch (error) {
      setStatus("failure");
    }
    resetStatus();
  };

  const handleDelete = async (ip: string) => {
    try {
      await fetch(`${API_BASE_URL}/gateways`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", ip: ip }),
      });
      fetchGatewaysData();
    } catch (error) {
      console.error("Erro ao deletar gateway:", error);
    }
  };

  useEffect(() => {
    fetchGatewaysData();
  }, []);

  return (
    <div className="max-w-full mx-auto px-4 py-0 font-mono">
      {/* Add/Edit Gateway Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 w-full max-w-2xl m-4 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Adicionar Gateway</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nome</label>
                  <Input
                    type="text"
                    onChange={handleInputChangeName}
                    value={gwChange.name}
                    placeholder="Digite o nome do gateway"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Endereço IP
                  </label>
                  <Input
                    type="text"
                    onChange={handleInputChangeIP}
                    value={gwChange.ip}
                    placeholder="Digite o IP do gateway"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                {status === "idle" ? (
                  <Button type="submit" disabled={!isChanged}>
                    Adicionar Gateway
                  </Button>
                ) : status === "success" ? (
                  <Success />
                ) : (
                  <Failure />
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gateways Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Add Gateway Card */}
        {!isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setGwChange({ name: "", ip: "" });
              setIsChanged(false);
            }}
            className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors flex items-center justify-center group"
          >
            <div className="text-center">
              <Plus className="w-8 h-8 mx-auto mb-2 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
                Adicionar Novo Gateway
              </p>
            </div>
          </button>
        )}

        {/* Gateway Cards */}
        {gatewaysData?.map((gateway, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800 dark:hover:border-neutral-700 p-6 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{gateway.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {gateway.ip}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(gateway.ip)}
                className="text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
