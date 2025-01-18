import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PCAPTab from "./homer_callid";
import { flexRender } from "@tanstack/react-table";
import { HomerCall } from "@/models/bilhetes";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

interface TableComponentProps {
  table: any;
  data: HomerCall[];
  isLoading: boolean;
}

export const HomerTableComponent = ({
  table,
  data,
  isLoading,
}: TableComponentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<HomerCall | null>(null);

  const handleRowClick = (row: HomerCall) => {
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
                  className="text-center font-mono py-4"
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-screen-2xl h-[90%] cursor-default overflow-hidden">
          <PCAPTab pcapA={selectedRow?.messages} />
        </DialogContent>
      </Dialog>
    </>
  );
};
