import{c as s}from"./createLucideIcon-D7_jbA2O.js";import{b as r}from"./authService-C9u1LQrx.js";/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const t=[["path",{d:"M8 22h8",key:"rmew8v"}],["path",{d:"M7 10h10",key:"1101jm"}],["path",{d:"M12 15v7",key:"t2xh3l"}],["path",{d:"M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z",key:"10ffi3"}]],d=s("wine",t),p={listarPorTrabalhador:async a=>(await r.get(`/trabalhadores/${a}/informacoes`)).data,obterPorId:async(a,e)=>(await r.get(`/trabalhadores/${a}/informacoes/${e}`)).data,criar:async(a,e)=>(await r.post(`/trabalhadores/${a}/informacoes`,e)).data,atualizar:async(a,e,o)=>(await r.put(`/trabalhadores/${a}/informacoes/${e}`,o)).data,deletar:async(a,e)=>{await r.delete(`/trabalhadores/${a}/informacoes/${e}`)}};export{d as W,p as i};
