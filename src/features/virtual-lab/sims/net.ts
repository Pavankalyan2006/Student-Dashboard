// Computer networks: IPv4 subnetting. Pure functions, no I/O.

export interface SubnetInfo {
  cidr: string;
  network: string;
  broadcast: string;
  mask: string;
  wildcard: string;
  prefix: number;
  first_host: string | null;
  last_host: string | null;
  usable_hosts: number;
  total_addresses: number;
  ip_class: 'A' | 'B' | 'C' | 'D (multicast)' | 'E (reserved)';
  private_range: boolean;
  binary_mask: string;
}

const toNum = (ip: string): number | null => {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
};
export const ipToString = (n: number) => [24, 16, 8, 0].map((s) => (Math.floor(n / 2 ** s) % 256).toString()).join('.');
const maskOf = (prefix: number) => (prefix === 0 ? 0 : (2 ** 32 - 2 ** (32 - prefix)));

/** "192.168.10.77/26" or "192.168.10.77 255.255.255.192". Returns null for anything that is not valid. */
export function parseCidr(input: string): { ip: number; prefix: number } | null {
  const s = input.trim();
  let ipPart = s;
  let prefix: number | null = null;
  if (s.includes('/')) {
    const [a, b] = s.split('/');
    ipPart = a;
    if (!/^\d{1,2}$/.test(b.trim())) return null;
    prefix = Number(b);
  } else {
    const [a, m] = s.split(/\s+/);
    ipPart = a;
    if (!m) return null;
    const mask = toNum(m);
    if (mask === null) return null;
    const bits = mask.toString(2).padStart(32, '0');
    if (!/^1*0*$/.test(bits)) return null;
    prefix = bits.indexOf('0') === -1 ? 32 : bits.indexOf('0');
  }
  const ip = toNum(ipPart);
  if (ip === null || prefix === null || prefix < 0 || prefix > 32) return null;
  return { ip, prefix };
}

export function subnetInfo(ip: number, prefix: number): SubnetInfo {
  const mask = maskOf(prefix);
  const size = 2 ** (32 - prefix);
  const network = ip - (ip % size);
  const broadcast = network + size - 1;
  const first = Math.floor(ip / 2 ** 24);
  const ip_class = first < 128 ? 'A' : first < 192 ? 'B' : first < 224 ? 'C' : first < 240 ? 'D (multicast)' : 'E (reserved)';
  const second = Math.floor(ip / 2 ** 16) % 256;
  const private_range = first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168);
  // /31 point-to-point links use both addresses (RFC 3021); /32 is a single host.
  const usable = prefix === 32 ? 1 : prefix === 31 ? 2 : size - 2;
  return {
    cidr: `${ipToString(network)}/${prefix}`,
    network: ipToString(network),
    broadcast: ipToString(broadcast),
    mask: ipToString(mask),
    wildcard: ipToString(2 ** 32 - 1 - mask),
    prefix,
    first_host: prefix >= 31 ? ipToString(network) : ipToString(network + 1),
    last_host: prefix >= 31 ? ipToString(broadcast) : ipToString(broadcast - 1),
    usable_hosts: usable,
    total_addresses: size,
    ip_class,
    private_range,
    binary_mask: mask.toString(2).padStart(32, '0').replace(/(.{8})(?!$)/g, '$1.'),
  };
}

/** Splits a network into `count` equal subnets (count is rounded up to a power of two). */
export function splitSubnet(ip: number, prefix: number, count: number): { prefix: number; subnets: SubnetInfo[] } | null {
  if (!Number.isInteger(count) || count < 2) return null;
  const bits = Math.ceil(Math.log2(count));
  const newPrefix = prefix + bits;
  if (newPrefix > 32) return null;
  const base = subnetInfo(ip, prefix);
  const start = toNum(base.network)!;
  const size = 2 ** (32 - newPrefix);
  const total = 2 ** bits;
  const subnets = Array.from({ length: Math.min(total, 64) }, (_, i) => subnetInfo(start + i * size, newPrefix));
  return { prefix: newPrefix, subnets };
}
