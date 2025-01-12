"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { refreshAccessToken } from "@/lib/auth";
import { ThemeToggle } from "@/components/themetoggle";
import { API_BASE_URL } from "@/lib/config";
import { CallRecord } from "@/models/bilhetes";
import { FilterComponent } from "@/components/filter";
import { FilterHomer } from "@/components/filterhomer";
import { TableComponent } from "@/components/tablelegs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

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
  columnHelper.accessor("call-id", {
    header: "Call-ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor(
    (row) => ({ gwName: row["Gw-Name"], nasIpAddress: row["NAS-IP-Address"] }),
    {
      header: "Gateway",
      cell: (info) => {
        const { gwName, nasIpAddress } = info.getValue();
        return gwName && gwName.trim() !== "" ? gwName : nasIpAddress;
      },
    }
  ),
];

export default function BilhetesPage() {
  const [data, setData] = useState<CallRecord[]>([]);
  const [isHomer, setIsHomer] = useState(false);
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
  const [filtersHomer, setFiltersHomer] = useState({
    anyPhone: "",
    callingPhone: "",
    calledPhone: "",
    startDate: "",
    endDate: "",
    domain: "",
    callId: "",
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
      const response = await fetch(`${API_BASE_URL}/bilhetes?${queryParams}`);
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

  const fetchDataHomer = async () => {
    setIsLoading(true);

    const queryParams = new URLSearchParams({
      page: (pagination.pageIndex + 1).toString(),
      perPage: pagination.pageSize.toString(),
      ...(filtersHomer.anyPhone && { anyPhone: filtersHomer.anyPhone }),
      ...(filtersHomer.callingPhone && {
        callingPhone: filtersHomer.callingPhone,
      }),
      ...(filtersHomer.calledPhone && {
        calledPhone: filtersHomer.calledPhone,
      }),
      ...(filtersHomer.callId && { callId: filtersHomer.callId }),
      ...(filtersHomer.startDate && {
        startDate: addHours(filtersHomer.startDate, 0),
      }),
      ...(filtersHomer.endDate && {
        endDate: addHours(filtersHomer.endDate, 0),
      }),
    });
    const makeRequest = async () => {
      const response = await fetch(`${API_BASE_URL}/homer?${queryParams}`);
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

  const handleSearchHomer = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDataHomer();
  };

  const handleToggleHomer = () => {
    setIsHomer((prev) => !prev);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">Bilhetes</h1>
        <div className="flex space-x-2">
          <div className="flex mt-2">
            <label
              htmlFor="switch"
              className="select-none font-mono text-sm text-muted-foreground mr-1"
              title="Chamadas internas e CVU só vão aparecer se forem pesquisadas apenas pela captura."
            >
              Pesquisar apenas captura?
            </label>
            <Switch
              id="switch"
              disabled={true}
              checked={isHomer}
              onClick={handleToggleHomer}
              title="Chamadas internas, CVU ou PABX só vão aparecer se forem pesquisadas apenas pela captura."
            />
          </div>
          <ThemeToggle />
          <Link href="/configs">
            <Button>Configs</Button>
          </Link>
          <Link href="/live">
            <Button>Live view</Button>
          </Link>
        </div>
      </div>
      {!isHomer ? (
        <>
          <FilterComponent
            filters={filters}
            setFilters={setFilters}
            handleSearch={handleSearch}
          />
          <TableComponent
            table={table}
            data={data}
            isLoading={isLoading}
            total={total}
            handlePageSizeChange={handlePageSizeChange}
          />
        </>
      ) : (
        <>
          <FilterHomer
            filters={filtersHomer}
            setFilters={setFiltersHomer}
            handleSearch={handleSearchHomer}
          />
        </>
      )}
    </div>
  );
}
