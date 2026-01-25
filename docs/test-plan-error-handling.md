# Plano de Testes - Error Handling & Programação Defensiva

> Criado em: Janeiro 2025
> Contexto: Melhorias de tratamento de erros, error boundaries, e programação defensiva

---

## Resumo das Mudanças

### Arquivos Criados
- `src/core/components/ui/error-card.tsx` - Card de erro reutilizável
- `src/core/components/query-boundary.tsx` - Wrapper para React Query + ErrorBoundary
- `src/core/components/async-boundary.tsx` - Wrapper simplificado para Suspense + ErrorBoundary
- `src/core/components/page-boundary.tsx` - Wrapper padrão para páginas
- `src/core/utils/safe-array.ts` - Helper para operações seguras em arrays
- `src/core/hooks/use-safe-query.ts` - Hook opcional para queries seguras
- `src/app/(app)/error.tsx` - Error boundary para app
- `src/app/(app)/settings/error.tsx` - Error boundary para settings
- `src/app/(setup)/setup/error.tsx` - Error boundary para setup
- `src/app/(app)/organization/error.tsx` - Error boundary para organization
- `src/app/(app)/library/error.tsx` - Error boundary para library

### Arquivos Modificados
- `src/core/providers/query.provider.tsx` - Adicionado retry: 2 com backoff exponencial
- `src/core/utils/reactQuery.ts` - Removido retry: false forçado
- `src/app/(app)/layout.tsx` - Adicionado .catch() em getPermissions e getOrganizationName
- `src/app/(app)/settings/code-review/[repositoryId]/general/page.tsx` - AsyncBoundary
- `src/app/(app)/settings/code-review/[repositoryId]/custom-messages/page.tsx` - PageBoundary
- `src/app/(app)/settings/code-review/[repositoryId]/kody-rules/_components/_page.tsx` - PageBoundary
- `src/app/(app)/library/kody-rules/_components/suggestions-modal.tsx` - Error handling no useQuery
- `src/features/ee/subscription/@licenses/_components/columns.tsx` - AsyncBoundary no cell
- `src/features/ee/byok/_components/_modals/edit-key/index.tsx` - ErrorBoundary adicional
- `src/features/ee/byok/page.tsx` - .catch() no getBYOK
- `src/features/ee/subscription/@licenses/page.tsx` - .catch() em múltiplas chamadas
- `src/features/ee/token-usage/page.tsx` - .catch() no validateOrganizationLicense
- `src/features/ee/cockpit/layout.tsx` - .catch() no validateOrganizationLicense
- `src/features/ee/cockpit/@bugRatioAnalytics/page.tsx` - Null checks + fallback
- `src/features/ee/cockpit/@prSizeAnalytics/page.tsx` - Null checks + fallback
- `src/features/ee/cockpit/@deployFrequencyAnalytics/page.tsx` - Null checks + fallback
- `src/features/ee/cockpit/@prCycleTimeAnalytics/page.tsx` - Null checks + fallback

---

## 🔴 CRÍTICO - Testar Primeiro

### 1. Layout Principal

| O que testar | Como quebrar | Resultado esperado |
|--------------|--------------|-------------------|
| `getPermissions()` falha | Retornar 500 em `GET /permissions` | App carrega com permissões vazias, não crashar |
| `getOrganizationName()` falha | Retornar 500 em `GET /organizations/name` | App carrega com nome vazio |
| `getTeams()` falha | Retornar 500 em `GET /teams` | Mostra `global-error.tsx` |

---

## 🟠 ALTA PRIORIDADE - Error Boundaries

### 2. Settings > Code Review > General

**Rota:** `/settings/code-review/[repositoryId]/general`

| Componente | Como quebrar | Resultado esperado |
|------------|--------------|-------------------|
| `IsRequestChangesActive` | Quebrar `GET /setup/connections` | Erro inline minimal, página não crashar |
| `EnableCommittableSuggestions` | Quebrar `GET /setup/connections` | Erro inline minimal, página não crashar |

### 3. Settings > Code Review > Custom Messages

**Rota:** `/settings/code-review/[repositoryId]/custom-messages`

| O que testar | Como quebrar | Resultado esperado |
|--------------|--------------|-------------------|
| Página inteira | Quebrar `GET /pull-request-messages` | Card de erro com "Try again" |

### 4. Settings > Code Review > Kody Rules ⭐

**Rota:** `/settings/code-review/[repositoryId]/kody-rules`

| O que testar | Como quebrar | Resultado esperado |
|--------------|--------------|-------------------|
| Lista de rules | Quebrar `GET /kody-rules` | Card de erro "Failed to load Kody Rules" |
| Rules herdadas | Quebrar `GET /kody-rules/inherited` | Card de erro com "Try again" |

### 5. Library > Kody Rules > Suggestions Modal

**Rota:** `/library/kody-rules` → Clicar em uma rule → "View Suggestions"

| O que testar | Como quebrar | Resultado esperado |
|--------------|--------------|-------------------|
| Modal de sugestões | Quebrar `GET /kody-rules/suggestions` | Ícone de erro + botão "Try again" dentro do modal |

---

## 🟡 MÉDIA PRIORIDADE - 404 Handling

### 6. Organization > BYOK

**Rota:** `/organization/byok`

| O que testar | Como quebrar | Resultado esperado |
|--------------|--------------|-------------------|
| Config não existe | `GET /organization-parameters/find-by-key?key=byok_config` retorna 404 | Página carrega normal (config = null) |
| Modal de edição | Quebrar `GET /llm-providers` | Alert de erro dentro do modal |

