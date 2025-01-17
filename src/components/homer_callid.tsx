import React, { useState, useEffect } from "react";
import { LoaderCircle, X } from "lucide-react";
import { format } from "date-fns";
import { HomerCallMessages } from "@/models/bilhetes";
import { Button } from "./ui/button";
import RTCPModal from "./rtcp";

interface PCAPTabProps {
  callId?: string | undefined;
  time?: string | undefined;
  pcapA?: HomerCallMessages[];
}

const PCAPTab: React.FC<PCAPTabProps> = ({ callId, time, pcapA }) => {
  const [pcapData, setPcapData] = useState<HomerCallMessages[] | null>(
    pcapA || null
  );
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

  return (
    <div className="flex h-full max-h-[calc(100vh-100px)]">
      <div className="flex-1 px-2 py-1 bg-gray-50 dark:bg-neutral-800 rounded-lg shadow-inner min-w-[1080px] h-full max-h-[95%] overflow-hidden">
        <div className="w-full flex flex-col">
          <div className="flex-none">
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${ips.length + 1}, 1fr)` }}
            >
              <div
                className="border-b-2 text-center border-gray-600 dark:border-neutral-400 p-2 mx-5"
                style={{
                  gridColumn: 1,
                  gridRow: 1,
                }}
              >
                Timestamp
              </div>
              {ips.map((ip, index) => (
                <div key={index} className="relative">
                  <div
                    key={index}
                    className="border-b-2 border-gray-600 bg-gray-50 dark:bg-neutral-800 dark:border-neutral-400 p-2 text-center mx-5 relative z-10"
                  >
                    {ip}
                  </div>
                  <div
                    className="absolute top-0 h-[calc(100vh-200px)] w-px bg-gray-300 dark:bg-neutral-600"
                    style={{
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative overflow-auto h-[calc(100% - 40px)]"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style>
              {`
                div::-webkit-scrollbar {
                  display: none;
              }`}
            </style>
            {pcapData.map((p, i) => {
              const srcIndex = getColumnIndex(p.stream.src_ip);
              const dstIndex = getColumnIndex(p.stream.dst_ip);
              const gridCols = ips.length + 1;
              const getColumnPosition = (index: any) => {
                return `${(index + 1) * (100 / gridCols)}%`;
              };
              const srcPos = getColumnPosition(srcIndex + 0.5);
              const dstPos = getColumnPosition(dstIndex + 0.5);
              return (
                <div
                  key={i}
                  className={`grid items-center hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors ${
                    selectedPacket === p
                      ? "bg-gray-200 dark:bg-neutral-700"
                      : ""
                  }`}
                  onClick={() => setSelectedPacket(p)}
                  style={{
                    gridTemplateColumns: `repeat(${ips.length + 1}, 1fr)`,
                    minHeight: "2rem",
                  }}
                >
                  <div
                    className="flex items-center justify-center p-2  text-sm"
                    style={{
                      gridColumn: 1,
                      gridRow: 1,
                    }}
                  >
                    {formatTime(Number(p.values[0][0]))}
                  </div>

                  <svg className="absolute w-full pointer-events-none dark:text-white">
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
                          className="dark:fill-white"
                        />
                      </marker>
                    </defs>
                    <text
                      x={srcPos > dstPos ? dstPos : srcPos}
                      y="49%"
                      className="text-sm dark:fill-white"
                      textAnchor="middle"
                      dx={
                        Math.abs(parseInt(srcPos) - parseInt(dstPos)) / 2 + "%"
                      }
                    >
                      {p.stream.type == "sip"
                        ? extractSipMethod(p.values[0][1])
                        : "RTP"}
                    </text>
                    <line
                      x1={srcPos}
                      y1="51%"
                      x2={dstPos}
                      y2="51%"
                      stroke="currentColor"
                      className="dark:stroke-white"
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

      {selectedPacket && (
        <div className="flex-1 max-w-prose h-[95%] ml-4 bg-gray-50 dark:bg-neutral-800 rounded-lg shadow-inner overflow-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedPacket.stream.type == "sip" ? (
                  <>
                    {selectedPacket.stream.method} -{" "}
                    {formatTime(Number(selectedPacket.values[0][0]))}
                  </>
                ) : (
                  <>RTP</>
                )}
              </h3>
              <button
                onClick={() => setSelectedPacket(null)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="font-mono text-sm whitespace-pre-wrap break-all">
              {selectedPacket.stream.type == "sip" ? (
                formatSipMessage(selectedPacket.values[0][1])
              ) : (
                <>
                  <div>
                    <p className="text-center">
                      {selectedPacket.stream.src_ip}:
                      {selectedPacket.stream.src_port}
                      <b> ⇆ </b>
                      {selectedPacket.stream.dst_ip}:
                      {selectedPacket.stream.dst_port}
                    </p>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full mt-1"
                    >
                      Estatísticas RTP
                    </Button>
                    <RTCPModal
                      isOpen={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                      txData={selectedPacket}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCAPTab;
