// import { useState } from "react";
// import Layout from "./components/Layout";
// import { theme } from "./theme/theme";

// export default function App() {
//   const [billCount, setBillCount] = useState(0);

//   return (
//     <Layout title="Daksh Billing">
//       <h2 style={theme.typography.titleLarge}>
//         Welcome to Daksh Innovation Labs
//       </h2>

//       <p style={theme.typography.bodyLarge}>
//         Mobile Billing & POS System
//       </p>

//       {/* Card */}
//       <div
//         style={{
//           marginTop: 24,
//           background: "white",
//           borderRadius: theme.layout.cardRadius,
//           padding: 16,
//           border: `1px solid ${theme.colors.borderColor}`,
//           maxWidth: 320
//         }}
//       >
//         <div style={{ fontSize: 14 }}>Bills Generated</div>
//         <div
//           style={{
//             fontSize: 28,
//             fontWeight: "bold",
//             color: theme.colors.primaryBlue
//           }}
//         >
//           {billCount}
//         </div>
//       </div>

//       {/* Button */}
//       <button
//         onClick={() => setBillCount(billCount + 1)}
//         style={{
//           marginTop: 30,
//           width: "100%",
//           background: theme.button.primary.background,
//           color: theme.button.primary.color,
//           padding: theme.button.primary.padding,
//           borderRadius: theme.layout.borderRadius,
//           border: "none",
//           fontSize: theme.button.primary.fontSize,
//           fontWeight: theme.button.primary.fontWeight
//         }}
//       >
//         Create New Bill
//       </button>
//     </Layout>
//   );
// }
