if(!self.define){let e,s={};const a=(a,i)=>(a=new URL(a+".js",i).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(i,n)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let c={};const r=e=>a(e,t),o={module:{uri:t},exports:c,require:r};s[t]=Promise.all(i.map((e=>o[e]||r(e)))).then((e=>(n(...e),c)))}}define(["./workbox-e9849328"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"8b850e49030f4de9a1e2455862e58171"},{url:"/_next/static/chunks/1a685741-6e5ad6c113fa36e5.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/3633-d3a4c6ac67c1a5ee.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/5240-3259847d7dec7c53.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/5621-b02a13888c0a067e.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/6227-fbc37d9be1ca7490.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/6716-7a511901ee0bbb74.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/6783-6430b1242dd3159b.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/7293-94509313c8c89282.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/740-d941f859393a4d7d.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/8207-56c83228eb5115c5.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/8559-bbe94e3bc1e2fb01.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/_not-found/page-9107504b32668b0a.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/api/auth/me/route-484d30423731b773.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/auth/login/page-99cf1f97b1545703.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/auth/logout/page-53cc6c79800a07af.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/admin/create-company/page-0f19b20025579846.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/admin/invoices/page-737ae03ffdaebd21.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/admin/layout-1be73671e69e3250.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/admin/manage-companies/page-0c20030de8f1b1e5.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/admin/page-fce20b45646b5138.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/admin/payments/page-d4439e1fdd8bfd0e.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/admin/productCategories/page-7fcc028d9773acde.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/admin/stores/page-c146f3d36fbfd253.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/eod-report/page-e15a72e9b87ecc4e.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/layout-df252dfd10449063.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/log-inventory/page-8f45c6f40a8ad91d.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/manage-upgrades/available-devices/page-b25a1501c57326e5.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/manage-upgrades/create-invoice/page-1495f23f9d95df14.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/manage-upgrades/invoice-details/page-2843df1245141c0d.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/manage-upgrades/layout-59f53aec4d16b449.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/manage-upgrades/page-7b090cd0d4fe4e4c.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/manage-upgrades/receives-transfers/page-fdac935c43f47b96.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/manage-upgrades/sale-history/page-76ef6382a99dfc73.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/page-49db92c9b2e6f98c.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/employee/todos/page-e62bb075df78069a.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/manager/layout-2d55df981f908346.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/manager/page-76847006aed13a10.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/assign-todos/page-fb90ba649ed69f32.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/cash-collection/page-c2ad248a0ec8d41d.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/inventory/layout-590fb78ec0273a16.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/inventory/min-setup/page-6129707cf34bbc73.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/inventory/page-495d6a8a6baf9f7e.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/inventory/reorder/page-6be654dd22c35e3f.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/layout-7aa8e50fb7e25a7d.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/manage-employees/page-43a661d6c567dcb1.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/manage-stores/page-8135156ef3f3ac2c.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/page-4cc644cd0cfa6fea.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/paychecks/company-commission/page-2d84270c019c7289.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/paychecks/employee-pay-setup/page-b2a7bf40ebed26d5.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/paychecks/layout-a43dd41b8993ce5c.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/paychecks/page-602e772155eff110.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/owner/targets/page-d266f3ceacc8842d.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/dashboard/page-dfe5b6fce50df85e.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/layout-da942b44382afd2f.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/not-found-6ff9409045179409.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/page-c6b9dfa3ef5dfe1d.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/app/unauthorized/page-adbace5947727bee.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/framework-10f938b63c10098b.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/main-app-f8eb8e87e82cd737.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/main-c95260bc333ee1a8.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/pages/_app-a3433e2d7b74204f.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/pages/_error-c5e7fbd50bc9018d.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-389f51cc41d6de2e.js",revision:"xG0yiS6917B6EWYmbVxJ_"},{url:"/_next/static/css/b5b1190f10017883.css",revision:"b5b1190f10017883"},{url:"/_next/static/media/0aa834ed78bf6d07-s.woff2",revision:"324703f03c390d2e2a4f387de85fe63d"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/67957d42bae0796d-s.woff2",revision:"54f02056e07c55023315568c637e3a96"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/886030b0b59bc5a7-s.woff2",revision:"c94e6e6c23e789fcb0fc60d790c9d2c1"},{url:"/_next/static/media/939c4f875ee75fbb-s.woff2",revision:"4a4e74bed5809194e4bc6538eb1a1e30"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/bb3ef058b751a6ad-s.p.woff2",revision:"782150e6836b9b074d1a798807adcb18"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/_next/static/media/f911b923c6adde36-s.woff2",revision:"0f8d347d49960d05c9430d83e49edeb7"},{url:"/_next/static/xG0yiS6917B6EWYmbVxJ_/_buildManifest.js",revision:"b54ba0b11498e779d99947618fc36b57"},{url:"/_next/static/xG0yiS6917B6EWYmbVxJ_/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/about.txt",revision:"0e1fc71590719cb7b2f928c7527a5917"},{url:"/faviconio-logo/about.txt",revision:"9303a0e4316da3f9cd4622fea4b20a5b"},{url:"/faviconio-logo/logo.png",revision:"460047c6fd56b076bbe47fb25db1b18e"},{url:"/faviconio-logo/logo.svg",revision:"c0de494abf2ba35080594766d6ec1538"},{url:"/icons/1c-192x192.png",revision:"f3f67b5a2c6dcfaf9ea35150f1f6fa10"},{url:"/icons/1c-512x512.png",revision:"2fd3424cc0c73009204e66d6f06d0695"},{url:"/icons/apple-touch-icon.png",revision:"828c546ce498a8046db080bb804b99f7"},{url:"/icons/favicon-16x16.png",revision:"f30ffc7f84d349e353076d3e498e8a46"},{url:"/icons/favicon-32x32.png",revision:"45e2566abde45e048bce4cbbd8b2bf4e"},{url:"/icons/favicon.ico",revision:"662e5c62e8187be7aa4f40c651d4723e"},{url:"/manifest.json",revision:"6ea0f4e10c8b3e374c311221557f4d42"},{url:"/service-worker.js",revision:"53ea755e92b429b3e882e945329cd78d"},{url:"/site.webmanifest",revision:"053100cb84a50d2ae7f5492f7dd7f25e"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:i})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
