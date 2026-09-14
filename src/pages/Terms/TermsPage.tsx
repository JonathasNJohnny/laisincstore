const sections = [
  {
    id: "introducao",
    title: "1. Introdução e Aceitação",
    content: `Bem-vindo à Laís Inc Store. Ao acessar e usar este site, você concorda com estes Termos de Uso ("Termos"). Se não concordar, por favor, não utilize nossos serviços.

Estes Termos constituem um acordo legal entre você ("Usuário", "Cliente", "Você") e a Laís Inc Store ("Empresa", "Nós", "Nosso").`,
  },
  {
    id: "definicoes",
    title: "2. Definições",
    content: `**Site:** A plataforma de e-commerce acessível em laisinc.com.br
**Produtos:** Itens artesanais, papelaria, acessórios e decoração vendidos no Site
**Pedido:** Solicitação de compra feita pelo Cliente
**Conta:** Cadastro do Usuário para acesso a recursos personalizados
**Conteúdo:** Textos, imagens, logos, designs, códigos e todo material do Site`,
  },
  {
    id: "cadastro",
    title: "3. Cadastro e Conta",
    content: `Para comprar, você deve:
- Ter capacidade civil (maior de 18 anos ou emancipado)
- Fornecer informações verdadeiras e atualizadas
- Manter sigilo de sua senha
- Notificar-nos imediatamente sobre uso não autorizado

Você é responsável por todas as atividades em sua conta. Podemos suspender ou cancelar contas com informações falsas ou uso indevido.`,
  },
  {
    id: "produtos-precos",
    title: "4. Produtos e Preços",
    content: `**Descrições:** Esforçamo-nos para ser precisos, mas não garantimos que descrições, cores ou imagens sejam livres de erros.
**Disponibilidade:** Estoque sujeito a alterações. Produtos esgotados podem aparecer momentaneamente.
**Preços:** Em Reais (BRL), incluem impostos aplicáveis. Frete calculado à parte.
**Alterações:** Podemos modificar preços e produtos a qualquer momento, sem aviso prévio. Pedidos já confirmados mantêm o preço acordado.`,
  },
  {
    id: "pedidos-pagamento",
    title: "5. Pedidos e Pagamento",
    content: `**Confirmação:** O pedido é confirmado após aprovação do pagamento.
**Pagamento:** Aceitamos PIX, cartão de crédito, boleto e carteiras digitais via parceiros seguros. Não armazenamos dados de cartão.
**Cancelamento:** Pedidos não pagos expiram automaticamente. Para cancelar pedido pago, entre em contato antes do envio.
**Recusa:** Reservamo-nos o direito de recusar ou limitar quantidades de pedidos.`,
  },
  {
    id: "entrega",
    title: "6. Entrega e Frete",
    content: `**Prazos:** Estimados no checkout, contados a partir da aprovação do pagamento.
**Responsabilidade:** Entregas via Correios/transportadoras. Atrasos por força maior não são nossa responsabilidade.
**Endereço:** O Cliente deve garantir endereço correto e alguém para receber. Reentregas podem gerar custo adicional.
**Frete grátis:** Em pedidos acima de R$ 299,00 (sujeito a regiões).`,
  },
  {
    id: "trocas-devolucoes",
    title: "7. Trocas e Devoluções",
    content: `**Arrependimento:** 7 dias corridos após recebimento (Código de Defesa do Consumidor). Produto deve estar intacto, na embalagem original, sem uso.
**Defeitos:** 30 dias para produtos não duráveis, 90 para duráveis. Enviamos etiqueta de postagem.
**Processo:** Solicite via e-mail contato@laisinc.com com número do pedido e fotos.
**Restituição:** Estorno no mesmo meio de pagamento ou vale-compras, em até 10 dias úteis após recebimento da devolução.`,
  },
  {
    id: "propriedade-intelectual",
    title: "8. Propriedade Intelectual",
    content: `Todo Conteúdo do Site (textos, imagens, logos, designs, código) é propriedade da Laís Inc ou licenciado a nós. É protegido por leis de direitos autorais e propriedade industrial.

**Proibido:** Copiar, reproduzir, distribuir, modificar ou criar obras derivadas sem autorização prévia por escrito.

**Uso permitido:** Visualização pessoal, não comercial. Compartilhamento em redes sociais com créditos.`,
  },
  {
    id: "conduta-usuario",
    title: "9. Conduta do Usuário",
    content: `Você concorda em **não**:
- Usar o Site para fins ilegais ou não autorizados
- Interferir na segurança ou integridade do Site
- Coletar dados de outros usuários sem consentimento
- Enviar spam, vírus ou código malicioso
- Tentar acessar áreas restritas
- Fazer engenharia reversa do Site
- Usar bots ou scrapers sem permissão`,
  },
  {
    id: "isencao-responsabilidade",
    title: "10. Isenção de Responsabilidade",
    content: `O Site é fornecido "como está" e "conforme disponível". Não garantimos:
- Funcionamento ininterrupto ou livre de erros
- Correção de todos os defeitos
- Ausência de vírus ou componentes prejudiciais
- Precisão, integridade ou atualidade do Conteúdo

**Limitação:** Nossa responsabilidade total não excederá o valor pago pelo Cliente no pedido relacionado. Não nos responsabilizamos por danos indiretos, incidentais, consequenciais ou lucros cessantes.`,
  },
  {
    id: "indenizacao",
    title: "11. Indenização",
    content: `Você concorda em indenizar e isentar a Laís Inc, seus diretores, funcionários e parceiros de quaisquer reivindicações, perdas, danos, custos (incluindo honorários advocatícios) decorrentes de:
- Seu uso do Site
- Violação destes Termos
- Violação de direitos de terceiros
- Conteúdo que você enviar ou transmitir`,
  },
  {
    id: "alteracoes",
    title: "12. Alterações nos Termos",
    content: `Podemos modificar estes Termos a qualquer momento. A versão atualizada será publicada nesta página com data de "Última atualização". O uso contínuo do Site após alterações constitui aceitação.`,
  },
  {
    id: "lei-foro",
    title: "13. Lei Aplicável e Foro",
    content: `Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.`,
  },
  {
    id: "contato",
    title: "14. Contato",
    content: `Dúvidas sobre estes Termos?
**E-mail:** contato@laisinc.com
**Endereço:** São Paulo - SP, Brasil

Última atualização: ${new Date().toLocaleDateString("pt-BR")}`,
  },
];

export function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-cream via-branco to-cream py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-roxo-profundo mb-4">
              Termos de Uso
            </h1>
            <p className="text-cinza-amarronzado">
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8 lg:py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          {sections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              className="bg-branco rounded-2xl border border-cinza-quete p-6 lg:p-8"
            >
              <h2 className="font-serif text-xl lg:text-2xl font-bold text-roxo-profundo mb-4">
                {section.title}
              </h2>
              <div className="prose prose-cinza-amarronzado max-w-none text-cinza-amarronzado leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
