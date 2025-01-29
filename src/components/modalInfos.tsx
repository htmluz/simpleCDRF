import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CallRecord, HomerPcapData, HomerRTCPFlows } from "@/models/bilhetes";
import RadiusModalContent from "./radiusModalContent";
import {
  ArrowRightLeft,
  ChartNetwork,
  ChevronLeft,
  Download,
  LoaderCircle,
  Phone,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import CallFlow from "./callflow";
import RTCPCharts from "./rtcp";

interface ModalInfosProps {
  isOpen: boolean;
  callId: string;
  selectedRow?: CallRecord | null;
  onOpenChange: (isBoolean: boolean) => void;
  defaultTab: "radius" | "pcap";
}

interface PcapResponse {
  data: HomerPcapData;
}

const ModalInfos = ({
  isOpen,
  callId,
  selectedRow,
  onOpenChange,
  defaultTab,
}: ModalInfosProps) => {
  const [radiusData, setRadiusData] = useState<CallRecord | null>(null);
  const [radiusLoading, setRadiusLoading] = useState(false);
  const [radiusError, setRadiusError] = useState<string | null>(null);
  const [reduzido, setReduzido] = useState(false);

  const [pcapData, setPcapData] = useState<PcapResponse | null>(null);
  const [pcapLoading, setPcapLoading] = useState(false);
  const [pcapError, setPcapError] = useState<string | null>(null);

  const [RTCPFlows, setRTCPFlows] = useState<HomerRTCPFlows[] | null>(null);

  const toggleReduzido = () => setReduzido((prev) => !prev);

  const fetchCallData = async (id: string) => {
    try {
      setRadiusLoading(true);
      setRadiusError(null);

      const response = await fetch(`${API_BASE_URL}/bilhete/${id}`);
      if (response.status == 404) {
        setRadiusError(
          "Call-ID não existente no banco de Radius. No Radius são salvas apenas as chamadas externas que passam pelo SBC :)"
        );
      } else if (!response.ok) {
        throw new Error("Falha ao buscar dados da chamada");
      }

      const data = await response.json();
      setRadiusData(data);
    } catch (err) {
      setRadiusError(err instanceof Error ? err.message : "Erro inesperado");
      setRadiusData(null);
    } finally {
      setRadiusLoading(false);
    }
  };

  const fetchPcapData = async (id: string) => {
    try {
      console.log(id);
      setPcapData(null);
      setPcapLoading(true);
      setPcapError(null);

      const response = await fetch(`${API_BASE_URL}/homer/${id}`);
      if (!response.ok) {
        setPcapError("Erro pcap 1");
      }

      const data = await response.json();
      console.log(data);
      setPcapLoading(false);
      setPcapData(data);
    } catch (err) {
      setPcapError(err instanceof Error ? err.message : "Erro pcap");
      setPcapData(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (selectedRow) {
      setRadiusData(selectedRow);
      setRadiusError(null);
      fetchPcapData(selectedRow["call-id"]);
      return;
    }
    if (!callId) {
      setRadiusError("ID da chamada não fornecido");
      setRadiusData(null);
      return;
    }

    fetchPcapData(callId);
    if (!radiusData || radiusData["call-id"] !== callId) {
      fetchCallData(callId);
    }
  }, [isOpen, callId, selectedRow]);

  useEffect(() => {
    let abc: any[] = [];
    for (const d of pcapData?.data.messages || []) {
      if (d.type == "rtcp_flow") {
        abc = [...abc, d];
      }
    }
    setRTCPFlows(abc);
    console.log(abc);
  }, [pcapData]);

  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-2xl max-h-[90%] min-h-[48%] px-3 py-3 cursor-default overflow-hidden">
        <Tabs
          defaultValue={defaultTab}
          className="w-full h-full flex"
          about="testes"
        >
          <TabsList
            className={`font-mono h-full px-1 mr-3 flex flex-col items-start justify-between w-auto border-r border-gray-200 dark:border-neutral-800 transition-all duration-300 ease-in-out ${
              !reduzido ? "w-30" : "w-[37px]"
            }`}
          >
            <div className="flex flex-col w-full">
              <TabsTrigger value="radius" className="px-1 w-full justify-start">
                {radiusLoading ? (
                  <LoaderCircle className="mt-1 mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="mt-1 mr-1 h-4 w-4" />
                )}
                {reduzido ? "" : "RADIUS"}
              </TabsTrigger>
              <TabsTrigger value="pcap" className="px-1 justify-start">
                {pcapLoading ? (
                  <LoaderCircle className="mt-1 mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="mt-1 mr-1 h-4 w-4" />
                )}
                {reduzido ? "" : "Call Flow"}
              </TabsTrigger>
              <TabsTrigger value="rtcp" className="px-1 justify-start">
                <ChartNetwork className="mr-1 h-4 w-4" />
                {reduzido ? "" : "RTCP"}
              </TabsTrigger>
              <button
                disabled
                className="px-1 justify-start hover:shadow cursor-pointer hover:bg-white dark:hover:bg-black transition-all flex w-full active:text-black rounded dark:active:text-white"
              >
                <Download
                  className={`mt-1 mr-1 h-4 w-4 ${reduzido ? "my-1" : ""}`}
                />
                {reduzido ? "" : "Captura"}
              </button>
            </div>
            <div>
              <button
                onClick={() => toggleReduzido()}
                className="px-1 justify-start hover:shadow hover:bg-white dark:hover:bg-black transition-all flex w-full active:text-black rounded dark:active:text-white"
              >
                <ChevronLeft
                  className={`mt-1 mr-1 h-4 w-4 transform transition-transform duration-300 ease-in-out ${
                    reduzido ? "rotate-180 my-1" : "rotate-0"
                  }`}
                />
                {!reduzido && "Reduzir"}
              </button>
            </div>
          </TabsList>
          <div className="w-full">
            <TabsContent value="radius">
              {radiusError ? (
                <div className="font-mono w-full h-full items-center font-bold">
                  {radiusError}
                </div>
              ) : (
                <RadiusModalContent radiusRow={radiusData} />
              )}
            </TabsContent>
            <TabsContent
              value="pcap"
              className="overflow-hidden max-w-screen-2xl h-full"
            >
              {pcapError ? (
                <>{pcapError}</>
              ) : (
                <CallFlow pcapData={pcapData?.data} />
              )}
            </TabsContent>
            <TabsContent
              value="rtcp"
              className="max-w-screen-2xl overflow-hidden"
            >
              {RTCPFlows && <RTCPCharts flows={RTCPFlows} />}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ModalInfos;
