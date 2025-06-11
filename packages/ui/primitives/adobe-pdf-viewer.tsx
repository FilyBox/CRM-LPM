// 'use client';

// import { useEffect, useState } from 'react';

// import { set } from 'date-fns';

// declare global {
//   interface Window {
//     AdobeDC: any;
//   }
// }

// const AdobePdfViewer = ({ url, name }: { url: string; name: string }) => {
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const initializeAdobeDCView = () => {
//       if (!window.AdobeDC || !window.AdobeDC.View) {
//         console.error('AdobeDC.View no está disponible.');
//         return;
//       }
//       // Limpiamos el contenedor antes de iniciar el visor
//       const pdfContainer = document.getElementById('pdf-view');
//       if (pdfContainer) {
//         pdfContainer.innerHTML = '';
//       }
//       const adobeDCView = new window.AdobeDC.View({
//         clientId: '3de8d63e07b6452d9fc48dfe3ef49090', // Reemplaza por tu ID si es necesario
//         divId: 'pdf-view',
//       });
//       adobeDCView.previewFile(
//         {
//           content: { location: { url } },
//           metaData: { fileName: name },
//         },
//         {
//           embedMode: 'FULL_WINDOW',
//           defaultViewMode: 'FIT_WIDTH',
//           showFullScreen: true,
//           showAnnotationTools: false,
//           showZoomControl: true,
//           focusOnRendering: true,
//           showDownloadPDF: true,
//         },
//       );

//       adobeDCView.registerCallback(
//         window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
//         function (event: { type: string }) {
//           switch (event.type) {
//             case 'APP_RENDERING_DONE':
//               setLoading(false);
//               break;
//             case 'APP_RENDERING_FAILED':
//               setLoading(false);
//               break;
//             //case "DOCUMENT_DOWNLOAD":
//             //  break;
//           }
//         },
//       );
//     };

//     const waitForAdobeDCView = (retries = 10, interval = 200) => {
//       let count = 0;
//       const timer = setInterval(() => {
//         if (window.AdobeDC && window.AdobeDC.View) {
//           clearInterval(timer);
//           initializeAdobeDCView();
//         } else {
//           count++;
//           if (count >= retries) {
//             clearInterval(timer);
//             console.error('AdobeDC.View no se inicializó a tiempo.');
//           }
//         }
//       }, interval);
//     };

//     const loadViewerScript = () => {
//       const scriptSrc = 'https://documentservices.adobe.com/view-sdk/viewer.js';
//       const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

//       if (existingScript) {
//         // Si el script ya está agregado, esperamos a que se inicialice AdobeDC.View
//         if (window.AdobeDC && window.AdobeDC.View) {
//           initializeAdobeDCView();
//         } else {
//           existingScript.addEventListener('load', () => {
//             waitForAdobeDCView();
//           });
//         }
//       } else {
//         const viewerScript = document.createElement('script');
//         viewerScript.src = scriptSrc;
//         viewerScript.async = true;
//         viewerScript.onload = () => {
//           waitForAdobeDCView();
//         };
//         document.body.appendChild(viewerScript);
//       }
//     };

//     loadViewerScript();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [url, name]);

//   return (
//     <div className="relative h-[80vh] max-h-full w-full rounded-3xl">
//       {loading && (
//         <div className="absolute inset-0 flex h-full w-full animate-pulse items-center justify-center !rounded-3xl bg-zinc-300"></div>
//       )}
//       <div className="h-full w-full !rounded-3xl" id="pdf-view"></div>
//     </div>
//   );
// };

// export default AdobePdfViewer;
