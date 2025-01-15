import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PCAPTab from "./homer_callid";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { flexRender } from "@tanstack/react-table";
import { CallRecord } from "@/models/bilhetes";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface TableComponentProps {
  table: any;
  data: CallRecord[];
  isLoading: boolean;
  total: number;
  handlePageSizeChange: (value: string) => void;
}

export const TableComponent = ({
  table,
  data,
  isLoading,
  total,
  handlePageSizeChange,
}: TableComponentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CallRecord | null>(null);

  const handleRowClick = (row: CallRecord) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
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
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center"
                >
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell: any) => (
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
                <SelectValue>
                  {table.getState().pagination.pageSize}
                </SelectValue>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-screen-2xl max-h-[90%] min-h-[48%] cursor-default">
          <Tabs defaultValue="radius" className="w-full">
            <TabsList className="font-mono grid w-full grid-cols-2">
              <TabsTrigger value="radius">RADIUS</TabsTrigger>
              <TabsTrigger value="pcap">PCAP</TabsTrigger>
            </TabsList>
            <TabsContent value="radius" className="mt-4">
              {selectedRow && (
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-4">
                    <div>
                      <h4 className="text-sm">Codec</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["Codec"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm">Duração</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["Acct-Session-Time"] || "N/A"}s
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm">Gateway</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["Gw-Name"] ||
                          selectedRow["NAS-IP-Address"]}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm">Protocolo</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["Protocol"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm">Tipo de Ligação</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {selectedRow["h323-call-type"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm">Call-ID</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {selectedRow["call-id"] || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-4 border-b-2 pb-1">
                    <div>
                      <h4 className="text-sm">Origem da Perna</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {selectedRow["h323-call-origin"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm">Horário do Setup</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {format(selectedRow["h323-setup-time"], "HH:mm:ss") ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4>Início do Áudio</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedRow["Ring-Start"], "HH:mm:ss") || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4>Conectado</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedRow["h323-connect-time"], "HH:mm:ss") ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4>Desconectado</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          selectedRow["h323-disconnect-time"],
                          "HH:mm:ss"
                        ) || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4>Causa Desconexão</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {selectedRow["h323-disconnect-cause"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4>Origem Desconexão</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["release-source"] || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Origem</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["Calling-Station-Id"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Destino</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["Called-Station-Id"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">MOS TX</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["MOS-Egress"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">MOS RX</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["MOS-Ingress"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">NAP Origem</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["User-Name"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">NAP Destino</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRow["Cisco-NAS-Port"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Endereços de Origem</h4>
                      <p className="text-sm text-muted-foreground">
                        SIP: {selectedRow["Local-SIP-IP"] || "N/A"}:
                        {selectedRow["Local-SIP-Port"] || "N/A"}
                        <br />
                        RTP: {selectedRow["Local-RTP-IP"] || "N/A"}:
                        {selectedRow["Local-RTP-Port"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Endereços de Destino</h4>
                      <p className="text-sm text-muted-foreground">
                        SIP: {selectedRow["Remote-SIP-IP"] || "N/A"}:
                        {selectedRow["Remote-SIP-Port"] || "N/A"}
                        <br />
                        RTP: {selectedRow["Remote-RTP-IP"] || "N/A"}:
                        {selectedRow["Remote-RTP-Port"] || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent
              value="pcap"
              className="mt-4 overflow-hidden max-w-screen-2xl h-[90%] max-h-[90%]"
            >
              <PCAPTab
                callId={selectedRow?.["call-id"]}
                time={selectedRow?.["h323-setup-time"]}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
