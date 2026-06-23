/**
 * ManualAddModal — Modal overlay for manually adding a product to the directory.
 */
import { useState, useEffect } from 'react';
import FormInput from '../ui/FormInput';
import { CloseIcon, CheckCircleIcon } from '../icons/Icons';
import { IMPORT_COLORS, IMPORT_ICONS } from '../../utils/fileParser';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalPanel, btnHover, btnTap } from '../../animations';

const ManualAddModal = ({ isOpen, onClose, onSave, editingProduct }) => {
  const [f, setF] = useState({
    name: '',
    length: '',
    width: '',
    height: '',
    packSize: 1,
    netWeight: '',
    grossWeight: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setF({
        name: editingProduct.name || '',
        length: editingProduct.length || '',
        width: editingProduct.width || '',
        height: editingProduct.height || '',
        packSize: editingProduct.packSize || 1,
        netWeight: editingProduct.netWeightPerShipper
          ? Number(editingProduct.netWeightPerShipper).toFixed(2)
          : '',
        grossWeight: editingProduct.grossWeightPerShipper || '',
      });
    } else {
      setF({
        name: '',
        length: '',
        width: '',
        height: '',
        packSize: 1,
        netWeight: '',
        grossWeight: '',
      });
    }
  }, [editingProduct, isOpen]);

  const up = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const canSave = f.name.trim() && f.length > 0 && f.width > 0 && f.height > 0;

  const handleSave = () => {
    const pSize = Number(f.packSize) || 1;
    if (editingProduct) {
      onSave({
        ...editingProduct,
        name: f.name.trim(),
        unit: 'cm',
        length: Number(f.length) || 0,
        width: Number(f.width) || 0,
        height: Number(f.height) || 0,
        packSize: pSize,
        netWeightPerShipper: Number(f.netWeight) || 0,
        grossWeightPerShipper: Number(f.grossWeight) || 0,
      });
    } else {
      const style =
        IMPORT_COLORS[Math.floor(Math.random() * IMPORT_COLORS.length)];
      const icon =
        IMPORT_ICONS[Math.floor(Math.random() * IMPORT_ICONS.length)];
      onSave({
        id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: f.name.trim(),
        description: 'Manually added',
        icon,
        color: style.color,
        border: style.border,
        unit: 'cm',
        length: Number(f.length) || 0,
        width: Number(f.width) || 0,
        height: Number(f.height) || 0,
        packSize: pSize,
        netWeightPerShipper: Number(f.netWeight) || 0,
        grossWeightPerShipper: Number(f.grossWeight) || 0,
      });
    }
    setF({
      name: '',
      length: '',
      width: '',
      height: '',
      packSize: 1,
      netWeight: '',
      grossWeight: '',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="manual-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="manual-panel"
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {editingProduct ? '✏️ Edit Product' : '➕ Add Product Manually'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <FormInput
                id="manual-name"
                label="Product Name"
                type="text"
                value={f.name}
                onChange={(v) => up('name', v)}
              />
              <div className="grid grid-cols-3 gap-2">
                <FormInput
                  id="manual-l"
                  label="Length"
                  value={f.length}
                  onChange={(v) => up('length', v)}
                  suffix="cm"
                />
                <FormInput
                  id="manual-w"
                  label="Width"
                  value={f.width}
                  onChange={(v) => up('width', v)}
                  suffix="cm"
                />
                <FormInput
                  id="manual-h"
                  label="Height"
                  value={f.height}
                  onChange={(v) => up('height', v)}
                  suffix="cm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormInput
                  id="manual-pack"
                  label="Pack Size"
                  value={f.packSize}
                  onChange={(v) => up('packSize', v)}
                  suffix="pcs"
                />
                <FormInput
                  id="manual-nw"
                  label="Net Wt/Shipper"
                  value={f.netWeight}
                  onChange={(v) => up('netWeight', v)}
                  suffix="kg"
                />
                <FormInput
                  id="manual-gw"
                  label="Gross Wt"
                  value={f.grossWeight}
                  onChange={(v) => up('grossWeight', v)}
                  suffix="kg"
                />
              </div>
              <motion.button
                whileHover={canSave ? btnHover : {}}
                whileTap={canSave ? btnTap : {}}
                onClick={handleSave}
                disabled={!canSave}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2
                  ${
                    canSave
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-600'
                  }`}
              >
                <CheckCircleIcon /> {editingProduct ? 'Save Changes' : 'Save to Directory'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ManualAddModal;
