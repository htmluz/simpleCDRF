"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CallRecord {
  "User-Name": string;
  "Calling-Station-Id": string;
  "Called-Station-Id": string;
  "h323-setup-time": string;
  "h323-connect-time": string;
  "h323-disconnect-time": string;
  "h323-call-type": string;
  "Acct-Session-Time": string;
  "h323-disconnect-cause": string;
  "NAS-IP-Address": string;
  "call-id": string;
  "release-source": string;
}

interface BilhetesResponse {
  data: CallRecord[];
  total: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
}

const columnHelper = createColumnHelper<CallRecord>();

const columns = [
  columnHelper.accessor("Calling-Station-Id", {
    header: "Origem",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("Called-Station-Id", {
    header: "Destino",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("h323-setup-time", {
    header: "Início",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("h323-disconnect-time", {
    header: "Fim",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("Acct-Session-Time", {
    header: "Duração",
    cell: (info) => {
      const seconds = parseInt(info.getValue());
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    },
  }),
  columnHelper.accessor("User-Name", {
    header: "Nap",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("h323-disconnect-cause", {
    header: "Status",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("NAS-IP-Address", {
    header: "IP",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("release-source", {
    header: "Origem Desligamento",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("call-id", {
    header: "Call-ID",
    cell: (info) => info.getValue(),
  }),
];

export default function BilhetesPage() {
  const [data, setData] = useState<CallRecord[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    callingPhone: "",
    calledPhone: "",
    anyPhone: "",
    userName: "",
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    pageCount: totalPages,
    manualPagination: true,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        perPage: pagination.pageSize.toString(),
        ...(filters.anyPhone && { anyPhone: filters.anyPhone }),
        ...(filters.callingPhone && { callingPhone: filters.callingPhone }),
        ...(filters.calledPhone && { calledPhone: filters.calledPhone }),
        ...(filters.userName && { userName: filters.userName }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(
        `http://192.168.65.157:5000/bilhetes?${queryParams}`
      );
      const result: BilhetesResponse = await response.json();
      console.log(result.data);

      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    table.setPageIndex(0);
    fetchData();
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Bilhetes</h1>

      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <Input
            type="text"
            value={filters.anyPhone}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, anyPhone: e.target.value }))
            }
            placeholder="Número"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Calling</label>
          <Input
            type="text"
            value={filters.callingPhone}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, callingPhone: e.target.value }))
            }
            placeholder="Calling"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Called</label>
          <Input
            type="text"
            value={filters.calledPhone}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, calledPhone: e.target.value }))
            }
            placeholder="Called"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nap</label>
          <Input
            type="text"
            value={filters.userName}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, userName: e.target.value }))
            }
            placeholder="Nap"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data Início</label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data Fim</label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>

        <Button type="submit" className="mt-6">
          Buscar
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
