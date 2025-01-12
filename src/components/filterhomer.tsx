import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FilterComponentProps {
  filters: {
    anyPhone: string;
    callingPhone: string;
    calledPhone: string;
    startDate: string;
    endDate: string;
    domain: string;
    callId: string;
  };
  setFilters: (filters: any) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export const FilterHomer = ({
  filters,
  setFilters,
  handleSearch,
}: FilterComponentProps) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="filters" className="border-b-0">
        <AccordionTrigger className="font-bold text-lg flex justify-start gap-2">
          Filtros
        </AccordionTrigger>
        <AccordionContent>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-1"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <Input
                type="text"
                value={filters.anyPhone}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    anyPhone: e.target.value,
                  }))
                }
                placeholder="Número"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Origem</label>
              <Input
                type="text"
                value={filters.callingPhone}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    callingPhone: e.target.value,
                  }))
                }
                placeholder="Origem"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Destino</label>
              <Input
                type="text"
                value={filters.calledPhone}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    calledPhone: e.target.value,
                  }))
                }
                placeholder="Destino"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Call-ID</label>
              <Input
                type="text"
                value={filters.callId}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    callId: e.target.value,
                  }))
                }
                placeholder="Call-ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Data Início
              </label>
              <Input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Fim</label>
              <Input
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>
            <Button type="submit" className="mt-6">
              Buscar
            </Button>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
