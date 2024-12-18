"use client";

import { API_BASE_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CallRecord, CallRecordFull } from "@/models/bilhetes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { convertToIsoGMTMinus3, formatDate } from "@/utils/dateUtils";

interface EventResponse {
  count: number;
  calls: CallRecordFull[];
}

export default function BasicEventStreamViewer() {
  const [count, setCount] = useState<number>(0);
  const [calls, setCalls] = useState<CallRecordFull[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/bilhetes/live`);

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const eventData: EventResponse = JSON.parse(event.data);
        setCount(eventData.count);
        if (eventData.calls) {
          setCalls(eventData.calls);
        } else {
          setCalls([]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-2 flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Live view</h1>
        <Link href="/main">
          <Button>Voltar</Button>
        </Link>
      </div>
      <h2 className="text-xl font-bold mb-4">Chamadas Ativas: {count}</h2>
      <div className="bg-gray-100 dark:bg-neutral-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
        {/* 
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Início da Chamada</TableHead>
              <TableHead>Início do Ring</TableHead>
              <TableHead>Codec</TableHead>
              <TableHead>RTP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.length > 0 ? (
              <>
                {calls.map((call, index) => (
                  <TableRow>
                    <TableCell>{call["Calling-Station-Id"]}</TableCell>
                    <TableCell>{call["Called-Station-Id"]}</TableCell>
                    <TableCell>
                      {formatDate(
                        convertToIsoGMTMinus3(call["h323-setup-time"])
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(convertToIsoGMTMinus3(call["Ring-Start"]))}
                    </TableCell>
                    <TableCell>{call["Codec"]}</TableCell>
                    <TableCell>
                      {call["Local-RTP-IP"]}:{call["Local-RTP-Port"]}⇆
                      {call["Remote-RTP-IP"]}:{call["Remote-RTP-Port"]}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <></>
            )}
          </TableBody>
        </Table>
        */}
      </div>
    </div>
  );
}
