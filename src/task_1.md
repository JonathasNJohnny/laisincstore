# LAISINC STORE --- Especificação do Projeto

## 1. Visão geral

Criar a **LaisInc Store**, uma loja virtual moderna, responsiva e
visualmente inspirada na estrutura de navegação da loja Amigu Verso,
porém com identidade própria, nome, textos, imagens, produtos e paleta
da Laís Inc.

> Importante: usar a Amigu Verso apenas como referência de organização e
> experiência de navegação. Não copiar código, textos, imagens, logotipo
> ou elementos proprietários.

A aplicação será desenvolvida com:

-   React
-   Vite
-   TypeScript
-   React Router
-   CSS Modules ou Tailwind CSS
-   Estado global simples para carrinho e favoritos
-   Persistência local do carrinho
-   Backend/API preparado para integração futura
-   Deploy em VPS com Nginx

------------------------------------------------------------------------

## 2. Identidade visual

### Nome da marca

**Laís Inc Store**

### Personalidade

-   Fofa
-   Criativa
-   Artesanal
-   Jovem
-   Acolhedora
-   Delicada
-   Com detalhes de universo, estrelas e fantasia

### Paleta principal

  Função                     Cor                 HEX
  -------------------------- ------------------- -----------
  Fundo principal            Creme               `#F6F1EB`
  Rosa da marca              Rosa Laís           `#F45B8B`
  Roxo principal             Roxo profundo       `#280B3B`
  Botões/CTA                 Dourado suave       `#F5B653`
  Ícones e detalhes          Roxo médio          `#6652B8`
  Links e textos especiais   Azul arroxeado      `#433A9B`
  Campos e cards             Branco              `#FFFFFF`
  Bordas                     Cinza quente        `#D8D3CF`
  Texto principal            Grafite arroxeado   `#302635`
  Texto secundário           Cinza amarronzado   `#756A72`

### Regras de uso

-   O fundo geral deve ser creme `#F6F1EB`.
-   O rosa deve aparecer em títulos, destaques, etiquetas e detalhes de
    marca.
-   O dourado deve ser usado principalmente em botões de ação.
-   O roxo profundo deve ser usado no rodapé, textos fortes e seções
    especiais.
-   Não usar todas as cores em excesso no mesmo componente.
-   Manter bastante espaço em branco.
-   Usar bordas arredondadas e sombras leves.
-   Garantir contraste adequado em textos e botões.

------------------------------------------------------------------------

## 3. Referência de estrutura

A página deve seguir uma experiência semelhante à de uma loja virtual
artesanal:

1.  Cabeçalho com marca e navegação.
2.  Ícones de redes sociais.
3.  Busca de produtos.
4.  Conta do cliente.
5.  Carrinho.
6.  Banner principal.
7.  Seção de novidades.
8.  Seção de ofertas.
9.  Seção de categorias ou coleções.
10. Vitrine de produtos.
11. Seção sobre a Laís Inc.
12. Cadastro para novidades e promoções.
13. Rodapé completo.

------------------------------------------------------------------------

## 4. Páginas obrigatórias

### `/`

Página inicial com:

-   Header
-   Hero/banner
-   Novidades
-   Ofertas
-   Categorias
-   Produtos em destaque
-   Seção institucional
-   Newsletter
-   Footer

### `/loja`

Página de catálogo com:

-   Lista de produtos
-   Filtro por categoria
-   Filtro por preço
-   Ordenação
-   Busca
-   Paginação ou carregamento progressivo
-   Estado vazio quando não houver produtos

### `/produto/:slug`

Página de produto com:

-   Galeria de imagens
-   Nome
-   Descrição
-   Preço
-   Preço promocional, quando existir
-   Variações
-   Quantidade
-   Botão adicionar ao carrinho
-   Informações de envio
-   Produtos relacionados

### `/categoria/:slug`

Página de produtos filtrados por categoria.

### `/carrinho`

Página com:

-   Produtos adicionados
-   Quantidade
-   Remover produto
-   Subtotal
-   Frete estimado
-   Cupom
-   Total
-   Botão continuar comprando
-   Botão ir para checkout

