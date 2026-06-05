import{c as e}from"./createLucideIcon-D7_jbA2O.js";import{b as s}from"./authService-C9u1LQrx.js";/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=[["path",{d:"m14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381",key:"pgg06f"}],["path",{d:"m16 16 6-6",key:"vzrcl6"}],["path",{d:"m21.5 10.5-8-8",key:"a17d9x"}],["path",{d:"m8 8 6-6",key:"18bi4p"}],["path",{d:"m8.5 7.5 8 8",key:"1oyaui"}]],c=e("gavel",n),p={listar:async a=>(await s.get("/atos-municipais",{params:a})).data,obter:async a=>(await s.get(`/atos-municipais/${a}`)).data,criar:async a=>(await s.post("/atos-municipais",a)).data,atualizar:async(a,t)=>(await s.put(`/atos-municipais/${a}`,t)).data,deletar:async a=>{await s.delete(`/atos-municipais/${a}`)}};export{c as G,p as a};
