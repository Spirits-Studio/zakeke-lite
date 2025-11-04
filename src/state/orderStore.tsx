import { create } from 'zustand';

export type Mini = { id: number; guid: string; name: string; selected: boolean } | null;

// VistaCreate publish payload (use a stricter type if you have one)
export type LabelDesign = any;
export type LabelDesigns = { front: LabelDesign | null; back: LabelDesign | null };

// Order coming from your parent window message (subset you care about)
export type ParentOrderPayload = {
  bottle: { id: number; guid: string; name: string; selected: boolean };
  liquid: { id: number; guid: string; name: string; selected: boolean };
  closure: { id: number; guid: string; name: string; selected: boolean };
  label: { id: number; guid: string; name: string; selected: boolean };
};

// Local Order in the configurator state
export type Order = {
  sku: string | null;
  price: number | string | null;
  bottleSel: any | null;
  liquidSel: any | null;
  closureSel: any | null;
  labelSel: any | null;
  bottle: Mini;
  liquid: Mini;
  closure: Mini;
  label: Mini;
};

export type OrderState = {
  order: Order;
  labelDesigns: LabelDesigns;
  /** existing setter used when you derive selections inside the configurator */
  setFromSelections: (args: {
    selections: {
      bottleSel: any | null; liquidSel: any | null; closureSel: any | null; labelSel: any | null;
      bottle: Mini; liquid: Mini; closure: Mini; label: Mini;
    };
    sku: string | null;
    price: number | string | null;
  }) => void;
  /** persist a design (front/back) coming from VistaCreate */
  setLabelDesign: (side: 'front' | 'back', design: LabelDesign | null) => void;
  /** clear both designs (useful when bottle changes or user resets) */
  clearLabelDesigns: () => void;
  /** convenience: handle the exact parent postMessage payload you showed */
  setFromUploadDesign: (payload: {
    order: ParentOrderPayload;
    designSide: 'front' | 'back';
    designExport: LabelDesign;
  }) => void;
};

export const useOrderStore = create<OrderState>((set, get) => ({
  order: {
    sku: null,
    price: null,
    bottleSel: null,
    liquidSel: null,
    closureSel: null,
    labelSel: null,
    bottle: null,
    liquid: null,
    closure: null,
    label: null,
  },
  labelDesigns: { front: null, back: null },
  

  setFromSelections: ({ selections, sku, price }) =>
    set((state) => {
      const next: Order = {
        sku,
        price,
        bottleSel: selections.bottleSel,
        liquidSel: selections.liquidSel,
        closureSel: selections.closureSel,
        labelSel: selections.labelSel,
        bottle: selections.bottle,
        liquid: selections.liquid,
        closure: selections.closure,
        label: selections.label,
      };

      const prev = state.order;
      const same =
        prev.sku === next.sku &&
        String(prev.price) === String(next.price) &&
        (prev.bottle?.id ?? 0) === (next.bottle?.id ?? 0) &&
        (prev.liquid?.id ?? 0) === (next.liquid?.id ?? 0) &&
        (prev.closure?.id ?? 0) === (next.closure?.id ?? 0) &&
        (prev.label?.id ?? 0) === (next.label?.id ?? 0);

      const bottleChanged = (prev.bottle?.id ?? 0) !== (next.bottle?.id ?? 0);

      if (same && !bottleChanged) return state; // No change, don’t update

      if (bottleChanged) {
        // When bottle changes, UVs/areas differ -> clear designs as they may no longer fit
        return {
          order: next,
          labelDesigns: { front: null, back: null },
        };
      }

      return { order: next };
    }),

  setLabelDesign: (side, design) =>
    set((state) => ({ labelDesigns: { ...state.labelDesigns, [side]: design } })),

  clearLabelDesigns: () => set({ labelDesigns: { front: null, back: null } }),

  setFromUploadDesign: ({ order: parentOrder, designSide, designExport }) => {
    // 1) persist design
    set((state) => ({ labelDesigns: { ...state.labelDesigns, [designSide]: designExport } }));

    // 2) optionally sync the Mini selections coming from the parent message
    const nextOrderPart: Partial<Order> = {
      bottle: parentOrder?.bottle ?? null,
      liquid: parentOrder?.liquid ?? null,
      closure: parentOrder?.closure ?? null,
      label: parentOrder?.label ?? null,
    };

    set((state) => {
      const prev = state.order;
      const bottleChanged = (prev.bottle?.id ?? 0) !== (nextOrderPart.bottle?.id ?? prev.bottle?.id ?? 0);

      // merge but keep pricing/sku and *Sel fields as-is (your configurator logic owns those)
      const merged: Order = {
        ...prev,
        ...nextOrderPart,
      };

      return bottleChanged
        ? { order: merged, labelDesigns: { front: null, back: null, [designSide]: designExport } as LabelDesigns }
        : { order: merged };
    });
  },
}));
