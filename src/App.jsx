/**
 * App.jsx — Root component.
 *
 * Wires custom hooks (useTheme, useShipment) to UI components.
 * This file is intentionally lean — all logic lives in hooks, all UI in components.
 */
import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useShipment } from './hooks/useShipment';
import Header from './components/layout/Header';
import CustomCBMForm from './components/calculator/CustomCBMForm';
import ActiveShipment from './components/shipment/ActiveShipment';
import ProductDirectory from './components/directory/ProductDirectory';
import ManualAddModal from './components/modals/ManualAddModal';
import ProductSummaryModal from './components/modals/ProductSummaryModal';
import ConfirmModal from './components/modals/ConfirmModal';
import { motion } from 'framer-motion';
import { pageContainer, columnCard } from './animations';

function App() {
  const [summaryData, setSummaryData] = useState(null);
  const { mode, isDark, setTheme } = useTheme();
  const {
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
    handleCloseManualModal,
    handleProductClick,
    handleAddToShipment,
    handleAddToDirectory,
    handleRemove,
    handleQuantityChange,
    handleEditItem,
    handleDuplicateItem,
    clearShipment,
  } = useShipment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
      {/* ── Ambient orbs ── */}
      <div aria-hidden="true">
        <div className="orb w-96 h-96 -top-40 -left-32 bg-indigo-300/20 dark:bg-indigo-700/10" />
        <div className="orb w-80 h-80 top-1/3 -right-20 bg-purple-300/15 dark:bg-purple-700/10" />
        <div className="orb w-64 h-64 bottom-0 left-1/3 bg-cyan-300/10 dark:bg-cyan-700/8" />
      </div>


      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── HEADER ── */}
        <Header mode={mode} setTheme={setTheme} />

        {/* ── MAIN GRID ── */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6"
          variants={pageContainer}
          initial="hidden"
          animate="show"
        >
          {/* Left: Custom CBM Form */}
          <motion.div variants={columnCard} className="lg:col-span-3">
            <CustomCBMForm
              form={form}
              updateForm={updateForm}
              previewCBM={previewCBM}
              canAdd={canAdd}
              handleAddToShipment={handleAddToShipment}
              handleAddToDirectory={handleAddToDirectory}
              products={products}
              handleProductClick={handleProductClick}
              activeProductId={activeProductId}
            />
          </motion.div>

          {/* Middle: Active Shipment */}
          <motion.div variants={columnCard} className="lg:col-span-6">
            <ActiveShipment
              shipment={shipment}
              flashId={flashId}
              poNumber={poNumber}
              setPoNumber={setPoNumber}
              containerType={containerType}
              setContainerType={setContainerType}
              freightMode={freightMode}
              setFreightMode={setFreightMode}
              totals={totals}
              volumetricWeight={volumetricWeight}
              chargeableWeight={chargeableWeight}
              containerPct={containerPct}
              handleRemove={handleRemove}
              handleQuantityChange={handleQuantityChange}
              handleEditItem={handleEditItem}
              handleDuplicateItem={handleDuplicateItem}
              clearShipment={clearShipment}
              handleAddProductToShipment={handleAddProductToShipment}
            />
          </motion.div>

          {/* Right: Product Directory */}
          <motion.div variants={columnCard} className="lg:col-span-3">
            <ProductDirectory
              products={products}
              filteredProducts={filteredProducts}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              activeProductId={activeProductId}
              handleProductClick={handleProductClick}
              productsLoading={productsLoading}
              productsError={productsError}
              setManualAddOpen={setManualAddOpen}
              setSummaryData={setSummaryData}
            />
          </motion.div>
        </motion.div>

        <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600 pb-6">
          CBM Calculator Dashboard &nbsp;·&nbsp; Volume in m³ &nbsp;·&nbsp;
          Weight in kg
        </footer>
      </div>

      {/* ── Modals ── */}
      <ManualAddModal
        isOpen={manualAddOpen}
        onClose={handleCloseManualModal}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />
      <ProductSummaryModal
        isOpen={!!summaryData}
        onClose={() => setSummaryData(null)}
        data={summaryData}
      />
      <ConfirmModal
        isOpen={!!confirmConfig}
        message={confirmConfig?.message}
        onConfirm={confirmConfig?.onConfirm}
        onClose={() => setConfirmConfig(null)}
      />
    </div>
  );
}

export default App;
