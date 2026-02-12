# 🔐 SENHAS DAS PASTAS - HMFM
## Hospital Maternidade Fernando Magalhães

---

## 📋 Lista de Senhas por Nome da Pasta

**IMPORTANTE:** As senhas são configuradas pelo **NOME EXATO** da pasta como está no banco de dados (em MAIÚSCULAS).

| Nome da Pasta                        | Senha    |
|--------------------------------------|----------|
| ALMOXARIFADO                         | 914275   |
| CCIH                                 | 582634   |
| CENTRO DE ESTUDOS                    | 739148   |
| CGA                                  | 463729   |
| CHEFIA DE ANESTESIA                  | 825196   |
| CHEFIA DE CLÍNICA MÉDICA             | 637482   |
| CHEFIA DE ENFERMAGEM NEONATAL        | 491837   |
| CHEFIA DE GINECOLOGIA                | 758294   |
| CHEFIA DE NEONATOLOGIA               | 384659   |
| CHEFIA DE OBSTETRÍCIA                | 926571   |
| CHEFIA DE PACIENTES EXTERNOS         | 571938   |
| CHEFIA DE PACIENTES INTERNOS         | 648273   |
| CHEFIAS DE ENFERMAGEM                | 395827   |
| CMA                                  | 817462   |
| COMITÊ DE ÉTICA DE ENFERMAGEM        | 264951   |
| COMITÊ DE ÉTICA MÉDICA               | 751839   |
| COMITÊ DE ÓBITO MATERNO              | 438697   |
| COMPRAS                              | 621875   |
| DIREÇÃO GERAL                        | 983456   |
| DOCUMENTAÇÃO MÉDICA                  | 526948   |
| DSADT                                | 749183   |
| FARMÁCIA                             | 762149   |
| FATURAMENTO                          | 314826   |
| LABORATÓRIOS                         | 894536   |
| MANUTENÇÃO                           | 681359   |
| NATS                                 | 927543   |
| NSP                                  | 453719   |
| NUTRIÇÃO                             | 598274   |
| RADIOLOGIA                           | 316478   |
| RH                                   | 485932   |
| SERVIÇO SOCIAL                       | 729465   |

---

## ⚙️ Configurações

- **Senha Padrão para Novas Pastas:** `111111`
- **Formato:** 6 dígitos numéricos aleatórios
- **Proteção:** Todas as pastas requerem senha para acesso
- **Mapeamento:** Senhas são atribuídas pelo NOME da pasta

---

## 📝 Notas Importantes

1. Cada pasta possui uma senha única de 6 dígitos
2. A senha é solicitada ao tentar acessar uma pasta pela primeira vez
3. Uma vez desbloqueada, a pasta permanece acessível durante a sessão
4. Novas pastas criadas usarão automaticamente a senha padrão `111111`
5. As senhas são configuradas no arquivo: `lib/folder-passwords.ts`

---

## 🔄 Como Adicionar Senha para Novas Pastas

Para adicionar senha a uma pasta existente no banco:

1. Abra o arquivo: `lib/folder-passwords.ts`
2. No objeto `folderPasswordsByName`, adicione uma linha com o nome EXATO da pasta:
   ```typescript
   export const folderPasswordsByName: Record<string, string> = {
     "Nome Exato da Pasta": "123456",  // Senha de 6 dígitos
     // ... outras pastas
   };
   ```
3. Salve o arquivo

**IMPORTANTE:** O nome da pasta deve ser EXATAMENTE igual ao que está cadastrado no banco de dados (incluindo acentos, maiúsculas/minúsculas e espaços).

---

## 🔄 Como Alterar Senhas

Para alterar a senha de uma pasta:

1. Abra o arquivo: `lib/folder-passwords.ts`
2. Localize o nome da pasta no objeto `folderPasswordsByName`
3. Altere a senha (deve ter exatamente 6 dígitos)
4. Salve o arquivo

Exemplo:
```typescript
export const folderPasswordsByName: Record<string, string> = {
  "Administração": "847293",  // Altere aqui para modificar a senha
  "Enfermagem": "529614",
  // ...
};
```

---

## ⚠️ Segurança

- Mantenha este arquivo em local seguro
- Não compartilhe senhas publicamente
- Atualize as senhas periodicamente
- Use senhas únicas para cada pasta

---

**Data de Criação:** 10/02/2026  
**Sistema:** Explorer de Documentos HMFM
