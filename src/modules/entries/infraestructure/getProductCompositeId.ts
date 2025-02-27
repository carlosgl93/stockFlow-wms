/**;
 *
 * @param  Params
 * @returns  Returns
 *
 */

import { IProductEntry } from "../types";

export function getProductCompositeId(p: IProductEntry) {
  const uniqueId = `${p.id}-${p.lotId}-${p.palletNumber}`;
  return uniqueId;
}
