/** Un prix fixe, une fourchette, un prix « dès », ou « sur devis ». */
export type Price = number | [number, number] | { from: number } | "quote";
