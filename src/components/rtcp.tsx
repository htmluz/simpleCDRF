import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomGraphTooltip } from "./rechartstooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Tooltip as Tooltip2,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HomerCallMessages } from "@/models/bilhetes";

interface RTCPModalProps {
  isOpen: boolean;
  onClose: () => void;
  txData: HomerCallMessages;
}

const RTCPModal: React.FC<RTCPModalProps> = ({ isOpen, onClose, txData }) => {
  const [parsedTxData, setParsedTxData] = useState<RTCPDataPoint[]>([]);

  useEffect(() => {
    const parseData = (data: HomerCallMessages): RTCPDataPoint[] => {
      return data.values
        .map((value: any) => ({
          timestamp: parseInt(value[0]),
          data: JSON.parse(value[1]),
        }))
        .sort((a: any, b: any) => a.timestamp - b.timestamp);
    };

    setParsedTxData(parseData(txData));
  }, [txData]);

  const calculateMOS = (dataPoint: RTCPDataPoint): number | null => {
    if (
      !dataPoint.data.report_blocks ||
      dataPoint.data.report_blocks.length === 0 ||
      !dataPoint.data.report_blocks_xr
    ) {
      console.warn("Dados insuficientes para calcular MOS", dataPoint);
      return null;
    }

    const delay = dataPoint.data.report_blocks_xr.round_trip_delay || 0;
    const packetLoss =
      (dataPoint.data.report_blocks[0].fraction_lost || 0) * 100; // Convert to percentage
    const jitter = dataPoint.data.report_blocks[0].ia_jitter || 0;

    const Rq = 93.2;
    const Id =
      0.024 * delay + 0.11 * (delay - 177.3) * Math.max(0, delay - 177.3);
    const Ie = 30 * Math.log(1 + 15 * packetLoss);
    const Bpl = 25.1;
    const BurstR = (dataPoint.data.report_blocks_xr.burst_density || 0) / 100; // Assuming burst_density is in percentage

    const Ieff =
      packetLoss + BurstR === 0
        ? Ie
        : Ie + ((95 - Ie) * packetLoss) / (packetLoss + BurstR);

    let R = Rq - Id - Ieff + 0.1 * (Rq - Id - Ieff) * (15 - Ieff);
    R = Math.max(0, Math.min(100, R));

    if (R < 0) return 1;
    if (R > 100) return 4.5;
    return 1 + 0.035 * R + R * (R - 60) * (100 - R) * 7e-6;
  };

  const renderMOSChart = (data: RTCPDataPoint[]) => {
    const mosData = data
      .map((point) => ({
        ...point,
        mos: calculateMOS(point),
      }))
      .filter((point) => point.mos !== null);

    return (
      <div className="h-64 w-full">
        <h3 className="text-sm font-semibold mb-2">Mean Opinion Score (MOS)</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={mosData}>
            <CartesianGrid strokeDasharray="6 6" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) =>
                new Date(tick / 1000000).toLocaleTimeString()
              }
              fontSize={10}
            />
            <YAxis domain={[1, 5]} fontSize={10} />
            <Tooltip
              labelFormatter={(label) =>
                new Date(label / 1000000).toLocaleString()
              }
              content={<CustomGraphTooltip />}
              formatter={(value) => [
                value !== null ? Number(value).toFixed(2) : "N/A",
                "MOS",
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="mos"
              stroke="#8884d8"
              name="MOS"
              dot={false}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderBarChart = (
    data: RTCPDataPoint[],
    dataKey: string,
    title: string,
    nameKey: string
  ) => (
    <div className="h-64 w-full">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(tick) =>
              new Date(tick / 1000000).toLocaleTimeString()
            }
            fontSize={10}
          />
          <YAxis fontSize={10} />
          <Tooltip
            content={<CustomGraphTooltip />}
            labelFormatter={(label) =>
              new Date(label / 1000000).toLocaleString()
            }
          />
          <Legend />
          <Bar dataKey={dataKey} fill="#4299e1" name={nameKey} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderChart = (
    data: RTCPDataPoint[],
    dataKeys: string | string[],
    dataName: string | string[],
    title: string,
    tooltipCont: string,
    colors: string[] = ["#4299e1", "#6742e1", "#e34fe3"]
  ) => {
    const dataKeysArray = Array.isArray(dataKeys) ? dataKeys : [dataKeys];
    const dataNameArray = Array.isArray(dataName) ? dataName : [dataName];

    return (
      <div className="h-64 w-full">
        <div className="flex">
          <h3 className="text-sm font-semibold mb-2 cursor-default mr-1">
            {title}
          </h3>
          <TooltipProvider>
            <Tooltip2>
              <TooltipTrigger asChild>
                <Info className="w-5 h-5" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipCont}</p>
              </TooltipContent>
            </Tooltip2>
          </TooltipProvider>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="6 6" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) =>
                new Date(tick / 1000000).toLocaleTimeString()
              }
              fontSize={10}
            />
            <YAxis fontSize={10} />
            <Tooltip
              content={<CustomGraphTooltip />}
              labelFormatter={(label) =>
                new Date(label / 1000000).toLocaleString()
              }
            />
            <Legend />
            {dataKeysArray.map((dataKey, index) => (
              <Line
                key={dataKey}
                type="monotone"
                dot={false}
                dataKey={dataKey}
                stroke={colors[index % colors.length]}
                name={dataNameArray[index]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95%] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-0">
            Estatísticas RTP
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 cursor-default">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-2 shadow-md text-sm font-mono">
            <p>
              <b>Call-ID: </b>
              {txData.stream.call_id}
            </p>
            <p>
              <b>Src: </b>
              {txData.stream.src_ip}:{txData.stream.src_port} <b>Dst: </b>{" "}
              {txData.stream.dst_ip}:{txData.stream.dst_port}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md md:col-span-2 p-4">
              <h2 className="text-lg font-semibold mb-4">
                Qualidade da Chamada
              </h2>
              {renderMOSChart(parsedTxData)}
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">
                Latência e Sincronização
              </h2>
              {renderChart(
                parsedTxData,
                ["data.report_blocks[0].dlsr"],
                ["DLSR"],
                "DLSR",
                "Mede o tempo decorrido desde que o último relatório RTCP foi recebido. É usado para calcular a latência total de ida e volta na conexão."
              )}
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">
                Desempenho de Envio
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderChart(
                  parsedTxData,
                  ["data.sender_information.packets"],
                  ["Pacotes"],
                  "Pacotes enviados",
                  "Pacotes enviados, representa a quantia de pacotes transmitidos."
                )}
                {renderChart(
                  parsedTxData,
                  ["data.sender_information.octets"],
                  ["Octetos"],
                  "Octetos enviados",
                  "Octetos enviados, representa a quantia de dados transmitidos em bytes."
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Estabilidade RTP</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderChart(
                  parsedTxData,
                  [
                    "data.report_blocks_xr.gap_duration",
                    "data.report_blocks_xr.burst_duration",
                  ],
                  ["Gap Duration", "Burst Duration"],
                  "Duração de Gap e Burst",
                  `Mostra o comportamento da transmissão de pacotes durante a chamada:
                  Gap Duration: Tempo sem transmissão de pacotes, indicando possíveis perdas ou atrasos na rede.
                  Burst Duration: Tempo de transmissão contínua de pacotes, refletindo períodos de tráfego intenso ou recuperação.
                  `
                )}
                {renderBarChart(
                  parsedTxData,
                  "data.report_blocks_xr.burst_density",
                  "Densidade de Burst",
                  "Burst Density"
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">
                Qualidade de Conexão
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderChart(
                  parsedTxData,
                  [
                    "data.report_blocks[0].fraction_lost",
                    "data.report_blocks[0].ia_jitter",
                    "data.report_blocks_xr.round_trip_delay",
                  ],
                  ["% Pacotes perdidos", "IA Jitter", "RTT"],
                  "Métricas de Qualidade",
                  "Perda de Pacotes, Jitter e Latência de Ida e Volta"
                )}
                {renderBarChart(
                  parsedTxData,
                  "data.report_blocks_xr.fraction_discard",
                  "Frações Descartadas",
                  "Fraction Discard"
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RTCPModal;
