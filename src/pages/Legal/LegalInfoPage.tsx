import { Cookie, Mail, ShieldCheck } from "lucide-react";

type Section = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalInfoPageProps = {
  title: string;
  description: string;
  icon: typeof Cookie;
  sections: Section[];
};

function LegalInfoPage({ title, description, icon: Icon, sections }: LegalInfoPageProps) {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-cream via-branco to-cream py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Icon className="w-10 h-10 mx-auto mb-4 text-rosa-lais" aria-hidden="true" />
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-roxo-profundo mb-4">{title}</h1>
            <p className="text-cinza-amarronzado">{description}</p>
            <p className="text-sm text-cinza-amarronzado mt-4">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </section>

      <section className="container py-8 lg:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {sections.map((section) => (
            <article key={section.title} className="bg-branco rounded-2xl border border-cinza-quente p-6 lg:p-8">
              <h2 className="font-serif text-xl lg:text-2xl font-bold text-roxo-profundo mb-4">{section.title}</h2>
              <div className="space-y-3 text-cinza-amarronzado leading-relaxed">
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.items && (
                  <ul className="list-disc pl-5 space-y-2">
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </div>
            </article>
          ))}
          <p className="flex items-center justify-center gap-2 text-sm text-cinza-amarronzado pt-2">
            <Mail className="w-4 h-4 text-rosa-lais" aria-hidden="true" />
            Dúvidas? Fale com a gente pelo e-mail contatolais.inc@gmail.com.
          </p>
        </div>
      </section>
    </div>
  );
}

export function CookiesPage() {
  return (
    <LegalInfoPage
      title="Política de Cookies"
      description="Entenda como os cookies ajudam a Laís Inc Store a funcionar melhor e como você pode gerenciar suas preferências."
      icon={Cookie}
      sections={[
        { title: "O que são cookies?", paragraphs: ["Cookies são pequenos arquivos armazenados no seu navegador. Eles permitem manter o carrinho, lembrar preferências e entender como o site é utilizado."] },
        { title: "Como usamos cookies", items: ["Essenciais: necessários para navegação, carrinho, login e segurança.", "Preferências: lembram configurações escolhidas por você.", "Medição: ajudam a entender o desempenho e melhorar o site, quando essa ferramenta estiver ativa.", "Marketing: somente com consentimento, para comunicações mais relevantes."] },
        { title: "Suas escolhas", paragraphs: ["Você pode bloquear ou excluir cookies nas configurações do navegador. A desativação dos cookies essenciais pode afetar o funcionamento de recursos como o carrinho e o login."] }
      ]}
    />
  );
}

export function LgpdPage() {
  return (
    <LegalInfoPage
      title="LGPD e Segurança"
      description="Saiba como tratamos seus dados pessoais e quais cuidados adotamos para proteger sua experiência na loja."
      icon={ShieldCheck}
      sections={[
        { title: "Por que usamos seus dados", paragraphs: ["Usamos os dados necessários para criar e entregar pedidos, processar pagamentos, prestar atendimento, cumprir obrigações legais e manter o site seguro. Não vendemos dados pessoais."] },
        { title: "Seus direitos", items: ["Confirmar se tratamos seus dados e solicitar acesso a eles.", "Corrigir dados incompletos, inexatos ou desatualizados.", "Solicitar anonimização, bloqueio ou eliminação quando aplicável.", "Revogar consentimentos e receber informações sobre compartilhamentos.", "Solicitar portabilidade, observadas as regras da LGPD."] },
        { title: "Como protegemos suas informações", paragraphs: ["Adotamos medidas técnicas e administrativas proporcionais ao uso do site, como comunicação protegida por HTTPS, acesso restrito, uso de parceiros de pagamento especializados e monitoramento de atividades suspeitas. Nenhum serviço na internet é totalmente livre de riscos, por isso revisamos continuamente nossos controles."] },
        { title: "Compartilhamento e retenção", paragraphs: ["Quando necessário, compartilhamos somente o mínimo com parceiros que ajudam na operação, como pagamento, hospedagem e entrega. Mantemos as informações pelo período necessário às finalidades informadas e às obrigações legais."] },
        { title: "Responsável e solicitações", paragraphs: ["Para exercer seus direitos ou comunicar uma preocupação de segurança, escreva para contatolais.inc@gmail.com. Avaliaremos a solicitação e poderemos pedir informações para confirmar sua identidade."] }
      ]}
    />
  );
}
