import React from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CallRecord } from "@/models/bilhetes";
import PCAPTab from "./homer_callid";
import RadiusModalContent from "./radiusModalContent";
import { ArrowRightLeft, ChartNetwork, Download, Phone } from "lucide-react";

interface ModalInfosProps {
  isOpen: boolean;
  selectedRow: CallRecord | null;
  onOpenChange: (isBoolean: boolean) => void;
  defaultTab: "radius" | "pcap";
}

const ModalInfos = ({
  isOpen,
  selectedRow,
  onOpenChange,
  defaultTab,
}: ModalInfosProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-2xl max-h-[90%] min-h-[48%] px-3 py-3 cursor-default">
        <Tabs
          defaultValue={defaultTab}
          className="w-full h-full flex"
          about="testes"
        >
          <TabsList className="font-mono h-full px-1 mr-3 flex flex-col items-start justify-between w-auto border-r border-gray-200 dark:border-neutral-800">
            <div className="flex flex-col w-full">
              <TabsTrigger value="radius" className="px-4 w-full text-left">
                <Phone className="mr-1 h-4 w-4" />
                RADIUS
              </TabsTrigger>
              <TabsTrigger value="pcap" className="px-4 text-left">
                <ArrowRightLeft className="mr-1 h-4 w-4" />
                Call Flow
              </TabsTrigger>
              <TabsTrigger
                disabled
                value="RTCP"
                className="px-4 text-left cursor-not-allowed"
              >
                <ChartNetwork className="mr-1 h-4 w-4" />
                RTCP
              </TabsTrigger>
            </div>
            <button
              disabled
              className="justify-center cursor-not-allowed hover:shadow hover:bg-white dark:hover:bg-black transition-all flex w-full active:text-black rounded dark:active:text-white"
            >
              <Download className="mt-1 mr-1 h-4 w-4" />
              .pcap
            </button>
          </TabsList>
          <div className="w-full">
            <TabsContent value="radius">
              <RadiusModalContent radiusRow={selectedRow} />
            </TabsContent>
            <TabsContent
              value="pcap"
              className="overflow-hidden max-w-screen-2xl h-[90%] max-h-[90%]"
            >
              <PCAPTab
                callId={selectedRow?.["call-id"]}
                time={selectedRow?.["h323-setup-time"]}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ModalInfos;