### 7. Settings > Subscription > Licenses

**Rota:** `/settings/subscription` (aba Licenses)

| O que testar | Como quebrar | Resultado esperado |
|--------------|--------------|-------------------|
| Tabela de usuários | Quebrar `GET /organization/members` | Tabela vazia, não crashar |
| Switch de licença | Quebrar `GET /setup/connections` | Erro minimal no switch, tabela funciona |
| Config auto-assign | 404 em `/organization-parameters/find-by-key?key=auto_license_assignment` | Página carrega (config = null) |

### 8. Token Usage

**Rota:** `/token-usage`

| O que testar | Como quebrar | Resultado esperado |
|--------------|--------------|-------------------|
| Validação de licença | Quebrar `GET /billing/validate-license` | Redireciona para `/settings` |

### 9. Cockpit

**Rota:** `/cockpit`

| O que testar | Como quebrar | Resultado esperado |
|--------------|--------------|-------------------|
| Validação de licença | Quebrar `GET /billing/validate-license` | Redireciona para `/settings/git` |

---

## 🟢 BAIXA PRIORIDADE - Analytics Cards

### 10. Cockpit Analytics

**Rota:** `/cockpit`

| Card | Como quebrar | Resultado esperado |
|------|--------------|-------------------|
| Bug Ratio | API retorna dados vazios/malformados | Mostra "No Data" |
| PR Size | API retorna dados vazios/malformados | Mostra "No Data" |
| Deploy Frequency | API retorna dados vazios/malformados | Mostra placeholder |
| PR Cycle Time | API retorna dados vazios/malformados | Mostra "No Data" |

---

## 🔵 INFRAESTRUTURA - Retry Logic

### 11. React Query Retry

| O que testar | Como simular | Resultado esperado |
|--------------|--------------|-------------------|
| Retry automático | Desconectar internet por 2s, reconectar | Query tenta novamente (até 2x) |
| Backoff exponencial | Monitorar Network tab | Retries em 1s, 2s, 4s... |

---

## 🟣 PERMISSÕES

### 12. Acesso Negado

| O que testar | Como simular | Resultado esperado |
|--------------|--------------|-------------------|
| URL direta sem permissão | Logar como CONTRIBUTOR, acessar `/settings/subscription` | Redireciona para `/forbidden` |
| Menu escondido | Logar como CONTRIBUTOR | Menu "Subscription" não aparece |
| Botões desabilitados | Logar sem permissão de edição | Botões "Save" desabilitados |

---

## ⚫ HYDRATION (Verificar regressão)

| Componente | Verificar |
|------------|-----------|
| Support sidebar button | Sem warning no console |
| Settings sidebar (Global/Per Repository) | Sem warning no console |
| Test Review sidebar button | Sem warning no console |

---

## Como Testar

### Opção 1: Bloquear requests no Chrome DevTools

1. Abrir DevTools (F12)
2. Ir para aba **Network**
3. Clicar com botão direito na request
4. Selecionar **"Block request URL"**
5. Recarregar a página

### Opção 2: Modificar backend temporariamente

```typescript
// Adicionar no início da rota para simular erro
throw new Error("Teste de erro");

// Ou retornar 404
return res.status(404).json({ message: "Not found" });

// Ou retornar 500
return res.status(500).json({ message: "Internal server error" });
```

### Opção 3: Usar Network Throttling

1. DevTools → Network → Throttling dropdown
2. Selecionar "Offline" para simular sem internet
3. Verificar comportamento de retry

---

## Comandos Úteis

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build de produção (error.tsx funciona melhor em prod)
npm run build && npm run start

# Type check
npx tsc --noEmit

# Verificar erros de lint
npm run lint
```

---

## Checklist Final

### Crítico
- [ ] Layout não crasha se permissions/orgName falhar
- [ ] `global-error.tsx` aparece se getTeams falhar

### Error Boundaries
- [ ] Kody Rules mostra erro gracioso
- [ ] Custom Messages mostra erro gracioso
- [ ] General page - toggles mostram erro inline
- [ ] Suggestions modal mostra erro interno

### 404 Handling
- [ ] BYOK 404 não quebra página
- [ ] Licenses 404 não quebra página
- [ ] Token Usage redireciona se licença falhar
- [ ] Cockpit redireciona se licença falhar

### Analytics
- [ ] Bug Ratio mostra "No Data" se dados inválidos
- [ ] PR Size mostra "No Data" se dados inválidos
- [ ] Deploy Frequency mostra placeholder se dados inválidos
- [ ] PR Cycle Time mostra "No Data" se dados inválidos

### Infraestrutura
- [ ] Retry funciona (desconectar/reconectar internet)
- [ ] Backoff exponencial visível no Network tab

### Permissões
- [ ] `/forbidden` aparece para rotas sem permissão
- [ ] Menus escondidos para usuários sem Read
- [ ] Botões desabilitados para usuários sem Update/Create

### Hydration
- [ ] Sem warnings de hydration no console

---

## Notas

- Em modo **desenvolvimento**, Next.js mostra overlay de erro ao invés do `error.tsx`
- Em modo **produção** (`npm run build && npm run start`), o `error.tsx` é exibido corretamente
- O retry do React Query só funciona para erros de rede, não para erros 4xx/5xx por padrão
