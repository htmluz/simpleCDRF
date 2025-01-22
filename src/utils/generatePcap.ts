import { HomerCall, HomerStream } from "@/models/bilhetes";

const PCAP_CONSTANTS = {
  GLOBAL_HEADER_SIZE: 24,
  PACKET_HEADER_SIZE: 16,
  ETHERNET_HEADER_SIZE: 14,
  IP_HEADER_SIZE: 20,
  UDP_HEADER_SIZE: 8,
  MAX_PACKET_SIZE: 65535,
  MAX_UDP_PAYLOAD: 65507,
  PROTOCOLS: {
    UDP: 17,
    TCP: 6,
  },
} as const;

export class PCAPWriter {
  private createGlobalHeader(): ArrayBuffer {
    const header = new Uint8Array([
      0xd4,
      0xc3,
      0xb2,
      0xa1, // ^^ numero magico (0xa1b2c3d4 em little endian)
      0x02,
      0x00, // ^^ versao (2)
      0x04,
      0x00, // ^^ versao minor (4)
      0x00,
      0x00,
      0x00,
      0x00, // ^^ gmt pra local time
      0x00,
      0x00,
      0x00,
      0x00, // ^^ quanto de precisão pros timestamps
      0xff,
      0xff,
      0x00,
      0x00, // ^^ (65535)
      0x01,
      0x00,
      0x00,
      0x00, // ^^ data link type (1 - ethernet)
    ]);
    return header;
  }

  private createPacketHeader(timestamp: string, length: number): ArrayBuffer {
    const header = new ArrayBuffer(PCAP_CONSTANTS.PACKET_HEADER_SIZE);
    const view = new DataView(header);
    const timestampNs = BigInt(timestamp);
    const seconds = Number(timestampNs / BigInt(1000000000));
    const microseconds = Number(
      (timestampNs % BigInt(1000000000)) / BigInt(1000)
    );

    view.setUint32(0, seconds, true);
    view.setUint32(4, microseconds, true);
    view.setUint32(8, length, true);
    view.setUint32(12, length, true);
    return header;
  }

  private createEthernetHeader(): Uint8Array {
    const header = new Uint8Array(PCAP_CONSTANTS.ETHERNET_HEADER_SIZE);
    header.set([0xff, 0xff, 0xff, 0xff, 0xff, 0xff], 0);
    header.set([0x00, 0x11, 0x22, 0x33, 0x44, 0x55], 6);
    // ethertype v4
    header.set([0x08, 0x00], 12);
    return header;
  }

  private calculateIPChecksum(header: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < header.length; i += 2) {
      sum += (header[i] << 8) | header[i + 1];
    }
    sum = (sum >> 16) + (sum & 0xffff);
    sum += sum >> 16;
    return ~sum & 0xffff;
  }

  private createIPHeader(
    srcIP: string,
    dstIP: string,
    totalLength: number
  ): Uint8Array {
    const header = new Uint8Array(PCAP_CONSTANTS.IP_HEADER_SIZE);

    // ver 4 e ihl 5
    header[0] = 0x45;
    // DSCP e ECN
    header[1] = 0x00;
    header[2] = (totalLength >> 8) & 0xff;
    header[3] = totalLength & 0xff;
    header[4] = 0x00;
    header[5] = 0x00;
    // Flags e fragment offset
    header[6] = 0x40;
    header[7] = 0x00;
    // TTL
    header[8] = 0x40;
    header[9] = PCAP_CONSTANTS.PROTOCOLS.UDP;
    // checksum v4 n e obrigatorio
    header[10] = 0x00;
    header[11] = 0x00;
    const srcParts = srcIP.split(".").map(Number);
    header.set(srcParts, 12);
    const dstParts = dstIP.split(".").map(Number);
    header.set(dstParts, 16);
    const checksum = this.calculateIPChecksum(header);
    header[10] = (checksum >> 8) & 0xff;
    header[11] = checksum & 0xff;
    return header;
  }

  private createUDPHeader(
    srcPort: number,
    dstPort: number,
    length: number
  ): Uint8Array {
    const header = new Uint8Array(PCAP_CONSTANTS.UDP_HEADER_SIZE);
    header[0] = (srcPort >> 8) & 0xff;
    header[1] = srcPort & 0xff;
    header[2] = (dstPort >> 8) & 0xff;
    header[3] = dstPort & 0xff;
    header[4] = (length >> 8) & 0xff;
    header[5] = length & 0xff;
    // checksum v4 n e obrigatorio
    header[6] = 0x00;
    header[7] = 0x00;
    return header;
  }

  private createPacket(
    timestamp: string,
    stream: HomerStream,
    payload: Uint8Array
  ): Uint8Array {
    const srcPort = parseInt(stream.src_port) || 0;
    const dstPort = parseInt(stream.dst_port) || 0;

    const udpLength = PCAP_CONSTANTS.UDP_HEADER_SIZE + payload.length;
    const ipLength = PCAP_CONSTANTS.IP_HEADER_SIZE + udpLength;
    const totalLength = PCAP_CONSTANTS.ETHERNET_HEADER_SIZE + ipLength;

    const packet = new Uint8Array(
      PCAP_CONSTANTS.PACKET_HEADER_SIZE + totalLength
    );
    let offset = 0;
    // header pacote
    packet.set(
      new Uint8Array(this.createPacketHeader(timestamp, totalLength)),
      offset
    );
    offset += PCAP_CONSTANTS.PACKET_HEADER_SIZE;

    // header ethernet
    packet.set(this.createEthernetHeader(), offset);
    offset += PCAP_CONSTANTS.ETHERNET_HEADER_SIZE;

    // header ip
    packet.set(
      this.createIPHeader(stream.src_ip, stream.dst_ip, ipLength),
      offset
    );
    offset += PCAP_CONSTANTS.IP_HEADER_SIZE;

    // header udp
    packet.set(this.createUDPHeader(srcPort, dstPort, udpLength), offset);
    offset += PCAP_CONSTANTS.UDP_HEADER_SIZE;

    // payload
    packet.set(payload, offset);
    return packet;
  }

  public generatePCAP(callData: HomerCall): Blob {
    const packets: Uint8Array[] = [];

    packets.push(new Uint8Array(this.createGlobalHeader()));

    callData.messages.forEach((message) => {
      message.values.forEach(([timestamp, payloadText]) => {
        try {
          const payload = new TextEncoder().encode(payloadText);

          if (payload.length > PCAP_CONSTANTS.MAX_UDP_PAYLOAD) {
            console.warn(
              `payload mt grande (${payload.length} bytes), pulando pacote`
            );
            return;
          }

          const packet = this.createPacket(timestamp, message.stream, payload);
          packets.push(packet);
        } catch (error) {
          console.error("erro processando o pacote:", error);
        }
      });
    });

    // juntando tudo os pacotes
    const totalLength = packets.reduce((sum, packet) => sum + packet.length, 0);
    const pcapData = new Uint8Array(totalLength);
    let offset = 0;

    packets.forEach((packet) => {
      pcapData.set(packet, offset);
      offset += packet.length;
    });

    return new Blob([pcapData], { type: "application/octet-stream" });
  }
}
