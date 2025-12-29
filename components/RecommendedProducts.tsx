// "use client";

// import { useState, useEffect, useMemo } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Routes } from "@/lib/routes";
// import { Product, ProductImageSet } from "@/types/product";
// import { products } from "@/mocks/products-mock";
// import ColorSelector from "./colorSelector";

// export default function RecommendedProducts() {
//   const recommended = useMemo(() => products.slice(0, 12), []);
//   const visibleCount = 3;

//   // Clone thêm nhóm đầu/cuối
//   const extended = [
//     ...recommended.slice(-visibleCount),
//     ...recommended,
//     ...recommended.slice(0, visibleCount),
//   ];

//   const [index, setIndex] = useState(visibleCount);
//   const [transition, setTransition] = useState(true);

//   const handlePrev = () => {
//     setIndex((prev) => prev - visibleCount);
//     setTransition(true);
//   };

//   const handleNext = () => {
//     setIndex((prev) => prev + visibleCount);
//     setTransition(true);
//   };

//   // Reset index khi vượt buffer
//   useEffect(() => {
//     if (index < visibleCount) {
//       setTimeout(() => {
//         setTransition(false);
//         setIndex(recommended.length);
//       }, 500);
//     } else if (index >= recommended.length + visibleCount) {
//       setTimeout(() => {
//         setTransition(false);
//         setIndex(visibleCount);
//       }, 500);
//     } else {
//       setTransition(true);
//     }
//   }, [index, recommended.length, visibleCount]);
  

//   return (
//     <div className="w-full p-6 overflow-x-hidden">
//       <h2 className="text-2xl font-bold">Recommended For You</h2>
//       <div className="mt-5 relative">
//         <Button
//           onClick={handlePrev}
//           className="absolute left-2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 w-9 bg-white text-gray-500 rounded-full drop-shadow-md hover:bg-gray-100 flex items-center justify-center"
//         >
//           <ChevronLeft className="!w-6 !h-6" />
//         </Button>

//         <div className="relative overflow-hidden">
//           <div
//             className={`flex ${transition ? "transition-transform duration-500 ease-in-out" : ""}`}
//             style={{
//               transform: `translateX(-${(index * 100) / visibleCount}%)`,
//             }}
//           >
//             {extended.map((p, i) => (
//               <div key={`${p.slug}-${i}`} className="min-w-1/3 px-2">
//                 <ProductMiniCard product={p} />
//               </div>
//             ))}
//           </div>
//         </div>

//         <Button
//           onClick={handleNext}
//           className="absolute right-2 translate-x-1/2 top-1/2 -translate-y-1/2 z-20 w-9 bg-white text-gray-500 rounded-full drop-shadow-md hover:bg-gray-100 flex items-center justify-center"
//         >
//           <ChevronRight className="!w-6 !h-6" />
//         </Button>
//       </div>
//     </div>
//   );
// }

// function ProductMiniCard({ product }: { product: Product }) {
//   const [hovered, setHovered] = useState(false);
//   const [selectedColor, setSelectedColor] = useState<ProductImageSet>(
//     product.images[0]
//   );

//   const currentImage =
//     selectedColor.images.find((img) => img.id === "front")?.url ||
//     selectedColor.images[0].url;

//   const href = Routes.product(product.slug);

//   const liked = isFavorite(product.slug);


//   return (
//     <div
//       className="relative bg-white rounded-xl overflow-hidden transition flex flex-col shadow hover:drop-shadow-md"
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       <div className="relative aspect-[9/8] w-full bg-gray-50 flex items-center justify-center rounded-xl pb-10">
//         <Link href={href} aria-label={product.name} className="w-full">
//           <Image
//             src={currentImage}
//             alt={`${product.name} - ${selectedColor.label}`}
//             width={0}
//             height={0}
//             sizes="100vw"
//             className="w-full h-auto object-contain max-h-full transition-opacity duration-300 cursor-pointer"
//           />
//         </Link>

//         {/* Sale badge + like button */}
//         <div className="absolute inset-x-3 top-3 z-20 flex items-center justify-between">
//           {product.sale ? (
//             <span className="bg-red-50 text-red-500 border border-red-200 text-sm px-2 py-1 rounded font-medium">
//               Sale
//             </span>
//           ) : (
//             <span />
//           )}
     
//         </div>

//         {/* Color selector */}
//         <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
//           {!hovered ? (
//             <span className="text-gray-400 text-sm">
//               {product.images.length} colors
//             </span>
//           ) : (
//             <ColorSelector
//               images={product.images}
//               selected={selectedColor}
//               onSelect={setSelectedColor}
//             />
//           )}
//         </div>
//       </div>

//       {/* INFO */}
//       <div className="p-3 flex flex-col">
//         <Link href={href} className="inline-block hover:no-underline">
//           <h3 className="text-base font-bold cursor-pointer line-clamp-1">
//             {product.name}
//           </h3>
//         </Link>

//         <div className="text-sm text-gray-600">
//           {product.oldPrice && (
//             <span className="line-through text-gray-400 mr-1">
//               ${product.oldPrice}
//             </span>
//           )}
//           <span className={product.sale ? "text-red-600 font-semibold" : ""}>
//             ${product.price}
//           </span>{" "}
//           <span className="text-gray-400">Including lenses</span>
//         </div>
//       </div>
//     </div>
//   );
// }