### `/checkout`

Preparar estrutura para:

-   Dados do cliente
-   Endereço
-   Forma de envio
-   Integração futura com SuperFrete
-   Forma de pagamento
-   Resumo do pedido

Nesta primeira versão, o checkout pode ser demonstrativo, mas a
arquitetura deve permitir integração real depois.

### `/sobre`

Página institucional da Laís Inc.

### `/contato`

Página com:

-   Formulário
-   E-mail
-   Redes sociais
-   WhatsApp
-   Horário de atendimento

### `/politica-de-privacidade`

Página de privacidade.

### `/termos`

Página de termos de uso.

------------------------------------------------------------------------

## 5. Header

Criar um cabeçalho elegante e responsivo.

### Desktop

-   Logo da Laís Inc à esquerda.
-   Redes sociais centralizadas ou próximas ao centro.
-   Ícones de usuário e carrinho à direita.
-   Menu com:
    -   Início
    -   Loja
    -   Sobre
    -   Agradecimentos
-   Campo de pesquisa com label ou placeholder.
-   Botão dourado `Pesquisar`.

### Mobile

-   Logo reduzida.
-   Botão de menu.
-   Ícone de busca.
-   Ícone de carrinho.
-   Menu lateral ou dropdown.
-   Redes sociais em uma linha adaptável.

### Comportamento

-   Header fixo ou sticky apenas se não prejudicar a experiência.
-   Mudança visual discreta ao rolar.
-   Busca funcional.
-   Contador de itens no carrinho.
-   Navegação por teclado.
-   Labels acessíveis nos ícones.

------------------------------------------------------------------------

## 6. Hero principal

Criar uma área de destaque com:

-   Título forte e delicado.
-   Subtítulo curto.
-   Botão `Conhecer a loja`.
-   Botão secundário `Ver novidades`.
-   Imagem ou ilustração de destaque.
-   Elementos decorativos sutis, como estrelas e brilhos.
-   Layout em duas colunas no desktop.
-   Layout empilhado no mobile.

Sugestão de texto:

> Um universo de coisas lindas para você.

Subtexto:

> Descubra produtos criativos, delicados e feitos para deixar seus
> momentos ainda mais especiais.

Não utilizar textos da Amigu Verso literalmente.

------------------------------------------------------------------------

## 7. Vitrines de produtos

Criar componente reutilizável `ProductCard`.

Cada card deve conter:

-   Imagem principal.
-   Badge opcional: `Novo`, `Oferta` ou `Destaque`.
-   Nome do produto.
-   Categoria.
-   Preço.
-   Preço anterior opcional.
-   Botão `Ver opções`.
-   Botão de adicionar ao carrinho quando aplicável.
-   Favoritar.
-   Efeito hover suave.
-   Imagem com proporção consistente.

### Estados

-   Produto disponível.
-   Produto esgotado.
-   Produto em promoção.
-   Produto com variações.
-   Produto sem imagem.
-   Carregamento skeleton.

------------------------------------------------------------------------

## 8. Dados iniciais

Criar dados mockados em `src/data/products.ts`.

Exemplo:

``` ts
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  badge?: "Novo" | "Oferta" | "Destaque";
  stock: number;
  featured?: boolean;
};
```

Criar inicialmente produtos fictícios, por exemplo:

-   Marca Página Flores
-   Chaveiro Coração
-   Kit Cartinhas
-   Adesivos Laís Inc
-   Presente Personalizado
-   Item Colecionável

Os produtos reais deverão ser substituídos posteriormente.

------------------------------------------------------------------------

## 9. Carrinho

Criar `CartContext` ou store equivalente.

Funcionalidades:

-   Adicionar produto.
-   Remover produto.
-   Alterar quantidade.
-   Calcular subtotal.
-   Calcular total.
-   Persistir no `localStorage`.
-   Mostrar contador no header.
-   Exibir mensagem quando produto for adicionado.
-   Impedir quantidade maior que o estoque.
-   Limpar carrinho.

Tipos sugeridos:

``` ts
type CartItem = {
  product: Product;
  quantity: number;
};
```

