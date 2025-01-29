import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { flexRender } from "@tanstack/react-table";
import { CallRecord } from "@/models/bilhetes";
import { useState } from "react";
import ModalInfos from "./modalInfos";

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
                  className="text-center font-mono py-4"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center py-4 font-mono"
                >
                  Nenhuma ligação encontrada
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

      <ModalInfos
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedRow={selectedRow}
        callId=""
        defaultTab="radius"
      />
    </>
  );
};
