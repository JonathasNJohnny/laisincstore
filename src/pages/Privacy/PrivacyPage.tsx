const sections = [
  {
    id: "introducao",
    title: "1. Introdução",
    content: `A Laís Inc Store ("nós", "nosso", "nossa") valoriza sua privacidade e está comprometida em proteger seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos suas informações quando você visita nosso site ou faz compras em nossa loja virtual.`,
  },
  {
    id: "dados-coletados",
    title: "2. Dados que Coletamos",
    content: `Coletamos os seguintes tipos de dados:

**Dados fornecidos por você:**
- Nome completo
- Endereço de e-mail
- Telefone/WhatsApp
- CPF/CNPJ (para emissão de nota fiscal)
- Endereço de entrega e cobrança
- Informações de pagamento (processadas por parceiros seguros)

**Dados coletados automaticamente:**
- Endereço IP
- Tipo de navegador e dispositivo
- Páginas visitadas e tempo de navegação
- Cookies e tecnologias similares
- Localização aproximada (baseada em IP)`,
  },
  {
    id: "uso-dados",
    title: "3. Como Usamos Seus Dados",
    content: `Utilizamos seus dados para:
- Processar e entregar seus pedidos
- Enviar confirmações e atualizações de status
- Processar pagamentos com segurança
- Melhorar sua experiência de navegação
- Enviar comunicações de marketing (com seu consentimento)
- Cumprir obrigações legais e fiscais
- Prevenir fraudes e garantir segurança`,
  },
  {
    id: "compartilhamento",
    title: "4. Compartilhamento de Dados",
    content: `Não vendemos seus dados pessoais. Podemos compartilhar com:
- **Transportadoras:** Para entrega dos pedidos
- **Gateways de pagamento:** Para processamento seguro (Mercado Pago, etc.)
- **Serviços de e-mail:** Para comunicações transacionais e marketing
- **Autoridades legais:** Quando exigido por lei
- **Prestadores de serviço:** Que nos ajudam a operar a loja (hospedagem, analytics)`,
  },
  {
    id: "cookies",
    title: "5. Cookies e Tecnologias Similares",
    content: `Utilizamos cookies para:
- **Essenciais:** Funcionamento do site, carrinho, login
- **Analytics:** Entender como você usa o site (Google Analytics)
- **Marketing:** Mostrar anúncios relevantes (com consentimento)
- **Preferências:** Lembrar suas configurações

Você pode gerenciar cookies nas configurações do seu navegador.`,
  },
  {
    id: "direitos",
    title: "6. Seus Direitos (LGPD)",
    content: `Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
- Confirmar a existência de tratamento
- Acessar seus dados
- Corrigir dados incompletos ou desatualizados
- Solicitar anonimização, bloqueio ou eliminação
- Solicitar portabilidade dos dados
- Solicitar eliminação de dados tratados com consentimento
- Obter informações sobre compartilhamento
- Revogar consentimento
- Opor-se a tratamento irregular

Para exercer seus direitos, entre em contato: contatolais.inc@gmail.com`,
  },
  {
    id: "seguranca",
    title: "7. Segurança dos Dados",
    content: `Implementamos medidas técnicas e organizacionais para proteger seus dados:
- Criptografia SSL/TLS em todas as comunicações
- Acesso restrito a dados sensíveis
- Monitoramento de acessos suspeitos
- Backups regulares e seguros
- Treinamento da equipe em proteção de dados`,
  },
  {
    id: "retencao",
    title: "8. Retenção de Dados",
    content: `Mantemos seus dados enquanto:
- Necessários para cumprir a finalidade da coleta
- Obrigatórios por lei (ex: notas fiscais por 5 anos)
- Você não solicitar exclusão (exceto quando a lei exigir retenção)

Dados de marketing são mantidos até você cancelar a inscrição.`,
  },
  {
    id: "alteracoes",
    title: "9. Alterações nesta Política",
    content: `Podemos atualizar esta política periodicamente. A versão mais recente estará sempre disponível neste endereço. Alterações significativas serão comunicadas por e-mail ou aviso no site.`,
  },
  {
    id: "contato",
    title: "10. Contato",
    content: `Dúvidas sobre esta política ou seus dados?
**Encarregado de Dados (DPO):** Laís Silva
**E-mail:** contatolais.inc@gmail.com
**Endereço:** Goianira - GO, Brasil

Última atualização: ${new Date().toLocaleDateString("pt-BR")}`,
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-cream via-branco to-cream py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-roxo-profundo mb-4">
              Política de Privacidade
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
              className="bg-branco rounded-2xl border border-cinza-quente p-6 lg:p-8"
            >
              <h2 className="font-serif text-xl lg:text-2xl font-bold text-roxo-profundo mb-4">
                {section.title}
              </h2>
              <div className="space-y-3 text-cinza-amarronzado dark:text-zinc-300 leading-relaxed">
                {section.content.split("\n").map((line, lineIdx) => {
                  if (!line.trim()) {
                    return <div key={lineIdx} className="h-1" />;
                  }

                  const parts = line.split(/(\*\*.*?\*\*)/g);

                  return (
                    <p key={lineIdx} className="text-base">
                      {parts.map((part, partIdx) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          const innerText = part.slice(2, -2);
                          return (
                            <strong
                              key={partIdx}
                              className="font-bold uppercase text-roxo-profundo dark:text-zinc-100"
                            >
                              {innerText.toUpperCase()}
                            </strong>
                          );
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
