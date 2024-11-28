"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { format } from "date-fns";
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
import { useRouter } from "next/navigation";
import { refreshAccessToken } from "@/lib/auth";

interface CallRecord {
  "Acct-Session-Id": string;
  "Acct-Session-Time": string;
  "Acct-Session-Type": string;
  "Called-Station-Id": string;
  "Calling-Station-Id": string;
  "Cisco-NAS-Port": string;
  Codec: string;
  "Local-RTP-IP": string;
  "Local-RTP-Port": string;
  "Local-SIP-IP": string;
  "Local-SIP-Port": string;
  "MOS-Egress": string;
  "MOS-Ingress": string;
  "NAS-IP-Address": string;
  "NAS-Identifier": string;
  Protocol: string;
  "Remote-RTP-IP": string;
  "Remote-RTP-Port": string;
  "Remote-SIP-IP": string;
  "Remote-SIP-Port": string;
  "Ring-Start": string;
  "User-Name": string; //NapA
  "call-id": string;
  "h323-call-origin": string;
  "h323-call-type": string;
  "h323-connect-time": string;
  "h323-disconnect-cause": string;
  "h323-disconnect-time": string;
  "h323-setup-time": string;
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
  columnHelper.accessor("h323-setup-time", {
    header: "Horário de Início",
    cell: (info) => {
      const isoString = info.getValue();
      if (!isoString) return "";
      return format(new Date(isoString), "dd/MM/yyyy HH:mm:ss");
    },
  }),
  columnHelper.accessor("h323-disconnect-time", {
    header: "Horário do Desligamento",
    cell: (info) => {
      const isoString = info.getValue();
      if (!isoString) return "";
      return format(new Date(isoString), "dd/MM/yyyy HH:mm:ss");
    },
  }),
  columnHelper.accessor("Ring-Start", {
    header: "Horário de Início do Áudio",
    cell: (info) => {
      const isoString = info.getValue();
      if (!isoString) return "";
      const datenow = new Date();
      const date = new Date(isoString);
      if (date.getFullYear() < datenow.getFullYear() - 100) {
        return "";
      }
      return format(date, "dd/MM/yyyy HH:mm:ss");
    },
  }),
  columnHelper.accessor("Acct-Session-Time", {
    header: "Duração",
    cell: (info) => {
      const value = info.getValue();
      if (value) {
        const seconds = parseInt(info.getValue());
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
      }
      return "";
    },
  }),
  columnHelper.accessor("Calling-Station-Id", {
    header: "Origem",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("Called-Station-Id", {
    header: "Destino",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("User-Name", {
    header: "Nap Origem",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("Cisco-NAS-Port", {
    header: "Nap Destino",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("h323-disconnect-cause", {
    header: "Status",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("Codec", {
    header: "Codec",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("h323-call-origin", {
    header: "Call origin",
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
  columnHelper.accessor("MOS-Egress", {
    header: "MOS Tx",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("MOS-Ingress", {
    header: "MOS Rx",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("NAS-IP-Address", {
    header: "Gateway",
    cell: (info) => info.getValue(),
  }),
];

export default function BilhetesPage() {
  const [data, setData] = useState<CallRecord[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const today = new Date();
  const [filters, setFilters] = useState({
    callingPhone: "",
    calledPhone: "",
    anyPhone: "",
    napA: "",
    napB: "",
    startDate: new Date(today.getTime() - 8 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16),
    endDate: "",
    disconnCause: "",
    callId: "",
    gatewayIp: "",
    codec: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  const addHours = (dateString: string, hours: number): string => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + hours);
    return date.toISOString().slice(0, 16);
  };

  const fetchData = async () => {
    setIsLoading(true);

    const queryParams = new URLSearchParams({
      page: (pagination.pageIndex + 1).toString(),
      perPage: pagination.pageSize.toString(),
      ...(filters.anyPhone && { anyPhone: filters.anyPhone }),
      ...(filters.callingPhone && { callingPhone: filters.callingPhone }),
      ...(filters.calledPhone && { calledPhone: filters.calledPhone }),
      ...(filters.napA && { napA: filters.napA }),
      ...(filters.napB && { napB: filters.napB }),
      ...(filters.disconnCause && { disconnCause: filters.disconnCause }),
      ...(filters.callId && { callId: filters.callId }),
      ...(filters.gatewayIp && { gatewayIp: filters.gatewayIp }),
      ...(filters.codec && { codec: filters.codec }),
      ...(filters.startDate && { startDate: addHours(filters.startDate, 0) }),
      ...(filters.endDate && { endDate: addHours(filters.endDate, 0) }),
    });
    const makeRequest = async () => {
      const response = await fetch(
        `http://10.90.0.100:5000/bilhetes?${queryParams}`
      );
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
    const result: BilhetesResponse = await makeRequest();
    if (result) {
      setData(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    }
    setIsLoading(false);
  };

  const handlePageSizeChange = (value: string) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: parseInt(value, 10),
    }));
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
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">Bilhetes</h1>
        <Link href="/configs">
          <Button>Configs</Button>
        </Link>
      </div>
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
          <label className="block text-sm font-medium mb-1">Origem</label>
          <Input
            type="text"
            value={filters.callingPhone}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, callingPhone: e.target.value }))
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
              setFilters((prev) => ({ ...prev, calledPhone: e.target.value }))
            }
            placeholder="Destino"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Codec</label>
          <Input
            type="text"
            value={filters.codec}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, codec: e.target.value }))
            }
            placeholder="Codec"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nap A</label>
          <Input
            type="text"
            value={filters.napA}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, napA: e.target.value }))
            }
            placeholder="Nap"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nap B</label>
          <Input
            type="text"
            value={filters.napB}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, napB: e.target.value }))
            }
            placeholder="Nap"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Call-ID</label>
          <Input
            type="text"
            value={filters.callId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, callId: e.target.value }))
            }
            placeholder="Call-ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Causa da Desconexão
          </label>
          <Input
            type="text"
            value={filters.disconnCause}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, disconnCause: e.target.value }))
            }
            placeholder="Causa da Desconexão"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gateway</label>
          <Input
            type="text"
            value={filters.gatewayIp}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, gatewayIp: e.target.value }))
            }
            placeholder="IP do Gateway"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data Início</label>
          <Input
            type="datetime-local"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data Fim</label>
          <Input
            type="datetime-local"
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
          {total} registros. {table.getPageCount()} Páginas
        </div>
        <div className="flex items-center space-x-2">
          <div className="space-y-2">
            <Select defaultValue="25" onValueChange={handlePageSizeChange}>
              <SelectTrigger id="select-15">
                <SelectValue>{pagination.pageSize}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
