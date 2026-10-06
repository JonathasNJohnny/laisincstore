import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Share2,
  Truck,
  Shield,
  Star,
  Play,
} from "lucide-react";
import { Badge } from "../../components/Badge/Badge";
import { Button } from "../../components/Button/Button";
import { QuantitySelector } from "../../components/QuantitySelector/QuantitySelector";
import { ProductGrid } from "../../components/ProductGrid/ProductGrid";
import { SectionTitle } from "../../components/SectionTitle/SectionTitle";
import { formatCurrency } from "../../data/products";
import { useCart } from "../../contexts/CartContext";
import { getImageUrl, getProductBySlug } from "../../services/api";
import { normalizeApiProduct } from "../../components/ProductList/ProductList";
import { slugify } from "../../utils/slugify";
import type { Product } from "../../types";
import { ProductReviews } from "../../components/ProductReviews/ProductReviews";
import { useFavorites } from "../../contexts/FavoritesContext";

function isVideoMedia(url: string) {
  return /\.(mp4|webm|mov|m4v|ogv)(?:$|[?#])/i.test(url);
}

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, isInCart, getItemQuantity } = useCart();
  const { favoriteIds, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [originalDescription, setOriginalDescription] = useState("");
  const [variantOptions, setVariantOptions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVariantLoading, setIsVariantLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({
    reviewCount: 0,
    averageRating: 0,
  });

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      if (!slug) {
        if (active) {
          setProduct(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setSelectedImage(0);

      try {
        const response = await getProductBySlug(slug);
        if (active) {
          const normalizedProduct = normalizeApiProduct(response.product);
          const responseVariants =
            response.variants?.map(normalizeApiProduct) ?? [];
          const variants = normalizedProduct.variants?.length
            ? normalizedProduct.variants
            : responseVariants;

          setOriginalDescription(normalizedProduct.description);
          setProduct({
            ...normalizedProduct,
            variants,
          });
          setVariantOptions([
            normalizedProduct,
            ...variants.filter(
              (variant) => variant.id !== normalizedProduct.id,
            ),
          ]);
          setQuantity(1);
          setIsZoomed(false);
        }
      } catch {
        if (active) setProduct(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container py-16 text-center">Carregando produto...</div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 lg:py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-roxo-profundo mb-4">
          Produto não encontrado
        </h1>
        <p className="text-cinza-amarronzado mb-8">
          O produto que você procura não existe ou foi removido.
        </p>
        <Button asChild variant="primary">
          <Link to="/loja">Voltar para a loja</Link>
        </Button>
      </div>
    );
  }

  const productCategorySlug = slugify(product.category);
  const relatedProducts: Product[] = [];
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];
  const selectedMediaUrl = getImageUrl(images[selectedImage]);
  const selectedMediaIsVideo = isVideoMedia(selectedMediaUrl);
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.oldPrice! - product.price) / product.oldPrice!) * 100,
      )
    : 0;
  const inCart = isInCart(product.id);
  const isFavorite = favoriteIds.has(product.id);
  const cartQuantity = getItemQuantity(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addItem(product, quantity);
      setQuantity(1);
    }
  };

  const handleImageChange = (direction: number) => {
    setSelectedImage(
      (prev) => (prev + direction + images.length) % images.length,
    );
  };

  const handleVariantChange = async (variant: Product) => {
    if (variant.id === product.id || isVariantLoading) return;

    setIsVariantLoading(true);
    try {
      const response = await getProductBySlug(variant.slug);
      const normalizedVariant = normalizeApiProduct(response.product);

      setProduct({
        ...normalizedVariant,
        description: originalDescription,
        variants: variantOptions.filter(
          (option) => option.id !== normalizedVariant.id,
        ),
      });
      setQuantity(1);
      setSelectedImage(0);
      setIsZoomed(false);
    } finally {
      setIsVariantLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="container py-4" aria-label="Breadcrumb">
        <ol
          className="flex items-center gap-2 text-sm text-cinza-amarronzado"
          role="list"
        >
          <li>
            <Link to="/" className="hover:text-rosa-lais transition-colors">
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/loja" className="hover:text-rosa-lais transition-colors">
              Loja
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            {product.category && (
              <>
                <Link
                  to={`/categoria/${productCategorySlug}`}
                  className="hover:text-rosa-lais transition-colors"
                >
                  {product.category}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            )}
          </li>
          <li
            aria-current="page"
            className="text-grafite-arroxeado font-medium truncate max-w-xs"
          >
            {product.name}
          </li>
        </ol>
      </nav>

      <section className="container py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
          <div className="space-y-4">
            <div
              className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl bg-cinza-quente/50"
              onClick={() => setIsZoomed(true)}
            >
              {selectedMediaIsVideo ? (
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="absolute inset-0 z-0 h-full w-full cursor-pointer bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais focus-visible:ring-offset-2"
                  aria-label={`Abrir vídeo de ${product.name}`}
                >
                  <video
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                    aria-hidden="true"
                  >
                    <source src={selectedMediaUrl} />
                  </video>
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-branco transition-colors hover:bg-black/35">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-branco/90 text-roxo-profundo shadow-lg">
                      <Play
                        className="ml-1 h-8 w-8 fill-current"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="absolute inset-0 z-0 h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais focus-visible:ring-offset-2"
                  aria-label="Ampliar imagem"
                >
                  <img
                    src={selectedMediaUrl}
                    alt={product.name}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </button>
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleImageChange(-1);
                    }}
                    className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-branco/85 p-2 text-roxo-profundo shadow-md transition hover:bg-branco focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleImageChange(1);
                    }}
                    className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-branco/85 p-2 text-roxo-profundo shadow-md transition hover:bg-branco focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="h-6 w-6" aria-hidden="true" />
                  </button>
                </>
              )}
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge type={product.badge} />
                </div>
              )}
              {hasDiscount && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-dourado-suave text-roxo-profundo text-sm font-bold px-3 py-1 rounded-full">
                    -{discountPercentage}%
                  </span>
                </div>
              )}
              {isOutOfStock && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-roxo-profundo/70">
                  <span className="text-branco font-semibold text-lg px-6 py-3 bg-roxo-profundo rounded-xl">
                    Esgotado
                  </span>
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-2 overflow-x-auto pb-2"
              role="list"
              aria-label="Miniaturas do produto"
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(idx);
                    setIsZoomed(true);
                  }}
                  className={`relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 transition-all sm:h-28 sm:w-28 ${
                    idx === selectedImage
                      ? "border-rosa-lais shadow-lg"
                      : "border-transparent hover:border-cinza-quente"
                  }`}
                  aria-label={`${isVideoMedia(getImageUrl(img)) ? "Abrir vídeo" : "Ampliar imagem"} ${idx + 1}`}
                  aria-current={idx === selectedImage ? "true" : "false"}
                  role="listitem"
                >
                  {isVideoMedia(getImageUrl(img)) ? (
                    <>
                      <video
                        src={getImageUrl(img)}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                        aria-hidden="true"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-roxo-profundo/25 text-branco">
                        <Play
                          className="h-8 w-8 fill-current drop-shadow-md"
                          aria-hidden="true"
                        />
                      </span>
                    </>
                  ) : (
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>

            {variantOptions.length > 1 && (
              <div aria-label="Variantes do produto">
                <p className="text-sm font-medium text-grafite-arroxeado mb-3">
                  Escolha uma opção
                </p>
                <div className="flex flex-wrap gap-2">
                  {variantOptions.map((variant) => {
                    const isSelected = variant.id === product.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => void handleVariantChange(variant)}
                        disabled={isVariantLoading}
                        aria-current={isSelected ? "page" : undefined}
                        className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? "border-rosa-lais bg-rosa-lais text-branco"
                            : "border-cinza-quente bg-branco text-grafite-arroxeado hover:border-rosa-lais hover:text-rosa-lais"
                        }`}
                      >
                        {variant.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="ml-auto"
                aria-label="Compartilhar produto"
              >
                <Share2 className="w-5 h-5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => void toggleFavorite(product.id, product)}
                aria-label={
                  isFavorite
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
                }
                aria-pressed={isFavorite}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-[#e74367] text-[#e74367]" : ""}`}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-rosa-lais mb-1">
                {product.category}
              </p>
              <h1 className="font-serif text-3xl lg:text-4xl font-bold text-roxo-profundo mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`w-5 h-5 ${index < Math.round(reviewSummary.averageRating) ? "fill-dourado-suave text-dourado-suave" : "text-cinza-quente"}`}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="text-sm text-cinza-amarronzado ml-2">
                    {reviewSummary.reviewCount === 0
                      ? "Sem avaliações"
                      : `(${reviewSummary.reviewCount} ${reviewSummary.reviewCount === 1 ? "avaliação" : "avaliações"})`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-rosa-lais">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-cinza-amarronzado line-through">
                  {formatCurrency(product.oldPrice!)}
                </span>
              )}
              {hasDiscount && (
                <span className="bg-rosa-lais/10 text-rosa-lais px-3 py-1 rounded-full text-sm font-medium">
                  Economize {formatCurrency(product.oldPrice! - product.price)}
                </span>
              )}
            </div>

            <p className="text-cinza-amarronzado leading-relaxed">
              {product.description}
            </p>

            <div className="border-t border-cinza-quente pt-6 space-y-6">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-grafite-arroxeado mb-3"
                >
                  Quantidade
                </label>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={product.stock}
                  id="quantity"
                  aria-label={`Quantidade de ${product.name}`}
                />
                <p className="text-xs text-cinza-amarronzado mt-2">
                  {product.stock > 10
                    ? "Disponível para envio imediato"
                    : product.stock > 0
                      ? `Apenas ${product.stock} em estoque`
                      : "Esgotado"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1"
                >
                  {inCart ? (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Adicionado ({cartQuantity})
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      Adicionar ao carrinho
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  asChild
                >
                  <Link to="/checkout" onClick={handleAddToCart}>
                    Comprar agora
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 p-6 bg-branco rounded-xl border border-cinza-quente">
                  <Truck
                    className="w-5 h-5 text-rosa-lais"
                    aria-hidden="true"
                  />
                  <span className="text-grafite-arroxeado">
                    Envio para todo o Brasil
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-branco rounded-xl border border-cinza-quente">
                  <Shield
                    className="w-5 h-5 text-rosa-lais"
                    aria-hidden="true"
                  />
                  <span className="text-grafite-arroxeado">
                    Pagamento seguro
                  </span>
                </div>
                {/* <div className="flex items-center gap-2 p-3 bg-branco rounded-xl border border-cinza-quete">
                  <RotateCcw
                    className="w-5 h-5 text-rosa-lais"
                    aria-hidden="true"
                  />
                  <span className="text-grafite-arroxeado">
                    Troca fácil em 7 dias
                  </span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductReviews
        productId={product.id}
        onSummaryChange={setReviewSummary}
      />

      {relatedProducts.length > 0 && (
        <section
          className="container py-12 lg:py-16"
          aria-labelledby="related-title"
        >
          <SectionTitle
            title="Produtos Relacionados"
            subtitle="Você também pode gostar"
            action={{
              label: "Ver todos",
              href: `/categoria/${product.category.toLowerCase()}`,
            }}
          />
          <ProductGrid
            products={relatedProducts}
            variant="default"
            loading={false}
            onAddToCart={addItem}
          />
        </section>
      )}

      <div
        id="zoom-modal"
        className={
          isZoomed
            ? "fixed inset-0 z-50 flex items-center justify-center bg-roxo-profundo/95 backdrop-blur-sm animate-fade-in"
            : "hidden"
        }
        role="dialog"
        aria-modal="true"
        aria-label="Visualização ampliada"
      >
        <button
          onClick={() => setIsZoomed(false)}
          className="absolute top-6 right-6 p-2 rounded-full bg-branco/10 text-branco hover:bg-branco/20 transition-colors"
          aria-label="Fechar zoom"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
        <button
          onClick={() => handleImageChange(-1)}
          className="absolute left-6 p-3 rounded-full bg-branco/10 text-branco hover:bg-branco/20 transition-colors"
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="w-8 h-8" aria-hidden="true" />
        </button>
        {selectedMediaIsVideo ? (
          <video
            key={selectedMediaUrl}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="max-h-[85vh] w-[min(92vw,1100px)] object-contain"
          >
            <source src={selectedMediaUrl} />
            Seu navegador não suporta a reprodução de vídeos.
          </video>
        ) : (
          <img
            src={selectedMediaUrl}
            alt={product.name}
            crossOrigin="anonymous"
            className="max-h-[85vh] max-w-[92vw] object-contain"
          />
        )}
        <button
          onClick={() => handleImageChange(1)}
          className="absolute right-6 p-3 rounded-full bg-branco/10 text-branco hover:bg-branco/20 transition-colors"
          aria-label="Próxima imagem"
        >
          <ChevronRight className="w-8 h-8" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