------------------------------------------------------------------------

## 10. Busca

A busca deve:

-   Procurar por nome.
-   Procurar por categoria.
-   Ignorar diferença entre maiúsculas e minúsculas.
-   Mostrar estado sem resultados.
-   Permitir limpar a busca.
-   Funcionar no header e na página da loja.
-   Atualizar a URL com query string quando possível.

Exemplo:

``` text
/loja?search=coracao
```

------------------------------------------------------------------------

## 11. Responsividade

A aplicação deve funcionar em:

-   320px
-   375px
-   414px
-   768px
-   1024px
-   1280px
-   1440px ou mais

### Regras

-   Nunca criar scroll horizontal no body.
-   Cards devem se adaptar ao espaço.
-   Grid de produtos:
    -   Mobile: 2 colunas quando houver espaço.
    -   Tablet: 3 colunas.
    -   Desktop: 4 colunas.
-   Header deve virar menu mobile.
-   Textos não podem ficar cortados.
-   Imagens devem ser responsivas.
-   Botões devem ter área de toque confortável.

------------------------------------------------------------------------

## 12. Componentes sugeridos

Estrutura:

``` text
src/
├── assets/
├── components/
│   ├── Header/
│   ├── Footer/
│   ├── SocialLinks/
│   ├── SearchBar/
│   ├── Hero/
│   ├── SectionTitle/
│   ├── ProductCard/
│   ├── ProductGrid/
│   ├── CategoryCard/
│   ├── Newsletter/
│   ├── CartDrawer/
│   ├── QuantitySelector/
│   ├── Badge/
│   ├── Button/
│   └── LoadingSkeleton/
├── contexts/
│   └── CartContext.tsx
├── data/
│   ├── products.ts
│   └── categories.ts
├── layouts/
│   └── MainLayout.tsx
├── pages/
│   ├── Home/
│   ├── Shop/
│   ├── Product/
│   ├── Category/
│   ├── Cart/
│   ├── Checkout/
│   ├── About/
│   ├── Contact/
│   ├── Privacy/
│   └── Terms/
├── routes/
│   └── index.tsx
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── animations.css
├── types/
│   └── index.ts
├── utils/
│   ├── currency.ts
│   └── slugify.ts
├── App.tsx
└── main.tsx
```

------------------------------------------------------------------------

## 13. Tipografia

Usar uma combinação de:

-   Fonte serifada delicada para títulos.
-   Fonte sans-serif limpa para textos e interface.

Sugestão:

-   Títulos: `Playfair Display` ou `Cormorant Garamond`.
-   Textos: `Poppins`, `Montserrat` ou `Inter`.

A tipografia deve ser carregada de forma otimizada. Se usar Google
Fonts, considerar fallback local.

------------------------------------------------------------------------

## 14. Animações

Usar animações discretas:

-   Fade-in ao entrar na viewport.
-   Hover suave nos cards.
-   Transição de botões.
-   Microanimação no carrinho.
-   Brilhos decorativos muito leves.
-   Respeitar `prefers-reduced-motion`.

Evitar:

-   Animações excessivas.
-   Elementos pulando constantemente.
-   Efeitos que prejudiquem leitura.
-   Vídeos pesados no carregamento inicial.

------------------------------------------------------------------------

## 15. Acessibilidade

Implementar:

-   HTML semântico.
-   `alt` em imagens.
-   Labels em inputs.
-   Botões reais em vez de divs clicáveis.
-   Foco visível.
-   Contraste adequado.
-   Navegação por teclado.
-   `aria-label` nos ícones.
-   Mensagens de feedback acessíveis.
-   Estados de loading e erro claros.

------------------------------------------------------------------------

## 16. SEO

Implementar:

-   Título individual por página.
-   Meta description.
-   URLs amigáveis.
-   Slugs de produtos.
-   Open Graph.
-   Sitemap posteriormente.
-   Dados estruturados de produto em etapa futura.
-   Imagens otimizadas.
-   Textos institucionais originais.

------------------------------------------------------------------------

## 17. Integrações futuras

### SuperFrete

Preparar uma camada de serviço:

