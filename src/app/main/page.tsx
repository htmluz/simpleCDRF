"use client";

import { useState, useEffect } from "react";
import { format, intervalToDuration } from "date-fns";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { refreshAccessToken } from "@/lib/auth";
import { ThemeToggle } from "@/components/themetoggle";
import { API_BASE_URL } from "@/lib/config";
import { CallRecord, HomerCall } from "@/models/bilhetes";
import { FilterComponent } from "@/components/filter";
import { FilterHomer } from "@/components/filterhomer";
import { TableComponent } from "@/components/tablelegs";
import { HomerTableComponent } from "@/components/tablehomer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, PhoneCall, Settings } from "lucide-react";
import Configs from "@/components/settings";

interface BilhetesResponse {
  data: CallRecord[];
  total: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
}

interface HomerCallResponse {
  calls: HomerCall[];
}

const columnHelper = createColumnHelper<CallRecord>();
const columnHelperHomer = createColumnHelper<HomerCall>();

const columnsHomer: ColumnDef<HomerCall, any>[] = [
  columnHelperHomer.accessor("start_time", {
    header: "Início",
    cell: (info) => {
      const isoString = info.getValue();
      if (!isoString) return "";
      return format(new Date(isoString), "dd/MM/yyyy HH:mm:ss");
    },
  }),
  columnHelperHomer.accessor("brief_call_info.from_user", {
    header: "Origem",
    cell: (info) => info.getValue(),
  }),
  columnHelperHomer.accessor("brief_call_info.ruri_user", {
    header: "Destino",
    cell: (info) => info.getValue(),
  }),
  columnHelperHomer.accessor("brief_call_info.ruri_domain", {
    header: "Domínio",
    cell: (info) => info.getValue(),
  }),
  columnHelperHomer.accessor("brief_call_info.callid", {
    header: "Call-ID",
    cell: (info) => info.getValue(),
  }),
  columnHelperHomer.accessor("brief_call_info.user_agent", {
    header: "User Agent",
    cell: (info) => info.getValue(),
  }),
];

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
  const [dataHomer, setDataHomer] = useState<HomerCallResponse>({ calls: [] });
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
    from_user: "",
    ruri_user: "",
    start_time: new Date(today.getTime() - (3 * 60 + 15) * 60 * 1000)
      .toISOString()
      .slice(0, 16),
    end_time: new Date(today.getTime() - 3 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16),
    ruri_domain: "",
    call_id: "",
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

  const tableHomer = useReactTable({
    data: dataHomer.calls,
    columns: columnsHomer,
    getCoreRowModel: getCoreRowModel(),
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
      ...(filtersHomer.from_user && {
        from_user: filtersHomer.from_user,
      }),
      ...(filtersHomer.ruri_user && {
        ruri_user: filtersHomer.ruri_user,
      }),
      ...(filtersHomer.ruri_domain && {
        ruri_domain: filtersHomer.ruri_domain,
      }),
      ...(filtersHomer.call_id && { callId: filtersHomer.call_id }),
      ...(filtersHomer.start_time && {
        start_time: addHours(filtersHomer.start_time, 0),
      }),
      ...(filtersHomer.end_time && {
        end_time: addHours(filtersHomer.end_time, 0),
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
    const result: HomerCallResponse = await makeRequest();
    if (result) {
      setDataHomer(result);
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

  return (
    <>
      <Tabs defaultValue="tableRadius" className="mt-3 mx-6">
        <TabsList className="mb-2">
          <TabsTrigger value="tableRadius" className="font-mono">
            <Phone className="mr-2 h-4 w-4" />
            Radius
          </TabsTrigger>
          <TabsTrigger value="homer" className="font-mono">
            <PhoneCall className="mr-2 h-4 w-4" />
            Homer
          </TabsTrigger>
          <TabsTrigger value="settings" className="font-mono">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </TabsTrigger>
          <ThemeToggle />
        </TabsList>
        <TabsContent value="tableRadius">
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
        </TabsContent>
        <TabsContent value="homer">
          <FilterHomer
            filters={filtersHomer}
            setFilters={setFiltersHomer}
            handleSearch={handleSearchHomer}
          />
          <HomerTableComponent
            table={tableHomer}
            data={dataHomer.calls}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="settings">
          <Configs />
        </TabsContent>
      </Tabs>
    </>
  );
}
