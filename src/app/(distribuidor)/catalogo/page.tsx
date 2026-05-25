'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Check, AlertCircle, ArrowRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { useCartStore } from '@/stores/cart-store'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ProductDetailModal } from '@/components/catalog/ProductDetailModal'
import { formatARS, cn, normalizeText } from '@/lib/utils'
import type { Product } from '@/types'

const ALL_CAT = 'all'

type StockFilter = 'todos' | 'disponible' | 'pocas' | 'sin_stock'

export default function CatalogoPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CAT)
  const [cartOpen, setCartOpen] = useState(false)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)

  // Filtros avanzados
  const [search, setSearch] = useState('')
  const [filterColor, setFilterColor] = useState('')
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterNovedad, setFilterNovedad] = useState(false)
  const [filterStock, setFilterStock] = useState<StockFilter>('todos')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { user } = useAuthStore()
  const { products, categories, clients, getProductPrice, getClientPriceList,
          getStockState, getStockAvailable, getProductSubstitutes } = useDataStore()
  const { items, addItem, getTotalUnidades } = useCartStore()

  const client = clients.find((c) => c.id === user?.clientId)
  const priceList = client ? getClientPriceList(client.id) : null
  const priceListId = priceList?.id ?? 'pl1'

  // Productos activos sin preventa
  const activeProducts = products.filter((p) => p.estado === 'activo' && !p.preventa)

  // Opciones únicas para filtros
  const colorOptions = useMemo(() =>
    [...new Set(activeProducts.map((p) => p.color).filter((c): c is string => !!c))].sort(),
    [activeProducts]
  )
  const materialOptions = useMemo(() =>
    [...new Set(activeProducts.map((p) => p.material).filter((m): m is string => !!m))].sort(),
    [activeProducts]
  )

  // Filtrado completo
  const visibleProducts = useMemo(() => {
    return activeProducts.filter((p) => {
      // Categoría
      if (selectedCategory !== ALL_CAT && p.categoryId !== selectedCategory) return false
      // Búsqueda por nombre/SKU (insensible a tildes y mayúsculas)
      const q = normalizeText(search.trim())
      if (q) {
        const matchName = normalizeText(p.name).includes(q)
        const matchSku  = normalizeText(p.sku).includes(q)
        if (!matchName && !matchSku) return false
      }
      // Color
      if (filterColor && p.color !== filterColor) return false
      // Material
      if (filterMaterial && p.material !== filterMaterial) return false
      // Solo novedades
      if (filterNovedad && !p.novedad) return false
      // Stock
      if (filterStock !== 'todos') {
        const state = getStockState(p.id)
        if (filterStock === 'disponible' && state === 'sin_stock') return false
        if (filterStock === 'pocas'      && state !== 'pocas_unidades') return false
        if (filterStock === 'sin_stock'  && state !== 'sin_stock') return false
      }
      // Precio
      const price = getProductPrice(p.id, priceListId)
      if (priceMin !== '' && price < Number(priceMin)) return false
      if (priceMax !== '' && price > Number(priceMax)) return false
      return true
    })
  }, [activeProducts, selectedCategory, search, filterColor, filterMaterial,
      filterNovedad, filterStock, priceMin, priceMax, getStockState, getProductPrice, priceListId])

  const cartCount = getTotalUnidades()

  const categoryTabs = [
    { id: ALL_CAT, label: 'Todos' },
    ...categories.sort((a, b) => a.order - b.order).map((c) => ({ id: c.id, label: c.name })),
  ]

  // Cantidad de filtros activos (sin contar categoría)
  const activeFilterCount = [
    search.trim(),
    filterColor,
    filterMaterial,
    filterNovedad,
    filterStock !== 'todos',
    priceMin !== '',
    priceMax !== '',
  ].filter(Boolean).length

  function clearFilters() {
    setSearch('')
    setFilterColor('')
    setFilterMaterial('')
    setFilterNovedad(false)
    setFilterStock('todos')
    setPriceMin('')
    setPriceMax('')
  }

  function isInCart(productId: string) {
    return items.some((i) => i.productId === productId)
  }

  function getCartItem(productId: string) {
    return items.find((i) => i.productId === productId)
  }

  const profileBlocked = client && !client.profileCompleto

  return (
    <div className="min-h-full bg-[#000]">
      {/* Banner profile incompleto */}
      {profileBlocked && (
        <div className="bg-yellow-950/30 border-b border-yellow-900/50 px-6 lg:px-8 py-3 flex items-center gap-3">
          <AlertCircle size={14} className="text-yellow-500 flex-shrink-0" />
          <p className="text-xs text-yellow-200 flex-1">
            <span className="font-medium">Datos de facturación incompletos.</span>{' '}
            Podés navegar el catálogo pero no podrás enviar pedidos hasta completarlos.
          </p>
          <Link href="/completar-datos" className="flex items-center gap-1 text-yellow-200 hover:text-yellow-50 text-[10px] tracking-[0.15em] uppercase border border-yellow-700 px-3 py-1 hover:bg-yellow-900/30 transition-colors">
            Completar
            <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {/* Page header */}
      <div className="sticky top-0 z-30 border-b border-[#2A2A2A] bg-[#000]/95 backdrop-blur-sm px-4 lg:px-8 py-4">
        {/* Top row: title + search + cart */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex-shrink-0">
            <h1 className="font-display text-2xl lg:text-3xl font-light tracking-[0.2em] uppercase text-white leading-none">
              Catálogo
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
              {client?.nombre ?? 'Distribuidor'}{priceList ? ` — Lista ${priceList.name}` : ''}
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs pl-8 pr-3 py-2 focus:outline-none focus:border-[#555] placeholder:text-[#444]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white">
                <X size={11} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Filters toggle */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 border text-[10px] tracking-[0.15em] uppercase px-3 py-2 transition-colors',
                filtersOpen || activeFilterCount > 0
                  ? 'border-white text-white'
                  : 'border-[#2A2A2A] text-[#A0A0A0] hover:border-[#555] hover:text-white'
              )}
            >
              <SlidersHorizontal size={12} strokeWidth={1.5} />
              Filtros
              {activeFilterCount > 0 && (
                <span className="bg-white text-black text-[9px] px-1 rounded-sm font-medium">{activeFilterCount}</span>
              )}
            </button>
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 text-[#A0A0A0] hover:border-white hover:text-white transition-colors"
            >
              <ShoppingCart size={16} strokeWidth={1.5} />
              {cartCount > 0 && (<span className="text-xs text-white font-medium">{cartCount}</span>)}
              {cartCount > 0 && (<span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-white" />)}
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-0 overflow-x-auto">
          {categoryTabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={cn(
                'flex-shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors',
                selectedCategory === id
                  ? 'border-white bg-white text-black'
                  : 'border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#555]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 items-end">
                {/* Color */}
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">Color</label>
                  <select
                    value={filterColor}
                    onChange={(e) => setFilterColor(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5 focus:outline-none focus:border-[#555]"
                  >
                    <option value="">Todos</option>
                    {colorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Material */}
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">Material</label>
                  <select
                    value={filterMaterial}
                    onChange={(e) => setFilterMaterial(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5 focus:outline-none focus:border-[#555]"
                  >
                    <option value="">Todos</option>
                    {materialOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">Stock</label>
                  <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value as StockFilter)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5 focus:outline-none focus:border-[#555]"
                  >
                    <option value="todos">Todos</option>
                    <option value="disponible">Con stock</option>
                    <option value="pocas">Últimas unidades</option>
                    <option value="sin_stock">Sin stock</option>
                  </select>
                </div>

                {/* Precio desde */}
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">Precio desde ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5 focus:outline-none focus:border-[#555] placeholder:text-[#444]"
                  />
                </div>

                {/* Precio hasta */}
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">Precio hasta ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Sin límite"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5 focus:outline-none focus:border-[#555] placeholder:text-[#444]"
                  />
                </div>

                {/* Novedades + limpiar */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 cursor-pointer group mt-auto pb-0.5">
                    <div
                      onClick={() => setFilterNovedad((v) => !v)}
                      className={cn(
                        'w-4 h-4 border flex items-center justify-center transition-colors',
                        filterNovedad ? 'bg-white border-white' : 'border-[#444] group-hover:border-[#777]'
                      )}
                    >
                      {filterNovedad && <Check size={10} strokeWidth={3} className="text-black" />}
                    </div>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-[#A0A0A0] group-hover:text-white transition-colors">
                      Solo novedades
                    </span>
                  </label>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-[9px] tracking-[0.15em] uppercase text-[#555] hover:text-white transition-colors text-left flex items-center gap-1"
                    >
                      <X size={10} /> Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 lg:px-8 py-8">
        {/* Resultado count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#555]">
            {visibleProducts.length} {visibleProducts.length === 1 ? 'producto' : 'productos'}
            {activeFilterCount > 0 && <span className="text-[#777]"> · filtros activos</span>}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-[9px] tracking-[0.15em] uppercase text-[#555] hover:text-white transition-colors flex items-center gap-1">
              <X size={10} /> Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-3 gap-px bg-[#2A2A2A]">
          {visibleProducts.map((product, index) => {
            const price = getProductPrice(product.id, priceListId)
            const inCart = isInCart(product.id)
            const cartItem = getCartItem(product.id)
            const stockState = getStockState(product.id)
            const available = getStockAvailable(product.id)
            const isOutOfStock = stockState === 'sin_stock'
            const substitutes = isOutOfStock ? getProductSubstitutes(product.id) : []

            return (
              <motion.div
                key={product.id}
                className={cn('bg-[#000] flex flex-col', isOutOfStock && 'opacity-70')}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: isOutOfStock ? 0.7 : 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04, ease: 'easeOut' }}
              >
                {/* Image — clickeable abre detalle */}
                <button
                  type="button"
                  onClick={() => setDetailProduct(product)}
                  className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer block group"
                  aria-label={`Ver detalle de ${product.name}`}
                >
                  {product.badge && (
                    <span className="absolute top-3 left-3 z-10 bg-black text-white text-[8px] tracking-[0.2em] uppercase px-2 py-1">
                      {product.badge}
                    </span>
                  )}
                  {/* Stock badge */}
                  {stockState === 'sin_stock' && (
                    <span className="absolute top-3 right-3 z-10 bg-red-900 text-red-100 text-[8px] tracking-[0.2em] uppercase px-2 py-1">
                      Sin stock
                    </span>
                  )}
                  {stockState === 'pocas_unidades' && (
                    <span className="absolute top-3 right-3 z-10 bg-yellow-900 text-yellow-100 text-[8px] tracking-[0.2em] uppercase px-2 py-1">
                      Últimas {available}
                    </span>
                  )}
                  {/* Hover hint para abrir detalle */}
                  <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-[10px] tracking-[0.25em] uppercase border border-white/60 px-3 py-1.5 bg-black/40 backdrop-blur-sm">
                      Ver detalle
                    </span>
                  </div>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1280px) 50vw, 33vw"
                    className={cn(
                      'object-cover transition-transform duration-500 group-hover:scale-105',
                      isOutOfStock && 'grayscale'
                    )}
                  />
                </button>

                {/* Body */}
                <div className="flex flex-col flex-1 p-4 border-t border-[#2A2A2A]">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">
                    {categories.find((c) => c.id === product.categoryId)?.name ?? product.categoryId}
                  </p>
                  <h3 className="text-sm text-white font-light mb-1 leading-snug">{product.name}</h3>
                  <p className="text-[10px] text-[#555] leading-relaxed mb-3 line-clamp-2 flex-1">
                    {product.description}
                  </p>

                  {/* Sin stock + tiene sustitutos → CTA al modal */}
                  {isOutOfStock && substitutes.length > 0 && (
                    <button
                      onClick={() => setDetailProduct(product)}
                      className="border border-yellow-900 bg-yellow-950/20 hover:bg-yellow-950/40 p-2 mb-3 flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <p className="text-[10px] tracking-[0.15em] uppercase text-yellow-400">
                        Ver {substitutes.length} alternativa{substitutes.length !== 1 ? 's' : ''}
                      </p>
                      <span className="text-yellow-400 text-xs">→</span>
                    </button>
                  )}

                  {/* Precio + Add */}
                  <div className="flex items-end justify-between gap-2 mt-auto">
                    <div>
                      <p className="text-[8px] tracking-[0.25em] uppercase text-[#555] mb-0.5">Mayorista</p>
                      <p className="text-base text-white font-light">
                        {price > 0 ? formatARS(price) : '—'}
                      </p>
                      <p className="text-[9px] text-[#777] mt-0.5">PVR: {formatARS(product.pvr)}</p>
                    </div>

                    {isOutOfStock ? (
                      <span className="border border-[#2A2A2A] px-2 py-1 text-[9px] tracking-[0.15em] uppercase text-[#555]">
                        Sin stock
                      </span>
                    ) : inCart ? (
                      <div className="flex items-center gap-0">
                        <span className="flex items-center gap-1 border border-[#2A2A2A] px-2 py-1 text-[9px] tracking-[0.15em] uppercase text-emerald-400">
                          <Check size={10} />
                          {cartItem?.cantidad ?? 1}
                        </span>
                        <button
                          onClick={() => addItem(product.id, price)}
                          className="border border-l-0 border-[#2A2A2A] px-2 py-1 text-[9px] text-[#A0A0A0] hover:text-white hover:border-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addItem(product.id, price)}
                        disabled={price === 0}
                        className="border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {visibleProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-[#555] text-xs tracking-[0.2em] uppercase">
              {activeFilterCount > 0 || search
                ? 'Sin resultados para los filtros aplicados'
                : 'Sin productos en esta categoría'}
            </p>
            {(activeFilterCount > 0 || search) && (
              <button
                onClick={clearFilters}
                className="text-[10px] tracking-[0.15em] uppercase border border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#555] px-4 py-2 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} products={products} />

      {/* Modal detalle de producto — onProductSwap permite navegar entre sustitutos sin cerrar */}
      <ProductDetailModal
        product={detailProduct}
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        priceListId={priceListId}
        onProductSwap={(p) => setDetailProduct(p)}
      />
    </div>
  )
}