``` text
src/services/shippingService.ts
```

Responsabilidades futuras:

-   Calcular frete.
-   Consultar modalidades.
-   Consultar prazo.
-   Criar etiqueta.
-   Rastrear pedido.

Nunca expor tokens da SuperFrete no frontend. As credenciais devem ficar
em backend ou API segura.

### Pagamento

Preparar integração futura com gateway de pagamento.

Nunca guardar dados sensíveis de cartão no frontend ou no banco sem uma
solução apropriada.

### Backend

A aplicação deve poder consumir uma API REST futuramente:

``` text
GET    /api/products
GET    /api/products/:slug
POST   /api/orders
POST   /api/shipping/quote
POST   /api/newsletter
```

------------------------------------------------------------------------

## 18. Configuração inicial

Criar projeto:

``` bash
npm create vite@latest laisinc-store -- --template react-ts
cd laisinc-store
npm install
npm install react-router-dom lucide-react
npm run dev
```

Se escolher Tailwind, configurar a versão compatível com o projeto.

Scripts esperados:

``` json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

------------------------------------------------------------------------

## 19. Variáveis de ambiente

Criar `.env.example`:

``` env
VITE_APP_NAME=Laís Inc Store
VITE_API_URL=http://localhost:3000/api
VITE_WHATSAPP_NUMBER=
VITE_INSTAGRAM_URL=
VITE_TWITCH_URL=
VITE_YOUTUBE_URL=
VITE_DISCORD_URL=
VITE_TIKTOK_URL=
```

Não colocar segredos em variáveis `VITE_`, pois elas são expostas no
frontend.

------------------------------------------------------------------------

## 20. Deploy na VPS

Fluxo sugerido:

1.  Desenvolver localmente.
2.  Rodar testes.
3.  Executar build.
4.  Enviar a pasta `dist` para a VPS.
5.  Configurar Nginx.
6.  Apontar domínio para a VPS.
7.  Configurar HTTPS.
8.  Ativar fallback de SPA para React Router.

Exemplo de configuração Nginx:

``` nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    root /var/www/laisinc/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        try_files $uri =404;
        access_log off;
        expires 30d;
    }
}
```

Antes de aplicar na VPS, verificar as configurações existentes para não
interromper outros serviços.

------------------------------------------------------------------------

## 21. Critérios de conclusão

O projeto será considerado pronto quando:

-   [ ] React + Vite estiver funcionando.
-   [ ] Página inicial estiver implementada.
-   [ ] Header desktop e mobile estiverem funcionando.
-   [ ] Busca estiver funcionando.
-   [ ] Catálogo estiver funcionando.
-   [ ] Cards de produtos estiverem funcionando.
-   [ ] Página individual de produto estiver funcionando.
-   [ ] Carrinho estiver funcionando.
-   [ ] Carrinho persistir no navegador.
-   [ ] Layout estiver responsivo.
-   [ ] Paleta da Laís Inc estiver aplicada.
-   [ ] Textos forem originais.
-   [ ] Imagens forem próprias ou licenciadas.
-   [ ] Não houver erros no console.
-   [ ] Build de produção passar.
-   [ ] Rotas funcionarem diretamente no Nginx.
-   [ ] Projeto estiver preparado para SuperFrete.
-   [ ] SEO básico estiver configurado.
-   [ ] Acessibilidade básica estiver implementada.

------------------------------------------------------------------------

## 22. Direção final do design

A Laís Inc deve parecer uma loja virtual artesanal e encantadora, com:

-   Fundo creme.
-   Títulos rosa.
-   Botões dourados.
-   Rodapé roxo profundo.
-   Logo circular ou emblema de universo.
-   Ícones sociais no cabeçalho.
-   Cards de produtos limpos.
-   Bordas arredondadas.
-   Espaçamento generoso.
-   Pequenos detalhes de estrelas e brilho.
-   Navegação simples e clara.
-   Experiência de compra rápida e agradável.

O resultado deve ser uma recriação original da experiência de uma loja
artesanal moderna, usando a estrutura de ecommerce como referência, mas
com identidade própria da Laís Inc Store.
