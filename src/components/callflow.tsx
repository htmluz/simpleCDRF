import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  HomerPcapData,
  HomerRTCPFlows,
  HomerRTPFlows,
  HomerSIPMessages,
} from "@/models/bilhetes";
import { X } from "lucide-react";

interface CallFlowProps {
  pcapData: HomerPcapData | null | undefined;
}

const CallFlow = ({ pcapData }: CallFlowProps) => {
  const [selectedPacket, setSelectedPacket] = useState<
    HomerSIPMessages | HomerRTCPFlows | HomerRTPFlows | null
  >(null);
  const [ips, setIps] = useState<string[]>([]);

  useEffect(() => {
    if (pcapData) {
      const uniqueIps = new Set<string>();
      pcapData.messages.forEach((msg) => {
        if (msg.type == "sip") {
          uniqueIps.add(msg.protocol_header.srcIp);
          uniqueIps.add(msg.protocol_header.dstIp);
        } else if (msg.type == "rtcp_flow" || msg.type == "rtp_flow") {
          uniqueIps.add(msg.src_ip);
          uniqueIps.add(msg.dst_ip);
        }
      });
      setIps([...uniqueIps]);
    }
  }, [pcapData]);

  const formatSipMessage = (message: string) => {
    return message.split("\\r\\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const getColumnIndex = (ip: string) => ips.indexOf(ip);

  const extractSipMethod = (message: string): string | null => {
    const match = message.match(
      /^(?:SIP\/2\.0\s+([^\r\n]+)|([A-Z]+)\s+.*SIP\/2\.0)/
    );
    return match ? match[1] || match[2] : null;
  };

  return (
    <div className="flex rounded-lg overflow-hidden h-[80vh] shadow">
      <div className="flex flex-col flex-grow">
        <div className="flex-none border-b-2 dark:border-neutral-700">
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${ips.length + 1}, 1fr)` }}
          >
            <div className="text-center p-2">Timestamp</div>
            {ips.map((ip, idx) => (
              <div key={idx} className="text-center font-semibold p-2">
                {ip}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0">
            <div className="relative h-full">
              {ips.map((_, idx) => (
                <div
                  key={idx}
                  className="absolute h-[100%] w-px dark:bg-neutral-500 bg-neutral-600"
                  style={{ left: `${((idx + 1.5) / (ips.length + 1)) * 100}%` }}
                ></div>
              ))}
              {pcapData?.messages.map((msg, i) => {
                let srcIndex, dstIndex;
                if (msg.type == "sip") {
                  srcIndex = getColumnIndex(msg.protocol_header.srcIp);
                  dstIndex = getColumnIndex(msg.protocol_header.dstIp);
                } else {
                  srcIndex = getColumnIndex(msg.src_ip);
                  dstIndex = getColumnIndex(msg.dst_ip);
                }
                const gridCols = ips.length + 1;
                const getColumnPosition = (index: number) =>
                  `${((index + 1.5) / gridCols) * 100}%`;
                const srcPos = getColumnPosition(srcIndex);
                const dstPos = getColumnPosition(dstIndex);

                return (
                  <div
                    key={i}
                    className={`grid items-center transition-colors duration-75 ${
                      selectedPacket === msg
                        ? "bg-neutral-200 dark:bg-neutral-800"
                        : ""
                    }`}
                    onClick={() => setSelectedPacket(msg)}
                    style={{
                      gridTemplateColumns: `repeat(${ips.length + 1}, 1fr)`,
                      minHeight: "2rem",
                    }}
                  >
                    <div className="text-center text-sm">
                      {msg.type == "sip" ? (
                        <>
                          {format(msg.create_date, "dd/MM/yyyy HH:mm:ss.SSS")}
                        </>
                      ) : (
                        <>
                          {format(
                            msg.messages[0].create_date,
                            "dd/MM/yyyy HH:mm:ss.SSS"
                          )}
                        </>
                      )}
                    </div>
                    <svg className="absolute w-full pointer-events-none text-neutral-800 dark:text-neutral-200">
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="9"
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
                        x={`${
                          (Number(srcPos.slice(0, -1)) +
                            Number(dstPos.slice(0, -1))) /
                          2
                        }%`}
                        y="49%"
                        className="text-xs fill-current font-mono"
                        textAnchor="middle"
                      >
                        {msg.type === "sip" ? (
                          <>{extractSipMethod(msg.raw)}</>
                        ) : msg.type === "rtcp_flow" ? (
                          "RTCP"
                        ) : (
                          "RTP"
                        )}
                      </text>
                      <line
                        x1={srcPos}
                        y1="51%"
                        x2={dstPos}
                        y2="51%"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {selectedPacket && selectedPacket.type == "sip" && (
        <div className="w-80 border-l-2 dark:border-neutral-700 overflow-y-auto">
          <div className="p-1">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold mb-4">
                {selectedPacket.data_header.cseq}
              </h3>
              <X
                onClick={() => setSelectedPacket(null)}
                className="h-5 w-5 text-neutral-700 mt-1 cursor-pointer hover:bg-neutral-200 rounded-3xl transition-colors duration-200"
              />
            </div>
            <pre className="whitespace-pre-wrap break-all text-sm">
              {formatSipMessage(selectedPacket.raw)}
            </pre>
          </div>
        </div>
      )}
      {selectedPacket && selectedPacket.type == "rtcp_flow" && (
        <div className="w-80 border-l-2 dark:border-neutral-700 overflow-y-auto">
          <div className="p-1">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold mb-4">RTCP</h3>
              <X
                onClick={() => setSelectedPacket(null)}
                className="h-5 w-5 text-neutral-700 mt-1 cursor-pointer hover:bg-neutral-200 rounded-3xl transition-colors duration-200"
              />
            </div>
            <pre className="whitespace-pre-wrap break-all text-sm">
              {selectedPacket.src_ip}:
              {selectedPacket.messages[0].protocol_header.srcPort} <b> ⇆ </b>{" "}
              {selectedPacket.dst_ip}:
              {selectedPacket.messages[0].protocol_header.dstPort}
              <br />
              <b>Início:</b>{" "}
              {format(
                selectedPacket.messages[0].create_date,
                "dd/MM/yyyy HH:mm:ss.SSS"
              )}
              <br />
              <b>Fim:</b>{" "}
              {format(
                selectedPacket.messages[selectedPacket.messages.length - 1]
                  .create_date,
                "dd/MM/yyyy HH:mm:ss.SSS"
              )}
              <br />
              <b>Duração:</b>{" "}
              {(
                Math.abs(
                  new Date(
                    selectedPacket.messages[
                      selectedPacket.messages.length - 1
                    ].create_date
                  ).getTime() -
                    new Date(selectedPacket.messages[0].create_date).getTime()
                ) / 1000
              ).toFixed(3)}
              s
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallFlow;
