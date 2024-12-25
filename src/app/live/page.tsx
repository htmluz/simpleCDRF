"use client";

import { API_BASE_URL } from "@/lib/config";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CallRecordFull } from "@/models/bilhetes";
import { convertToIsoGMTMinus3, formatDate } from "@/utils/dateUtils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface EventResponse {
  count: number;
  calls: CallRecordFull[];
}

export default function BasicEventStreamViewer() {
  const [count, setCount] = useState<number>(0);
  const [calls, setCalls] = useState<CallRecordFull[]>([]);
  const previousCallsRef = useRef<{ [key: string]: CallRecordFull }>({});

  const updateCalls = useCallback((newCalls: CallRecordFull[]) => {
    setCalls((prevCalls) => {
      const updatedCalls: CallRecordFull[] = [];
      const newCallsMap: { [key: string]: CallRecordFull } = {};
      newCalls.forEach((call) => {
        newCallsMap[call.Bid] = call;
      });
      prevCalls.forEach((call) => {
        if (newCallsMap[call.Bid]) {
          updatedCalls.push(newCallsMap[call.Bid]);
          delete newCallsMap[call.Bid];
        }
      });
      Object.values(newCallsMap).forEach((call) => {
        updatedCalls.push(call);
      });
      previousCallsRef.current = updatedCalls.reduce((acc, call) => {
        acc[call.Bid] = call;
        return acc;
      }, {} as { [key: string]: CallRecordFull });

      return updatedCalls;
    });
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/bilhetes/live`);

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const eventData: EventResponse = JSON.parse(event.data);
        setCount(eventData.count);
        if (eventData.calls) {
          updateCalls(eventData.calls);
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
      <div className="flex mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="mr-1 cursor-help w-5 h-5" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Também inclui chamadas com erro. NÃO é o total de chamadas
                simultâneas.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <h2 className="text-xl font-bold">Chamadas Ativas: {count}</h2>
      </div>
      <div className="bg-gray-100 dark:bg-neutral-900 p-4 rounded-lg">
        <div className="w-full grid grid-cols-4 mb-2 border rounded-lg px-4 py-2 select-none">
          <p>Origem</p>
          <p>Destino</p>
          <p>Início da Ligação</p>
          <p>Início do Áudio</p>
        </div>
        <div className="overflow-x-auto">
          {calls.length > 0 ? (
            calls.map((call, index) => (
              <Accordion
                type="single"
                collapsible
                key={call.Bid}
                className="mb-2"
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="hover:no-underline w-full">
                    <div className="grid grid-cols-4 w-full gap-4 px-4 ">
                      <div>
                        {call.LegA?.["Calling-Station-Id"] ??
                          call.LegB?.["Calling-Station-Id"]}
                      </div>
                      <div>
                        {call.LegA?.["Called-Station-Id"] ??
                          call.LegB?.["Called-Station-Id"]}
                      </div>
                      <div>
                        {formatDate(
                          convertToIsoGMTMinus3(
                            call.LegA?.["h323-setup-time"] ??
                              call.LegB?.["h323-setup-time"]
                          )
                        )}
                      </div>
                      <div>
                        {formatDate(
                          convertToIsoGMTMinus3(
                            call.LegA?.["Ring-Start"] ??
                              call.LegB?.["Ring-Start"]
                          )
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-neutral-800 rounded-b-lg">
                      <div>
                        <h3 className="font-bold mb-1">LegA</h3>
                        <p>Nap Origem: {call.LegA?.["Cisco-NAS-Port"]}</p>
                        <p className="">Codec: {call.LegA?.Codec}</p>
                        <p>
                          RTP: {call.LegA?.["Local-RTP-IP"]}:
                          {call.LegA?.["Local-RTP-Port"]} ⇆{" "}
                          {call.LegA?.["Remote-RTP-IP"]}:
                          {call.LegA?.["Remote-RTP-Port"]}
                        </p>
                        <p>
                          SIP: {call.LegA?.["Local-SIP-IP"]}:
                          {call.LegA?.["Local-SIP-Port"]} ⇆{" "}
                          {call.LegA?.["Remote-SIP-IP"]}:
                          {call.LegA?.["Remote-SIP-Port"]}
                        </p>
                        <p>Call-ID: {call.LegA?.["call-id"]}</p>
                        <p>
                          Disconnect-Cause:{" "}
                          {call.LegA?.["h323-disconnect-cause"]}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">LegB</h3>
                        <p>Nap Destino: {call.LegB?.["Cisco-NAS-Port"]}</p>
                        <p className="">Codec: {call.LegB?.Codec}</p>
                        <p>
                          RTP: {call.LegB?.["Local-RTP-IP"]}:
                          {call.LegB?.["Local-RTP-Port"]} ⇆{" "}
                          {call.LegB?.["Remote-RTP-IP"]}:
                          {call.LegB?.["Remote-RTP-Port"]}
                        </p>
                        <p>
                          SIP: {call.LegB?.["Local-SIP-IP"]}:
                          {call.LegB?.["Local-SIP-Port"]} ⇆{" "}
                          {call.LegB?.["Remote-SIP-IP"]}:
                          {call.LegB?.["Remote-SIP-Port"]}
                        </p>
                        <p>Call-ID: {call.LegB?.["call-id"]}</p>
                        <p>
                          Disconnect-Cause:{" "}
                          {call.LegB?.["h323-disconnect-cause"]}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))
          ) : (
            <div className="text-center py-4">Nenhuma chamada ativa</div>
          )}
        </div>
      </div>
    </div>
  );
}
