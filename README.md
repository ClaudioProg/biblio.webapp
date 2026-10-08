# Bibliotecas Conectadas

Aplicação web do Projeto Integrador IV — Ciências da Computação (UNIVESP), desenvolvida para apoiar a gestão de bibliotecas públicas e a análise integrada de acervo, circulação e território.

A solução utiliza HTML, CSS, JavaScript vanilla, Web Components e Vite, consumindo a API publicada do projeto.

## Funcionalidades

### Gestão bibliográfica

- Cadastro, edição, consulta e exclusão de unidades (bibliotecas).
- Cadastro, edição, consulta e exclusão de livros.
- Controle de exemplares por unidade.
- Gestão de usuários/leitores.
- Registro e acompanhamento de empréstimos e devoluções.
- Gestão de acessos administrativos.
- Busca e preenchimento assistido por ISBN.

### Dashboard analítico

O Dashboard reúne duas camadas complementares:

1. **Indicadores nativos da plataforma**
   - títulos e exemplares;
   - unidades;
   - usuários ativos;
   - empréstimos abertos e devolvidos;
   - acervo por gênero, tipo de obra e unidade;
   - indicadores territoriais do Censo Demográfico 2022 por bairro.

2. **Power BI**
   - relatório analítico publicado no Power BI Service;
   - incorporação segura no Dashboard;
   - autenticação e permissões controladas pela conta Microsoft autorizada;
   - páginas de Visão Geral, Território, Acervo × Território, Circulação e Qualidade e Metodologia.

A incorporação utiliza a URL segura do Power BI. O projeto mantém `VITE_POWERBI_EMBED_URL` como override opcional; na ausência da variável, utiliza a URL segura atualmente publicada para o PI4.

> Não utilizar **Publicar na Web** para este relatório. A incorporação adotada é a opção segura **Site ou portal**, que respeita autenticação e permissões do Power BI.

## Dados territoriais

O recorte territorial usa dados oficiais do **IBGE — Censo Demográfico 2022**, no nível de bairro para Santos/SP.

O painel trabalha apenas com os **55 bairros do recorte confirmado**, preservando valores ausentes como nulos e documentando diferenças entre universos estatísticos.

Indicadores utilizados incluem:

- população;
- faixas etárias;
- taxa de alfabetização de pessoas com 15 anos ou mais;
- rendimento da pessoa responsável pelo domicílio.

Os indicadores territoriais são usados de forma **descritiva**. Eles não devem ser interpretados automaticamente como preferência literária, demanda por gênero ou relação causal com o acervo.

## Cadastro facilitado por ISBN

No formulário de livro, ao informar um ISBN válido:

- a aplicação consulta o backend em `/gestor/livros/isbn-lookup/`;
- o backend busca metadados em fontes externas configuradas;
- somente campos vazios são preenchidos, evitando sobrescrever informações já digitadas.

## Variáveis de ambiente

- `VITE_API_URL`: URL base da API backend.
- `VITE_ISBN_LOOKUP_ENABLED`: habilita/desabilita o preenchimento automático por ISBN.
- `VITE_POWERBI_EMBED_URL`: URL segura opcional para sobrescrever o relatório Power BI incorporado.

Arquivos `.env` não devem ser versionados.

## Estrutura principal

```
bibliotecas-conectadas/
├── public/
├── src/
│   ├── components/
│   │   ├── acesso/
│   │   ├── dashboard/
│   │   ├── emprestimo/
│   │   ├── livro/
│   │   ├── unidade/
│   │   └── usuario/
│   ├── css/
│   ├── domains/
│   │   ├── auth/
│   │   └── gestor/
│   ├── utils/
│   └── main.js
├── tests/
├── index.html
├── package.json
└── README.md
```

## Desenvolvimento

Instalação:

```bash
npm ci
```

Execução local:

```bash
npm run dev
```

Testes:

```bash
npm test
```

Build de produção:

```bash
npm run build
```

## Produção

- Frontend: Vercel.
- Backend: Render.
- Banco de dados: PostgreSQL/Neon.
- Power BI: Power BI Service, com incorporação segura.

## Observações sobre o Power BI

- O relatório publicado usa dados agregados e não inclui nome, e-mail, documento ou outro identificador de leitores.
- A visualização incorporada pode exigir autenticação Microsoft/Power BI.
- O acesso contínuo aos recursos de incorporação depende da licença/capacidade disponível no tenant Microsoft.
- Alterações futuras na URL publicada podem ser aplicadas por `VITE_POWERBI_EMBED_URL` sem necessidade de modificar a lógica do componente.

## Documentação complementar

A modelagem do Power BI, as fontes do IBGE, limitações metodológicas e procedimentos de publicação estão documentados no repositório do backend, em:

- `powerbi/README.md`
- `docs/pi4/ibge-inventario-fontes.md`
