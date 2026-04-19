# TODO: Fix TypeScript Errors - SISPNAIST Frontend

## Progress: 1/13 steps complete

### Etapa 1: Remove unused variables/imports (TS6133)
- [✓] 1. App.tsx: Remove unused HealthCheck import
- [ ] 2. useAsync.ts: Remove unused toast import
- [ ] 3. EditarAcidente.tsx: Remove unused IAcidente import
- [ ] 4. ListaAcidentes.tsx: Remove unused setPage
- [ ] 5. Dashboard.tsx: Remove unused dadosAcidentes, carregarKPIs
- [ ] 6. ListaUsuarios.tsx: Confirm/remove unused loading

### Etapa 2: Fix import paths (TS2307)
- [ ] 7. AcidentesPorMes.tsx: Verify/clean import '../types/analytics'

### Etapa 3: Fix invalid props (TS2322)
- [ ] 8. FormFields.tsx: Add optional help?: string to all component interfaces (TextInput, DatePicker, etc.)
- [ ] 9. Verify help props now type-safe in EditarAcidente/NovoAcidente/EditarDoenca

### Etapa 4: Fix type incompat (TS2353)
- [ ] 10. ListaUnidades.tsx: Improve empresaId handling (already safe w/ || fallback)

### Final Steps
- [ ] 11. Run `cd frontend && npx tsc --noEmit` to verify fixes
- [ ] 12. Test key pages: /acidentes/editar, /doencas/editar, Dashboard
- [ ] 13. Update this TODO with completion ✓

**Next step: #3 EditarAcidente.tsx - Remove unused IAcidente**

