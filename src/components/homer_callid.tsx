import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface PcapResult {
  stream: {
    src_ip: string;
    dst_ip: string;
    method: string;
    src_port: string;
    dst_port: string;
  };
  values: [string, string][];
}

interface PCAPTabProps {
  callId: string | undefined;
  time: string | undefined;
}

const PCAPTab: React.FC<PCAPTabProps> = ({ callId, time }) => {
  const [pcapData, setPcapData] = useState<PcapResult[] | null>(null);
  const [ips, setIps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPacket, setSelectedPacket] = useState<PcapResult | null>(null);
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
          query: `{job="heplify-server"} |~ \`${callId}\``,
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
          setError("Failed to fetch PCAP data");
        }
      } catch (err) {
        console.log(err);
        setError("Error fetching PCAP data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPcapData();
  }, [callId]);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center bg-muted rounded-md">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-48 flex items-center justify-center bg-muted rounded-md">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!pcapData?.length) {
    return (
      <div className="h-48 flex items-center justify-center bg-muted rounded-md">
        <p className="text-muted-foreground">Nenhum dado PCAP encontrado</p>
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
    <Card className="p-6 bg-gray-50 dark:bg-neutral-800 h-full">
      <div className="w-full">
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
            <div
              key={index}
              className="border-b-2 border-gray-600 dark:border-neutral-400 p-2 text-center mx-5"
            >
              {ip}
            </div>
          ))}
        </div>

        <div className="relative">
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
                className="grid items-center my-2 hover:bg-gray-200 dark:hover:bg-neutral-900 transition-colors"
                onClick={() => {
                  setSelectedPacket(p);
                  setIsModalOpen(true);
                }}
                style={{
                  gridTemplateColumns: `repeat(${ips.length + 1}, 1fr)`,
                  minHeight: "2rem",
                }}
              >
                <div
                  className="flex items-center justify-center p-2 mx-5 text-sm"
                  style={{
                    gridColumn: 1,
                    gridRow: 1,
                  }}
                >
                  {formatTime(Number(p.values[0][0]))}
                </div>

                <svg className="absolute w-full h-full pointer-events-none dark:text-white">
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
                    y="50%"
                    className="text-sm dark:fill-white"
                    textAnchor="middle"
                    dx={Math.abs(parseInt(srcPos) - parseInt(dstPos)) / 2 + "%"}
                  >
                    {extractSipMethod(p.values[0][1])}
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[80%] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPacket?.stream.method} -{" "}
              {formatTime(Number(selectedPacket?.values[0][0] || 0))}
            </DialogTitle>
          </DialogHeader>
          <div className="font-mono text-sm whitespace-pre">
            {selectedPacket && formatSipMessage(selectedPacket.values[0][1])}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PCAPTab;
