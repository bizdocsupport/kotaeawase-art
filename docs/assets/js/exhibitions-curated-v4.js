/* v4.3.0 compatibility shim: exhibition master lives in exhibitions-data.js */
window.KA_CURATED_EXHIBITIONS = Array.isArray(window.KA_EXHIBITIONS)
  ? window.KA_EXHIBITIONS.filter(function(x){return x.kind==='exhibition';})
  : (window.KA_CURATED_EXHIBITIONS || []);
