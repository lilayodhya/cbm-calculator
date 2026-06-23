/**
 * useShipment — Manages all shipment-related state and business logic.
 *
 * This hook encapsulates: product directory, shipment items, the CBM form,
 * totals computation, freight/container calculations, and all CRUD operations.
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { calcCBM, CONTAINERS } from '../utils/calculations';
import { mergeProducts } from '../utils/deduplication';
const EMPTY_FORM = {
  unit: 'cm',
  length: '',
  width: '',
  height: '',
  packSize: 1,
  netWeight: '',
  grossWeight: '',
  name: '',
  totalPcs: '',
  presetCBM: '',  // for products with pre-calculated CBM (no L/W/H dims)
  packingString: '',
};

export function useShipment() {
  /* ── Product directory — fetched from backend ── */
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    setProductsLoading(true);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setProductsLoading(false);
      })
      .catch(err => {
        setProductsError('Failed to load products from database.');
        setProductsLoading(false);
      });
  }, []);

  /* ── Modal state ── */
  const [manualAddOpen, setManualAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  /* ── Product directory search ── */
  const [productSearch, setProductSearch] = useState('');
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productSearch]);

  /* ── CBM form ── */
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [activeProductId, setActiveProductId] = useState(null);
  const [flashId, setFlashId] = useState(null);

  /* ── Shipment items — persisted in localStorage ── */
  const [shipment, setShipment] = useState(() => {
    try {
      const s = localStorage.getItem('cbm-shipment');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cbm-shipment', JSON.stringify(shipment));
    } catch {
      /* storage full */
    }
  }, [shipment]);

  /* ── Shipment metadata ── */
  const [poNumber, setPoNumber] = useState('');
  const [containerType, setContainerType] = useState('40hc');
  const [freightMode, setFreightMode] = useState('ocean'); // 'ocean' | 'air'

  /* ── Form updater ── */
  const updateForm = useCallback((field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
  }, []);


  /* ── Save/Edit/Delete product handlers ── */
  // Note: manually added products are session-only; they are not written back to the database.
  const handleSaveProduct = useCallback((savedProduct) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? savedProduct : p))
      );
      if (activeProductId === editingProduct.id) {
        setForm((prev) => ({
          unit: savedProduct.unit,
          length: savedProduct.length,
          width: savedProduct.width,
          height: savedProduct.height,
          packSize: savedProduct.packSize,
          netWeight: savedProduct.netWeightPerShipper || 0,
          grossWeight: savedProduct.grossWeightPerShipper,
          name: savedProduct.name,
          totalPcs: prev.totalPcs,
          presetCBM:
            !savedProduct.length && !savedProduct.width && !savedProduct.height
              ? savedProduct.cbmPerShipper || 0
              : 0,
          packingString: savedProduct.packingString || '',
        }));
      }
      setEditingProduct(null);
    } else {
      setProducts((prev) => {
        const { nextProducts } = mergeProducts(prev, [savedProduct]);
        return nextProducts;
      });
    }
  }, [editingProduct, activeProductId]);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setManualAddOpen(true);
  }, []);

  /* Closes the manual-add/edit modal AND always clears the editing target.
     Without this, dismissing via backdrop leaves editingProduct set, so
     the next "Add" click would re-open with the previous product pre-filled. */
  const handleCloseManualModal = useCallback(() => {
    setManualAddOpen(false);
    setEditingProduct(null);
  }, []);

  const handleDeleteProduct = useCallback((id) => {
    setConfirmConfig({
      message: 'Delete this product from directory?',
      onConfirm: () => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (activeProductId === id) {
          setActiveProductId(null);
          setForm({ ...EMPTY_FORM });
        }
      }
    });
  }, [activeProductId]);

  /* ── Product click → populate form ── */
  const handleProductClick = useCallback((product) => {
    if (activeProductId === product.id) {
      setActiveProductId(null);
      setForm({ ...EMPTY_FORM });
    } else {
      setActiveProductId(product.id);
      setForm((prev) => ({
        unit: product.unit,
        length: product.length,
        width: product.width,
        height: product.height,
        packSize: product.packSize,
        netWeight: product.netWeightPerUnit,
        grossWeight: product.grossWeightPerShipper,
        name: product.name,
        totalPcs: prev.totalPcs,
        presetCBM:
          !product.length && !product.width && !product.height
            ? product.cbmPerShipper || 0
            : 0,
        packingString: product.packingString || '',
      }));
    }
  }, [activeProductId]);

  /* ── Add item to shipment ── */
  /* ── Add item to shipment ── */
  const handleAddToShipment = useCallback((overrides = {}) => {
    const finalForm = { ...form, ...overrides };
    const hasDims =
      Number(finalForm.length) > 0 &&
      Number(finalForm.width) > 0 &&
      Number(finalForm.height) > 0;
    const hasPreset = Number(finalForm.presetCBM) > 0;
    if (!hasDims && !hasPreset) return;
    const cbmPerShipper = hasDims
      ? calcCBM(finalForm.length, finalForm.width, finalForm.height, finalForm.unit)
      : Number(finalForm.presetCBM) || 0;
    const derivedShippers =
      finalForm.totalPcs > 0 && finalForm.packSize > 0
        ? Math.ceil(finalForm.totalPcs / finalForm.packSize)
        : 1;
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: finalForm.name || 'Custom Item',
      unit: finalForm.unit,
      length: Number(finalForm.length) || 0,
      width: Number(finalForm.width) || 0,
      height: Number(finalForm.height) || 0,
      packSize: Number(finalForm.packSize) || 1,
      netWeightPerUnit: Number(finalForm.netWeight) || 0,
      netWeightPerShipper: Number(finalForm.netWeight) || 0,
      grossWeightPerShipper: Number(finalForm.grossWeight) || 0,
      cbmPerShipper,
      quantity: derivedShippers,
      totalPcs: Number(finalForm.totalPcs) || derivedShippers * (Number(finalForm.packSize) || 1),
      packingString: finalForm.packingString || '',
    };
    setShipment((p) => [...p, newItem]);
    setFlashId(newItem.id);
    setTimeout(() => setFlashId(null), 800);
    setForm({ ...EMPTY_FORM });
    setActiveProductId(null);
  }, [form]);

  /* ── Drag & Drop directly to shipment ── */
  const handleAddProductToShipment = useCallback((product) => {
    const hasDims =
      Number(product.length) > 0 &&
      Number(product.width) > 0 &&
      Number(product.height) > 0;
    const cbmPerShipper = product.cbmPerShipper
      ? product.cbmPerShipper
      : hasDims
        ? calcCBM(product.length, product.width, product.height, product.unit || 'cm')
        : 0;

    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: product.name || 'Imported Item',
      unit: product.unit || 'cm',
      length: Number(product.length) || 0,
      width: Number(product.width) || 0,
      height: Number(product.height) || 0,
      packSize: Number(product.packSize) || 1,
      netWeightPerUnit: Number(product.netWeightPerUnit) || Number(product.netWeightPerShipper) || 0,
      netWeightPerShipper: Number(product.netWeightPerShipper) || 0,
      grossWeightPerShipper: Number(product.grossWeightPerShipper) || 0,
      cbmPerShipper,
      quantity: 1, // Default to 1 shipper when dragging/dropping directly
      totalPcs: Number(product.packSize) || 1,
      packingString: product.packingString || '',
    };

    setShipment((p) => [...p, newItem]);
    setFlashId(newItem.id);
    setTimeout(() => setFlashId(null), 800);
  }, []);

  /* ── Add item to product directory ── */
  const handleAddToDirectory = useCallback((overrides = {}) => {
    const finalForm = { ...form, ...overrides };
    const hasDims =
      Number(finalForm.length) > 0 &&
      Number(finalForm.width) > 0 &&
      Number(finalForm.height) > 0;
    const hasPreset = Number(finalForm.presetCBM) > 0;
    if (!hasDims && !hasPreset) return;
    const cbmPerShipper = hasDims
      ? calcCBM(finalForm.length, finalForm.width, finalForm.height, finalForm.unit)
      : Number(finalForm.presetCBM) || 0;

    const newProduct = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: finalForm.name || 'Custom Item',
      description: 'Manually added',
      icon: '📦',
      color: 'from-indigo-50 to-violet-50/60 dark:from-indigo-950/60 dark:to-violet-950/40',
      border: 'border-indigo-200 dark:border-indigo-700/60',
      unit: finalForm.unit,
      length: Number(finalForm.length) || 0,
      width: Number(finalForm.width) || 0,
      height: Number(finalForm.height) || 0,
      packSize: Number(finalForm.packSize) || 1,
      netWeightPerShipper: Number(finalForm.netWeight) || 0,
      grossWeightPerShipper: Number(finalForm.grossWeight) || 0,
      cbmPerShipper,
      packingString: finalForm.packingString || '',
    };

    setProducts((prev) => {
      const { nextProducts } = mergeProducts(prev, [newProduct]);
      return nextProducts;
    });

    // Optionally clear form or show success toast
    setForm({ ...EMPTY_FORM });
    setActiveProductId(null);
  }, [form]);

  /* ── Remove item ── */
  const handleRemove = useCallback(
    (id) => setShipment((p) => p.filter((i) => i.id !== id)),
    []
  );

  /* ── Change quantity ── */
  const handleQuantityChange = useCallback(
    (id, qty) =>
      setShipment((p) =>
        p.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, qty), totalPcs: Math.max(1, qty) * i.packSize } : i
        )
      ),
    []
  );

  /* ── Edit item — populate form and remove from shipment ── */
  const handleEditItem = useCallback((item) => {
    setForm({
      unit: item.unit,
      length: item.length,
      width: item.width,
      height: item.height,
      packSize: item.packSize,
      netWeight: item.netWeightPerUnit || item.netWeightPerShipper || 0,
      grossWeight: item.grossWeightPerShipper,
      name: item.name,
      totalPcs: item.totalPcs || item.packSize * item.quantity,
      presetCBM:
        !item.length && !item.width && !item.height
          ? item.cbmPerShipper || 0
          : 0,
      packingString: item.packingString || '',
    });
    setShipment((p) => p.filter((i) => i.id !== item.id));
    setActiveProductId(null);
  }, []);

  /* ── Duplicate item ── */
  const handleDuplicateItem = useCallback((item) => {
    const dup = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setShipment((p) => [...p, dup]);
    setFlashId(dup.id);
    setTimeout(() => setFlashId(null), 800);
  }, []);

  /* ── Clear shipment ── */
  const clearShipment = useCallback(() => {
    setConfirmConfig({
      message: 'Clear all shipment items?',
      onConfirm: () => setShipment([]),
    });
  }, []);

  /* ══════════════ Computed values ══════════════ */

  const totals = useMemo(
    () =>
      shipment.reduce(
        (acc, item) => {
          const pcs = item.totalPcs || (item.packSize * item.quantity);
          const exactShippers = pcs / item.packSize;
          const displayShippers = Math.ceil(pcs / item.packSize);

          return {
            cbm: acc.cbm + exactShippers * item.cbmPerShipper,
            grossWeight: acc.grossWeight + exactShippers * item.grossWeightPerShipper,
            netWeight: acc.netWeight + exactShippers * (item.netWeightPerShipper || item.netWeightPerUnit || 0),
            shippers: acc.shippers + displayShippers,
            totalPcs: acc.totalPcs + pcs,
          };
        },
        { cbm: 0, grossWeight: 0, netWeight: 0, shippers: 0, totalPcs: 0 }
      ),
    [shipment]
  );

  const volumetricWeight = useMemo(() => {
    if (freightMode === 'air') return totals.cbm * 167;
    return 0; // ocean has no volumetric weight; chargeable = gross weight only
  }, [totals.cbm, freightMode]);

  const chargeableWeight = useMemo(
    () => Math.max(totals.grossWeight, volumetricWeight),
    [totals.grossWeight, volumetricWeight]
  );

  const containerPct = useMemo(() => {
    const cap = CONTAINERS[containerType]?.cbm || 76;
    return Math.min(100, (totals.cbm / cap) * 100);
  }, [totals.cbm, containerType]);

  const previewCBM = useMemo(() => {
    const hasDims =
      Number(form.length) > 0 &&
      Number(form.width) > 0 &&
      Number(form.height) > 0;
    if (hasDims)
      return calcCBM(form.length, form.width, form.height, form.unit);
    if (Number(form.presetCBM) > 0) return Number(form.presetCBM);
    return 0;
  }, [form.length, form.width, form.height, form.unit, form.presetCBM]);

  const canAdd =
    (Number(form.length) > 0 &&
      Number(form.width) > 0 &&
      Number(form.height) > 0) ||
    Number(form.presetCBM) > 0;

  return {
    // Product directory
    products,
    productsLoading,
    productsError,
    filteredProducts,
    productSearch,
    setProductSearch,
    activeProductId,

    // Modal state
    manualAddOpen,
    setManualAddOpen,
    editingProduct,
    confirmConfig,
    setConfirmConfig,

    // Form
    form,
    updateForm,
    previewCBM,
    canAdd,

    // Shipment
    shipment,
    flashId,
    poNumber,
    setPoNumber,
    containerType,
    setContainerType,
    freightMode,
    setFreightMode,

    // Computed
    totals,
    volumetricWeight,
    chargeableWeight,
    containerPct,

    // Handlers
    handleAddProductToShipment,
    handleSaveProduct,
    handleEditProduct,
    handleCloseManualModal,
    handleDeleteProduct,
    handleProductClick,
    handleAddToShipment,
    handleAddToDirectory,
    handleRemove,
    handleQuantityChange,
    handleEditItem,
    handleDuplicateItem,
    clearShipment,
  };
}
