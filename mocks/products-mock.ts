// import { Product } from "@/types/product";

// export const products: Product[] = [
//   {
//     id: "1",
//     slug: "ottoto-annex-1",
//     name: "Ottoto Annex 1",
//     price: 89,
//     oldPrice: 98,
//     sale: true,
//     brandSlug: "ottoto",
//     description:
//       "The Ottoto Annex is a stylish lightweight frame crafted from stainless steel. Sporting sleek arms and a simple design, the Annex is a sincerely reliable look.",
//     images: [
//       {
//         id: "black",
//         colors: ["#000000"],
//         label: "Black",
//         images: [
//           { url: "/products/Ottoto/Ottoto-Annex-Black-Front.png", id: "front" },
//           { url: "/products/Ottoto/Ottoto-Annex-Black-Side45.jpg", id: "sideAngle"},
//           { url: "/products/Ottoto/Ottoto-Annex-Black-Side90.png", id: "sideProfile"},
//           { url: "/products/Ottoto/Ottoto-case.png", id: "case" },
//           { url: "/products/Ottoto/Ottoto-onModel-1.png", id: "onModel1" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 8,
//             measurements: {
//               lensWidth: '55 mm',
//               lensHeight: '36 mm',
//               bridgeWidth: '18 mm',
//               templeLength: '150 mm',
//             },
//           },
//           {
//             size: "Wide",
//             inventory: 2,
//             measurements: {
//               lensWidth: '55 mm',
//               lensHeight: '36 mm',
//               bridgeWidth: '18 mm',
//               templeLength: '150 mm',
//             },
//           },
//         ],
//       },
//       {
//         id: "gunmetal",
//         colors: ["#2a3439"],
//         label: "Gunmetal",
//         images: [
//           { url: "/products/Ottoto-Annex-Gunmetal-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Gunmetal-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Gunmetal-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 1,
//             measurements: {
//               lensWidth: '55 mm',
//               lensHeight: '37 mm',
//               bridgeWidth: '18 mm',
//               templeLength: '150 mm',
//             },
//           },
//           {
//             size: "Wide",
//             inventory: 0,
//             measurements: {
//               lensWidth: '55 mm',
//               lensHeight: '37 mm',
//               bridgeWidth: '18 mm',
//               templeLength: '150 mm',
//             },
//           },
//         ],
//       },
//       {
//         id: "black-gunmetal",
//         colors: ["#A52A2A"],
//         label: "Brown",
//         images: [
//           { url: "/products/Ottoto-Annex-Black-Gunmetal-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Black-Gunmetal-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Black-Gunmetal-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 10,
//             measurements: {
//               lensWidth: '55 mm',
//               lensHeight: '37 mm',
//               bridgeWidth: '18 mm',
//               templeLength: '150 mm',
//             },
//           },
//           {
//             size: "Wide",
//             inventory: 6,
//             measurements: {
//               lensWidth: '55 mm',
//               lensHeight: '36 mm',
//               bridgeWidth: '18 mm',
//               templeLength: '150 mm',
//             },
//           },
//         ],
//       },
//     ],
//   },

//   {
//     slug: "ottoto-annex-2",
//     name: "Ottoto Annex 2",
//     price: 98,
//     brandSlug: "ottoto",
//     images: [
//       {
//         id: "black",
//         colors: ["#000000"],
//         label: "Black",
//         images: [
//           { url: "/products/Ottoto-Annex-Black-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Black-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Black-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 22,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//         ],
//       },
//       {
//         id: "gunmetal",
//         colors: ["#2a3439"],
//         label: "Gunmetal",
//         images: [
//           { url: "/products/Ottoto-Annex-Black-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Black-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Black-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Wide",
//             inventory: 25,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//         ],
//       },
//       {
//         id: "black-gunmetal",
//         colors: ["#000000", "#2a3439"],
//         label: "Black / Gunmetal",
//         images: [
//           { url: "/products/Ottoto-Annex-Black-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Black-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Black-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 2,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//         ],
//       },
//     ],
//   },
//   {
//     slug: "ottoto-annex-3",
//     name: "Ottoto Annex 3",
//     price: 72,
//     oldPrice: 80,
//     brandSlug: "ottoto",
//     sale: true,
//     images: [
//       {
//         id: "black",
//         colors: ["#000000"],
//         label: "Black",
//         images: [
//           { url: "/products/Ottoto-Annex-Black-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Black-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Black-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 8,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//           {
//             size: "Wide",
//             inventory: 2,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//         ],
//       },
//       {
//         id: "gunmetal",
//         colors: ["#2a3439"],
//         label: "Gunmetal",
//         images: [
//           { url: "/products/Ottoto-Annex-Black-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Black-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Black-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 8,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//           {
//             size: "Wide",
//             inventory: 2,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//         ],
//       },
//       {
//         id: "black-gunmetal",
//         colors: ["#000000", "#2a3439", "#A52A2A"],
//         label: "Black / Gunmetal / Brown",
//         images: [
//           { url: "/products/Ottoto-Annex-Black-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Black-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Black-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 8,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//           {
//             size: "Wide",
//             inventory: 2,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//         ],
//       },
//     ],
//   },

//   ...Array.from({ length: 200 }, (_, i) => ({
//     slug: `demo-glasses-${i + 4}`,
//     name: `Demo Glasses ${i + 4}`,
//     price: 79 + i,
//     brandSlug: "ottoto",
//     images: [
//       {
//         id: "black",
//         colors: ["#000000"],
//         label: "Black",
//         images: [
//           { url: "/products/Ottoto-Annex-Black-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Black-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Black-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 8,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//           {
//             size: "Wide",
//             inventory: 2,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//         ],
//       },
//       {
//         id: "gunmetal",
//         colors: ["#2a3439"],
//         label: "Gunmetal",
//         images: [
//           { url: "/products/Ottoto-Annex-Black-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Black-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Black-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 8,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//           {
//             size: "Wide",
//             inventory: 2,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//         ],
//       },
//       {
//         id: "black-gunmetal",
//         colors: ["#000000", "#2a3439"],
//         label: "Black / Gunmetal",
//         images: [
//           { url: "/products/Ottoto-Annex-Black-Front.png", id: "front" },
//           { url: "/products/Ottoto-Annex-Black-Side45.png", id: "sideAngle" },
//           { url: "/products/Ottoto-Annex-Black-Side90.png", id: "sideProfile" },
//         ],
//         sizes: [
//           {
//             size: "Average",
//             inventory: 8,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//           {
//             size: "Wide",
//             inventory: 2,
//             measurements: {
//               lensWidth: '55 mm / 2.17"',
//               lensHeight: '36 mm / 1.42"',
//               bridgeWidth: '18 mm / 0.71"',
//               templeLength: '150 mm / 5.91"',
//             },
//           },
//         ],
//       },
//     ],
//     })),
// ];
