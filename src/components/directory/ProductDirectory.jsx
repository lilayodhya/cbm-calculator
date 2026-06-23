/**
 * ProductDirectory — Right panel with product list, search, and import/add buttons.
 */
import { useEffect } from 'react';
import { SearchIcon, ChevronIcon } from '../icons/Icons';
import { calcCBM } from '../../utils/calculations';
import { motion } from 'framer-motion';
import { listContainer, listItem } from '../../animations';

const ProductDirectory = ({
  products,
  filteredProducts,
  productSearch,
  setProductSearch,
  activeProductId,
  handleProductClick,
  productsLoading,
  productsError,
  setSummaryData,
}) => {
  const panelCls = 'glass rounded-2xl shadow-card dark:shadow-card-dark';

  useEffect(() => {
    if (activeProductId) {
      // Small delay allows for potential AnimatePresence or layout shifts to settle
      setTimeout(() => {
        const el = document.getElementById(`product-${activeProductId}`);
        const container = document.getElementById('product-directory-list');
        if (el && container) {
          // Scroll only the container, not the whole window
          container.scrollTo({
            top: el.offsetTop,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [activeProductId]);

  return (
    <section className="lg:col-span-3">
      <div className={`${panelCls} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 max-w-full">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-violet-600 dark:text-violet-400 no-theme-transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
              Product Directory
            </h2>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSummaryData(products)}
              title="Catalog Summary"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
            >
              📋 Summary
            </button>
          </div>
        </div>

        {/* Search/Filter */}
        {products.length > 0 && (
          <div className="relative mb-3 sticky top-0 z-10">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <SearchIcon />
            </span>
            <input
              id="product-search"
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-3 py-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600/70 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        )}

        {productsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-500 animate-spin mb-4"></div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Loading products from database…
            </p>
          </div>
        ) : productsError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-dashed border-red-300 dark:border-red-700 flex items-center justify-center mb-4 text-red-500 dark:text-red-400">
              <svg className="w-7 h-7 no-theme-transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              {productsError}
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
              <svg
                className="w-7 h-7 no-theme-transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              No products found in database.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Click any product to auto-fill the calculator.
            </p>
            <motion.div 
              id="product-directory-list"
              variants={listContainer}
              initial="hidden"
              animate="show"
              className="space-y-2 max-h-[450px] overflow-y-auto pr-1 relative"
            >
              {filteredProducts.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
                  No products matching &quot;{productSearch}&quot;
                </p>
              ) : (
                [...filteredProducts]
                  .sort((a, b) => {
                    if (!productSearch) return a.name.localeCompare(b.name);
                    const q = productSearch.toLowerCase().trim();
                    if (!q) return a.name.localeCompare(b.name);
                    
                    const aName = a.name.toLowerCase();
                    const bName = b.name.toLowerCase();
                    
                    const aStarts = aName.startsWith(q);
                    const bStarts = bName.startsWith(q);
                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;

                    const aWord = aName.includes(` ${q}`);
                    const bWord = bName.includes(` ${q}`);
                    if (aWord && !bWord) return -1;
                    if (!aWord && bWord) return 1;

                    return a.name.localeCompare(b.name);
                  })
                  .map((product) => {
                    const isActive = activeProductId === product.id;
                    return (
                      <motion.div
                        variants={listItem}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        key={product.id}
                        id={`product-${product.id}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify(product));
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => handleProductClick(product)}
                        className={`w-full max-w-full text-left rounded-xl p-3.5 group/card cursor-grab active:cursor-grabbing select-none
                          ${
                            isActive
                              ? `bg-gradient-to-r ${product.color} dark:from-indigo-950/60 dark:to-violet-950/40 border ${product.border} dark:border-indigo-700/60 shadow-glow`
                              : 'bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white/80 dark:hover:bg-slate-800/80'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl flex-shrink-0">
                              {product.icon}
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                {product.name}
                              </h3>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {Number(product.length).toFixed(2)}×{Number(product.width).toFixed(2)}×{Number(product.height).toFixed(2)}{' '}
                                {product.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-slate-400 dark:text-slate-500 flex-shrink-0 flex items-center gap-1">
                            <ChevronIcon />
                          </div>
                        </div>
                        {isActive && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                              {[
                                ['Pack', `${product.packSize} pcs`],
                                ['Net Wt/Ship', `${Number(product.netWeightPerShipper).toFixed(2)} kg`],
                                ['Gross', `${Number(product.grossWeightPerShipper).toFixed(2)} kg`],
                                ['Unit', product.unit.toUpperCase()],
                              ].map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-1">
                                  <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">
                                    {k}
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-300 font-mono truncate">
                                    {v}
                                  </span>
                                </div>
                              ))}
                              <div className="flex justify-between col-span-2 gap-1">
                                <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">
                                  CBM
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold truncate">
                                  {calcCBM(
                                    product.length,
                                    product.width,
                                    product.height,
                                    product.unit
                                  ).toFixed(2)}{' '}
                                  m³
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSummaryData(product);
                                }}
                                className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 active:scale-[0.97]"
                              >
                                ℹ️ Summary
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
              )}
            </motion.div>
          </>
        )}

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-[11px] text-slate-400 dark:text-slate-600 text-center">
            {products.length} product{products.length !== 1 ? 's' : ''} in
            directory
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductDirectory;
