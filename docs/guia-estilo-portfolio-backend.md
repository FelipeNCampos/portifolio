# Guia de estilo — portfólio de engenharia backend

> Referência visual: [Mars Webdesigner — Projetos](https://marsdesigner.com.br/portifolio/projetos). Este documento extrai **somente a linguagem visual e a hierarquia de apresentação** observadas na página. Não reutilize nomes, textos, imagens, contagens ou cases da referência.

## 1. Direção criativa

Criar uma presença editorial, escura e precisa. O portfólio deve parecer uma superfície de trabalho bem organizada: pouca ornamentação, alta legibilidade e detalhes que valorizam a engenharia por trás dos projetos.

- **Tom:** técnico, seguro, direto e calmo — sem visual futurista genérico, excesso de gradientes ou decoração de código.
- **Princípio:** o espaço em branco (preto) dá importância aos dados, aos cases e às decisões técnicas.
- **Ritmo:** uma introdução ampla, seguida de filtros compactos, uma grade regular de projetos e um encerramento forte de contato.
- **Conteúdo:** todo texto final, métricas, nomes de tecnologias e imagens deve vir do perfil e dos projetos reais. Use placeholders enquanto os dados não estiverem definidos.

## 2. Sistema visual

### Paleta

| Papel | Valor sugerido | Uso |
| --- | --- | --- |
| Fundo | `#000000` | Página inteira e área de respiro |
| Texto principal | `#FFFFFF` | Títulos, navegação e títulos de cards |
| Texto secundário | `rgba(255,255,255,.55)` | Metadados, introduções e informações auxiliares |
| Linha sutil | `rgba(255,255,255,.14)` | Divisórias e estados neutros |
| Superfície de mídia | `#0B0B0B` | Área visual dos cards |
| Seleção | `#FFFFFF` com texto `#000000` | Filtro ou botão ativo |

Evite uma cor de destaque permanente. Se houver cor, ela deve existir dentro da mídia ou de um estado contextual do projeto, nunca competir com a estrutura em preto e branco.

### Tipografia

- Usar uma grotesca contemporânea e levemente expressiva, como `Bricolage Grotesque`, com fallback `system-ui, sans-serif`.
- Títulos: peso `600`, tracking negativo entre `-0.03em` e `-0.05em`, linhas compactas.
- Metadados (`eyebrow`): caixa alta, peso `500–600`, `0.11em–0.14em` de espaçamento e texto em baixa opacidade.
- Corpo: tamanho confortável, entre `1rem` e `1.1rem`, com entrelinha `1.45–1.6`.

### Escala e espaços

```css
:root {
  --bg: #000;
  --fg: #fff;
  --mute: rgba(255, 255, 255, .55);
  --line: rgba(255, 255, 255, .14);
  --font: "Bricolage Grotesque", system-ui, sans-serif;
  --gutter: clamp(20px, 4vw, 64px);
  --maxw: 1240px;
  --ease: cubic-bezier(.2, .8, .2, 1);
}
```

O conteúdo deve respeitar uma largura máxima de aproximadamente `1240px` e margens laterais fluidas. Prefira espaçamentos generosos entre blocos (`72–120px`) e compactos dentro dos componentes (`12–22px`).

## 3. Estrutura da página

### Cabeçalho

- Altura enxuta, próxima de `76px` no desktop.
- Grade em três zonas: navegação à esquerda, marca/sigla central, navegação/ação à direita.
- Sem fundo, sem sombra e sem bordas.
- Links em texto simples; o item ativo pode ter pequena mudança de opacidade ou sublinhado discreto.
- No mobile, esconder os links e manter marca + botão de menu acessível.

### Abertura (hero)

- O hero não precisa de ilustração dominante: ele é principalmente tipográfico.
- Reservar bastante altura vertical e posicionar o conteúdo no terço inferior da área.
- Ordem: rótulo pequeno → título grande de uma ou duas linhas → texto de contexto com largura limitada.
- O título deve apresentar a especialidade backend sem explicar tudo. A explicação fica no parágrafo de apoio.
- Não usar botões chamativos no hero se a navegação e o rodapé já oferecem contato; caso haja CTA, usar apenas um link com seta discreta.

### Filtros de projetos

- Implementar como pills de borda totalmente arredondada (`999px`) que quebram de linha naturalmente.
- Estado ativo: fundo branco e texto preto.
- Estado inativo: fundo transparente, borda branca e texto branco.
- Incluir uma contagem visual pequena apenas se ela for derivada de dados reais.
- Taxonomia recomendada para backend: `Todos`, `APIs`, `Autenticação`, `Integrações`, `Dados`, `Automação`, `Cloud/DevOps` e `Open source`. Ajustar às categorias que realmente existirem.

### Grade de projetos

- Desktop: duas colunas iguais, espaçamento horizontal próximo de `20px` e vertical de `44–48px`.
- Cada card é integralmente clicável e tem duas partes: mídia acima e metadados abaixo.
- A mídia tem proporção aproximada de `4:3`, fundo muito escuro, `border-radius: 12px` e recorte (`overflow: hidden`).
- Os metadados ficam em uma única linha quando possível: índice/indicador à esquerda, título no centro visual e categoria/stack à direita ou abaixo conforme a largura.
- Não adicionar blocos longos, listas de tarefas ou muitos badges no card. A página de detalhes contém profundidade; a grade serve para descoberta.

Para projetos backend, a mídia deve mostrar sinais de sistema, não dashboards decorativos: um diagrama arquitetural simplificado, uma composição de endpoints, um trecho de domínio, uma linha do tempo de eventos ou uma visualização abstrata de fluxo. Nunca exponha segredos, dados de clientes ou URLs privadas.

### Página de detalhe de case

Manter a mesma linguagem, porém com uma leitura linear:

1. Rótulo de categoria e status público do projeto.
2. Título e uma frase de escopo.
3. Mídia principal do sistema.
4. Blocos curtos: problema, decisões, arquitetura, resultado e tecnologias.
5. Quando útil, diagrama estático simples (cliente → API → serviços → dados) e links seguros para repositório ou demonstração.

O objetivo é tornar escolhas de backend compreensíveis sem simular uma documentação completa.

### Rodapé/contato

- Fazer do rodapé uma grande faixa final de conversão, ainda no fundo preto.
- Usar um rótulo discreto, uma pergunta ou convite grande e uma frase de apoio curta.
- Ação principal em pill branca; contatos secundários como links textuais.
- Fechar com uma faixa mais baixa contendo marca, navegação reduzida, direitos e “voltar ao topo”.

## 4. Componentes e comportamento

| Elemento | Especificação |
| --- | --- |
| Card de projeto | Elevar somente por mudança de escala mínima da mídia (`1.01–1.03`) e aumento de contraste; sem sombra. |
| Imagem de projeto | Escurecer levemente no repouso para a tipografia do card se manter soberana; respeitar `prefers-reduced-motion`. |
| Chips | `padding: 10px 18px`, altura próxima de `46px`, transição de `150–220ms`. |
| Links | Animação curta de opacidade ou deslocamento de seta de `2–4px`; manter foco visível. |
| Revelação ao rolar | Uma única entrada suave por bloco (`opacity` + deslocamento vertical curto). Não atrasar o conteúdo crítico. |
| Separadores | Linhas de baixa opacidade, usadas apenas para organizar o rodapé, tabelas ou blocos de detalhe. |

## 5. Responsividade

| Faixa | Decisão |
| --- | --- |
| Desktop (`≥ 900px`) | Navegação completa, grade com 2 colunas e hero amplo. |
| Tablet (`600–899px`) | Preservar 2 colunas se houver espaço; reduzir gutter e tamanhos do hero. |
| Mobile (`< 600px`) | Navegação recolhida, gutter de `20px`, grade de 1 coluna e chips em múltiplas linhas. |

No mobile, manter o título em aproximadamente `34px`, permitir que os filtros quebrem naturalmente e manter a proporção de mídia dos cards. O conteúdo não deve exigir hover para ser compreendido.

## 6. Acessibilidade e qualidade

- Estruturar com `header`, `nav`, `main`, `section`, `article` e `footer`.
- Usar um único `h1`; títulos de seção e de case devem seguir a ordem semântica.
- Filtros precisam ser botões com `aria-pressed`; a filtragem deve funcionar por teclado.
- Todo card clicável precisa de nome acessível que inclua título e categoria, sem depender da imagem.
- Garantir foco contrastante e não remover `outline` sem fornecer alternativa equivalente.
- As imagens devem ter texto alternativo útil; imagens puramente decorativas devem ser ignoradas pelo leitor de tela.
- Verificar contraste de texto secundário em cada contexto e respeitar `prefers-reduced-motion`.

## 7. Critérios de aceite visuais

- Fundo preto contínuo, sem caixas claras que interrompam o ritmo.
- Hero tipográfico com respiro; sem ilustração competindo com o título.
- Grade de projetos clara, escaneável e totalmente navegável.
- Filtros com estado ativo imediatamente reconhecível.
- Mídias de cases backend representam arquitetura e fluxos, não usam imagens genéricas de código.
- Animações são quase imperceptíveis, rápidas e opcionais para quem reduz movimento.
- Layout permanece legível em `390px`, em tablet e em desktop amplo.

## 8. Limites de referência

Inspirar-se na composição, nos contrastes, na tipografia, no espaçamento e nos padrões de interação da página analisada. Não copiar sua marca, nomenclaturas, descrições, imagens, URLs internas, contagens, cases ou qualquer outro conteúdo editorial.
