import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FilterComponentProps {
  filters: {
    from_user: string;
    ruri_user: string;
    start_time: string;
    end_time: string;
    ruri_domain: string;
    call_id: string;
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
        <AccordionTrigger className="font-bold font-mono text-lg flex justify-start gap-2">
          Filtros
        </AccordionTrigger>
        <AccordionContent>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-1"
          >
            <div>
              <label className="font-mono block text-sm font-medium mb-1">
                Origem
              </label>
              <Input
                type="text"
                className="font-mono"
                value={filters.from_user}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    from_user: e.target.value,
                  }))
                }
                placeholder="Origem"
              />
            </div>
            <div>
              <label className="font-mono block text-sm font-medium mb-1">
                Destino
              </label>
              <Input
                type="text"
                className="font-mono"
                value={filters.ruri_user}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    ruri_user: e.target.value,
                  }))
                }
                placeholder="Destino"
              />
            </div>
            <div>
              <label className="font-mono block text-sm font-medium mb-1">
                Call-ID
              </label>
              <Input
                type="text"
                className="font-mono"
                value={filters.call_id}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    call_id: e.target.value,
                  }))
                }
                placeholder="Call-ID"
              />
            </div>
            <div>
              <label className="font-mono block text-sm font-medium mb-1">
                Domínio
              </label>
              <Input
                type="text"
                className="font-mono"
                value={filters.ruri_domain}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    ruri_domain: e.target.value,
                  }))
                }
                placeholder="Domínio"
              />
            </div>
            <div>
              <label className="font-mono block text-sm font-medium mb-1">
                Data Início
              </label>
              <Input
                type="datetime-local"
                className="font-mono"
                value={filters.start_time}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    start_time: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="font-mono block text-sm font-medium mb-1">
                Data Fim
              </label>
              <Input
                type="datetime-local"
                className="font-mono"
                value={filters.end_time}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    end_time: e.target.value,
                  }))
                }
              />
            </div>
            <Button type="submit" className="mt-6 font-mono col-span-2">
              Buscar no Homer
            </Button>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
