import { API_BASE_URL } from "@/lib/config";
import { format } from "date-fns";
import { AlertCircle, LoaderCircle, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";

interface FilterRule {
  id: number;
  to_user: string;
  from_user: string;
  due_date: string;
}

export default function FilterRules() {
  const [status, setStatus] = useState<
    "idle" | "success" | "failure" | "loading"
  >("idle");
  const [filterRules, setFilterRules] = useState<FilterRule[] | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [newRule, setNewRule] = useState({
    from_user: "",
    to_user: "",
    due_date: "",
  });

  const fetchFilterRules = async () => {
    setStatus("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/homer/filter_rules`);
      const responseData = await response.json();
      const result: FilterRule[] = responseData.data;
      setFilterRules(result);
      setStatus("success");
    } catch (error) {
      console.error("Erro buscando users: ", error);
      setStatus("failure");
    } finally {
      setStatus("idle");
    }
  };

  const handleDeleteClick = (ruleId: number) => {
    setSelectedRuleId(ruleId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRuleId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/homer/filter_rules`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedRuleId }),
      });

      if (response.ok) {
        await fetchFilterRules();
      } else {
        console.error("Erro ao deletar regra");
      }
    } catch (error) {
      console.error("Erro ao deletar regra:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedRuleId(null);
    }
  };

  const handleAddRule = async () => {
    try {
      const formattedDate = new Date(newRule.due_date)
        .toISOString()
        .replace(/\.\d{3}Z$/, "-03:00");

      const response = await fetch(`${API_BASE_URL}/homer/filter_rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 666,
          from_user: newRule.from_user,
          to_user: newRule.to_user,
          due_date: formattedDate,
        }),
      });

      if (response.ok) {
        await fetchFilterRules();
        setIsAddDialogOpen(false);
        setNewRule({ from_user: "", to_user: "", due_date: "" });
      } else {
        console.error("Erro ao adicionar regra");
      }
    } catch (error) {
      console.error("Erro ao adicionar regra:", error);
    }
  };

  useEffect(() => {
    fetchFilterRules();
  }, []);

  return (
    <div className="h-full min-h-[90vh] rounded-lg shadow-lg overflow-hidden bg-white dark:bg-black dark:border p-2 flex flex-col">
      <div className="select-none flex justify-between">
        <div>
          <h2 className="font-mono font-bold mt-2 ml-2">Filtros de Captura</h2>
          <div className="flex mb-1">
            <AlertCircle className="h-4 w-4 mt-1 ml-2 mr-1" />
            <p className="font-mono">
              A captura RTP ainda está em fase experimental. Espere falhas
              devido ao sistema de capturas.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          variant="outline"
          className="flex items-center transition-all"
        >
          <Plus className="h-4 w-4" /> Adicionar Regra
        </Button>
      </div>

      <table className="min-w-full rounded-lg">
        <thead>
          <tr className="text-sm font-bold text-center font-mono bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900  transition-all rounded-lg select-none">
            <td className="py-2 border-r">ID</td>
            <td className="py-2 border-r">From</td>
            <td className="py-2 border-r">To</td>
            <td className="py-2 border-r">Data de Expiração</td>
            <td className="py-2">Excluir</td>
          </tr>
        </thead>
        <tbody>
          {status === "loading" ? (
            <tr>
              <td colSpan={5} className="text-center">
                <LoaderCircle className="animate-spin mx-auto" />
              </td>
            </tr>
          ) : (
            filterRules?.map((rule) => (
              <tr
                key={rule.id}
                className="text-center font-mono cursor-default"
              >
                <td className="border-r">{rule.id}</td>
                <td className="border-r">{rule.from_user}</td>
                <td className="border-r">{rule.to_user}</td>
                <td className="border-r">
                  {format(new Date(rule.due_date), "dd/MM/yyyy HH:mm")}
                </td>
                <td>
                  <X
                    className="justify-self-center cursor-pointer hover:rotate-90 hover:text-red-700 duration-500 transition-all mx-auto"
                    onClick={() => handleDeleteClick(rule.id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setNewRule({ from_user: "", to_user: "", due_date: "" });
          }
        }}
      >
        <DialogContent className="max-w-md font-mono select-none">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Regra</DialogTitle>
            <DialogDescription>
              Não é o To e From de uma chamada. Informe ambos os campos o mesmo
              número! Vai capturar tudo que *contenha* o seu input então por
              favor seja específico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="from_user">From</label>
              <Input
                id="from_user"
                value={newRule.from_user}
                required
                onChange={(e) =>
                  setNewRule({ ...newRule, from_user: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="to_user">To</label>
              <Input
                id="to_user"
                value={newRule.to_user}
                required
                onChange={(e) =>
                  setNewRule({ ...newRule, to_user: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="due_date">Data de Expiração</label>
              <Input
                id="due_date"
                type="datetime-local"
                value={newRule.due_date}
                required
                onChange={(e) =>
                  setNewRule({ ...newRule, due_date: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRule}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setSelectedRuleId(null);
        }}
      >
        <DialogContent className="max-w-md font-mono select-none">
          <DialogHeader className="items-center">
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o filtro #{selectedRuleId}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="items-center w-full flex sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
