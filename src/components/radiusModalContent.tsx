import { CallRecord } from "@/models/bilhetes";
import { format } from "date-fns";

interface Props {
  radiusRow: CallRecord | null;
}

export default function RadiusModalContent({ radiusRow }: Props) {
  return (
    <>
      {radiusRow && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            <div>
              <h4 className="text-sm">Codec</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["Codec"] || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm">Duração</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["Acct-Session-Time"] || "N/A"}s
              </p>
            </div>
            <div>
              <h4 className="text-sm">Gateway</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["Gw-Name"] || radiusRow["NAS-IP-Address"]}
              </p>
            </div>
            <div>
              <h4 className="text-sm">Protocolo</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["Protocol"] || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm">Tipo de Ligação</h4>
              <p className="text-sm text-muted-foreground truncate">
                {radiusRow["h323-call-type"] || "N/A"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4 pb-1">
            <div>
              <h4 className="text-sm">Horário do Setup</h4>
              <p className="text-sm text-muted-foreground truncate">
                {format(radiusRow["h323-setup-time"], "HH:mm:ss") || "N/A"}
              </p>
            </div>
            <div>
              <h4>Início do Áudio</h4>
              <p className="text-sm text-muted-foreground">
                {format(radiusRow["Ring-Start"], "HH:mm:ss") || "N/A"}
              </p>
            </div>
            <div>
              <h4>Conectado</h4>
              <p className="text-sm text-muted-foreground">
                {format(radiusRow["h323-connect-time"], "HH:mm:ss") || "N/A"}
              </p>
            </div>
            <div>
              <h4>Desconectado</h4>
              <p className="text-sm text-muted-foreground">
                {format(radiusRow["h323-disconnect-time"], "HH:mm:ss") || "N/A"}
              </p>
            </div>
            <div>
              <h4>Causa Desconexão</h4>
              <p className="text-sm text-muted-foreground truncate">
                {radiusRow["h323-disconnect-cause"] || "N/A"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-b-2 pb-1">
            <div>
              <h4 className="text-sm">Call-ID</h4>
              <p className="text-sm text-muted-foreground truncate">
                {radiusRow["call-id"] || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm">Origem da Perna</h4>
              <p className="text-sm text-muted-foreground truncate">
                {radiusRow["h323-call-origin"] || "N/A"}
              </p>
            </div>
            <div>
              <h4>Origem Desconexão</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["release-source"] || "N/A"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Origem</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["Calling-Station-Id"] || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Destino</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["Called-Station-Id"] || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-medium">MOS TX</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["MOS-Egress"] || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-medium">MOS RX</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["MOS-Ingress"] || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-medium">NAP Origem</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["User-Name"] || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-medium">NAP Destino</h4>
              <p className="text-sm text-muted-foreground">
                {radiusRow["Cisco-NAS-Port"] || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Endereços de Origem</h4>
              <p className="text-sm text-muted-foreground">
                SIP: {radiusRow["Local-SIP-IP"] || "N/A"}:
                {radiusRow["Local-SIP-Port"] || "N/A"} RTP:{" "}
                {radiusRow["Local-RTP-IP"] || "N/A"}:
                {radiusRow["Local-RTP-Port"] || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Endereços de Destino</h4>
              <p className="text-sm text-muted-foreground">
                SIP: {radiusRow["Remote-SIP-IP"] || "N/A"}:
                {radiusRow["Remote-SIP-Port"] || "N/A"} RTP:{" "}
                {radiusRow["Remote-RTP-IP"] || "N/A"}:
                {radiusRow["Remote-RTP-Port"] || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
