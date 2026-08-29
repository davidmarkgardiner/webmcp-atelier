export type BuildProfile = Readonly<{
  id: string;
  name: string;
  strapline: string;
  price: number;
  gpu: string;
  vram: string;
  memory: string;
  storage: string;
  power: string;
  fit: readonly string[];
  caveat: string;
}>;

export const catalogSnapshot = "28 August 2026";

export const buildProfiles: readonly BuildProfile[] = [
  {
    id: "quiet-studio",
    name: "Quiet Studio",
    strapline: "Private AI for one or two people",
    price: 3950,
    gpu: "24 GB creator GPU",
    vram: "24 GB",
    memory: "64 GB",
    storage: "2 TB NVMe",
    power: "850 W",
    fit: ["Document search", "Coding assistants", "Small local models"],
    caveat: "Video generation queues behind other workloads.",
  },
  {
    id: "agent-forge",
    name: "Agent Forge",
    strapline: "The balanced private agent workstation",
    price: 6800,
    gpu: "32 GB workstation GPU",
    vram: "32 GB",
    memory: "128 GB",
    storage: "4 TB NVMe",
    power: "1200 W",
    fit: ["Five concurrent staff", "70B quantised models", "Agent factory"],
    caveat: "Large video jobs still benefit from an overnight queue.",
  },
  {
    id: "private-rack",
    name: "Private Rack",
    strapline: "Shared inference for a growing team",
    price: 16400,
    gpu: "Dual 48 GB workstation GPUs",
    vram: "96 GB",
    memory: "256 GB ECC",
    storage: "8 TB mirrored NVMe",
    power: "1600 W",
    fit: ["High concurrency", "Full-precision models", "Resilient services"],
    caveat: "Requires a dedicated circuit and acoustically managed space.",
  },
];

export const deploymentSteps = [
  "Hardened Ubuntu base with encrypted storage",
  "Local model runtime and private model library",
  "Team chat and retrieval workspace",
  "Symphony agent factory with guarded issue delivery",
  "Monitoring, backups, and owner-controlled remote access",
] as const;
