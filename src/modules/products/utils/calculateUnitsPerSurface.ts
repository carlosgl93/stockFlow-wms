export enum PalletType {
  Standard = "Standard",
  Chinese = "Chinese",
}

interface BoxDetails {
  width: number;
  height: number;
  depth: number;
}

interface PalletSize {
  height: number;
  width: number;
  depth: number;
}

const palletSizes: Record<PalletType, PalletSize> = {
  [PalletType.Standard]: { height: 13, width: 120, depth: 100 },
  [PalletType.Chinese]: { height: 10, width: 114, depth: 142 },
};

export function calculateUnitsPerSurface(
  palletType: PalletType,
  boxDetails: BoxDetails
): number {
  const pallet = palletSizes[palletType];
  const unitsPerWidth = Math.floor(pallet.width / boxDetails.width);
  const unitsPerDepth = Math.floor(pallet.depth / boxDetails.depth);
  return unitsPerWidth * unitsPerDepth;
}
