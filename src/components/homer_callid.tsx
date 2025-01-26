import React, { useState, useEffect } from "react";
import { LoaderCircle, X } from "lucide-react";
import { format } from "date-fns";
import { HomerCallMessages, HomerCall, HomerStream } from "@/models/bilhetes";
import { Button } from "./ui/button";
import RTCPModal from "./rtcp";
import { motion, AnimatePresence } from "framer-motion";
import { PCAPWriter } from "@/utils/generatePcap";
import { streamsToHomerCalls } from "@/utils/streamsToHomerCall";

interface PCAPTabProps {
  callId?: string | undefined;
  time?: string | undefined;
  pcapA?: HomerCallMessages[];
  calltoPcap?: HomerCall | null;
}

const PCAPTab: React.FC<PCAPTabProps> = ({
  callId,
  time,
  pcapA,
  calltoPcap,
}) => {
  const [pcapData, setPcapData] = useState<HomerCallMessages[] | null>(
    pcapA || null
  );
  const [callTo, setCallTo] = useState<HomerCall | null>(calltoPcap || null);
  const [ips, setIps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPacket, setSelectedPacket] =
    useState<HomerCallMessages | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function getTimeRange(isoDate: string | undefined): [number, number] {
    if (isoDate == undefined) {
      return [0, 0];
    }
    const date = new Date(isoDate);
    const beforeDate = new Date(date.getTime() - 10 * 60 * 1000);
    const afterDate = new Date(date.getTime() + 10 * 60 * 1000);

    return [beforeDate.getTime() * 1000000, afterDate.getTime() * 1000000];
  }

  useEffect(() => {
    const fetchPcapData = async () => {
      if (pcapA) {
        const result = pcapA.sort((a: any, b: any) => {
          const timeA = BigInt(a.values[0][0]);
          const timeB = BigInt(b.values[0][0]);
          return Number(timeA - timeB);
        });

        const uniqueIps = new Set<string>();
        result.forEach((packet) => {
          uniqueIps.add(packet.stream.src_ip);
          uniqueIps.add(packet.stream.dst_ip);
        });
        setIps([...uniqueIps]);
        setIsLoading(false);
        return;
      }

      if (!callId) {
        setIsLoading(false);
        return;
      }

      try {
        const [before, after] = getTimeRange(time);
        const baseUrl = "http://10.90.0.58:3100/loki/api/v1/query_range";
        const params = new URLSearchParams({
          direction: "backward",
          end: after.toString(),
          start: before.toString(),
          limit: "1000",
          query: `{job="heplify-server", call_id="${callId}"}`,
          step: "15000ms",
        });

        const response = await fetch(`${baseUrl}?${params}`);
        const data = await response.json();

        if (data.status === "success") {
          const result = data.data.result.sort((a: any, b: any) => {
            const timeA = BigInt(a.values[0][0]);
            const timeB = BigInt(b.values[0][0]);
            return Number(timeA - timeB);
          });

          const uniqueIps = new Set<string>();

          for (const b of result) {
            uniqueIps.add(b.stream.src_ip);
            uniqueIps.add(b.stream.dst_ip);
          }

          if (!calltoPcap) {
            setCallTo(streamsToHomerCalls(result));
          }
          setIps([...uniqueIps]);
          setPcapData(result);
        } else {
          setError("Erro procurando pela chamada");
        }
      } catch (err) {
        console.error(err);
        setError("Erro procurando pela chamada");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPcapData();
  }, [callId, pcapA]);

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <LoaderCircle className="w-10 h-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center rounded-md">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!pcapData?.length) {
    return (
      <div className="h-80 flex items-center justify-center rounded-md">
        <p className="text-muted-foreground font-mono">
          Nenhuma captura encontrada :(
        </p>
      </div>
    );
  }

  const getColumnIndex = (ip: string) => ips.indexOf(ip);

  function formatTime(
    timestamp: number,
    dateFormat: string = "HH:mm:ss.SSS dd/MM/yyyy"
  ): string {
    const timestampMs = Math.floor(timestamp / 1_000_000);
    return format(new Date(timestampMs), dateFormat);
  }

  const formatSipMessage = (message: string) => {
    return message.split("\\r\\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const extractSipMethod = (message: string): string | null => {
    const match = message.match(
      /^(?:SIP\/2\.0\s+([^\r\n]+)|([A-Z]+)\s+.*SIP\/2\.0)/
    );
    return match ? match[1] || match[2] : null;
  };

  const generatePCAP = (callData: HomerCall | null | undefined) => {
    if (!callData) {
      alert(
        "Sem dados para gerar a captura. Se persistir entre em contato com um administrador"
      );
      return;
    }
    try {
      const pcapWriter = new PCAPWriter();
      const pcapBlob = pcapWriter.generatePCAP(callData);

      const link = document.createElement("a");
      link.href = URL.createObjectURL(pcapBlob);
      link.download = `${callData.call_id}.pcap`;
      link.click();

      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("erro gerando a captura", error);
      alert(
        "Erro gerando a captura. Se persistir entre em contato com um administrador"
      );
    }
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-180px)] p-0 rounded-lg border-l-2 bg-white dark:bg-black">
      <div className="flex-1 bg-white dark:bg-black rounded-l-lg min-w-[1080px] h-full max-h-[100%] overflow-hidden relative">
        <Button
          className="absolute bottom-3 right-3 z-50"
          onClick={() => generatePCAP(callTo)}
        >
          Download .pcap
        </Button>
        <div className="w-full flex flex-col h-full">
          <div className="flex-none p-1">
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${ips.length + 1}, 1fr)` }}
            >
              <div className="text-center font-semibold text-neutral-700 dark:text-neutral-300">
                Timestamp
              </div>
              {ips.map((ip, index) => (
                <div key={index} className="relative">
                  <div
                    key={index}
                    className="text-center font-semibold bg-white dark:bg-black border-b-2 dark:border-b-2 dark:border-neutral-300 relative z-10 mx-5  text-neutral-700 dark:text-neutral-300"
                  >
                    {ip}
                  </div>
                  <div
                    className="absolute top-0 h-[calc(100vh-200px)] w-px bg-gray-300 dark:bg-neutral-500"
                    style={{
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex-1 overflow-auto">
            {pcapData.map((p, i) => {
              const srcIndex = getColumnIndex(p.stream.src_ip);
              const dstIndex = getColumnIndex(p.stream.dst_ip);
              const gridCols = ips.length + 1;
              const getColumnPosition = (index: number) =>
                `${(index + 1) * (100 / gridCols)}%`;
              const srcPos = getColumnPosition(srcIndex + 0.5);
              const dstPos = getColumnPosition(dstIndex + 0.5);

              return (
                <div
                  key={i}
                  className={`grid items-center transition-colors ${
                    selectedPacket === p
                      ? "bg-neutral-200 dark:bg-neutral-800"
                      : ""
                  }`}
                  onClick={() => setSelectedPacket(p)}
                  style={{
                    gridTemplateColumns: `repeat(${ips.length + 1}, 1fr)`,
                    minHeight: "2rem",
                  }}
                >
                  <div className="flex items-center justify-center p-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {formatTime(Number(p.values[0][0]))}
                  </div>
                  <svg className="absolute w-full pointer-events-none text-neutral-800 dark:text-neutral-200">
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="currentColor"
                        />
                      </marker>
                    </defs>
                    <text
                      x={srcPos > dstPos ? dstPos : srcPos}
                      y="49%"
                      className="text-xs fill-current"
                      textAnchor="middle"
                      dx={`${
                        Math.abs(
                          Number.parseInt(srcPos) - Number.parseInt(dstPos)
                        ) / 2
                      }%`}
                    >
                      {p.stream.type === "sip"
                        ? extractSipMethod(p.values[0][1])
                        : "RTP"}
                    </text>
                    <line
                      x1={srcPos}
                      y1="51%"
                      x2={dstPos}
                      y2="51%"
                      stroke="currentColor"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedPacket && (
          <motion.div
            className="flex-1 max-w-md h-[100%] max-h-[100%] bg-white dark:bg-black border-r-2 rounded overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                  {selectedPacket.stream.type === "sip" ? (
                    <>
                      {selectedPacket.stream.method} -{" "}
                      {formatTime(Number(selectedPacket.values[0][0]))}
                    </>
                  ) : (
                    <>RTP</>
                  )}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPacket(null)}
                  className="hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                <pre className="font-mono text-sm whitespace-pre-wrap break-all text-neutral-700 dark:text-neutral-300">
                  {selectedPacket.stream.type === "sip" ? (
                    formatSipMessage(selectedPacket.values[0][1])
                  ) : (
                    <div>
                      <p className="text-center">
                        {selectedPacket.stream.src_ip}:
                        {selectedPacket.stream.src_port}
                        <b> ⇆ </b>
                        {selectedPacket.stream.dst_ip}:
                        {selectedPacket.stream.dst_port}
                      </p>
                      <Button className="w-full mt-4">RTP Statistics</Button>
                    </div>
                  )}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PCAPTab;
