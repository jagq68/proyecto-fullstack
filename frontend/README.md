# 🚀 Simulação Loja Voke Brasil - Fullstack E-Commerce
**Desenvolvido por:** Alberto Guatume  
**Turma:** 58 Toti - Diversidade  
**Tecnologias:** React (Frontend), Node.js + Express (Backend), PostgreSQL (Banco de Dados), CSS Puro Tradicional (Sem utilitários).

---

## 📋 Resumo das Implementações e Correções (Passo a Passo)

Nesta jornada de desenvolvimento e auditoria técnica, reestruturamos o ecossistema do projeto para cumprir rigorosamente os padrões acadêmicos e corporativos exigidos pelos professores e pela equipe da Voke:

### 1. 🎨 Frontend: Migração Total para CSS Puro Tradicional
* **Erradicação do Tailwind e Estilos Inline:** Removemos completamente todas as classes utilitárias e os atributos `style={{...}}` de dentro dos arquivos `.jsx` para seguir as boas práticas de desenvolvimento ensinadas em aula.
* **Centralização no `src/index.css`:** Todo o design visual foi isolado no arquivo de estilos geral.
* **Interface Fluida e Responsiva:** Alinhamos a vitrina de produtos para se organizar horizontalmente em formato de cartões (tarjetas) simétricos e independentes.

### 🏛️ 2. Componentes e Telas Refatoradas
* **Navbar Dinâmico (`Navbar.jsx`):** 
  * O logotipo da **Voke** foi corrigido para não exibir pontos.
  * O carrossel superior preto agora é **100% dinâmico**, alternando mensagens institucionais automaticamente ou por cliques nas setas `<` e `>`, ajustando-se perfeitamente ao tamanho do texto.
  * A barra de buscas foi modificada para o formato de pílula (arredondada) e integrada a um formulário funcional conectado à API.
  * Links do menu fucsia (Apple, Samsung, Lenovo, Dell) configurados para filtrar a vitrina imediatamente por clique.
* **Vitrina Inteligente (`Catalogo.jsx`):** Implementamos um filtro universal no hook `useEffect` que escuta a URL em tempo real. Agora, ao buscar por termos como "laptop" ou clicar em uma marca, a tela se atualiza instantaneamente com os dados do PostgreSQL.
* **Notificação Premium (Toast):** Substituímos os alertas toscos do navegador por um balão flutuante elegante na cor preta e fucsia que surge no topo direito e desaparece de forma ágil após **2.5 segundos**.
* **Carrinho de Compras Transacional (`Carrito.jsx`):** Remoção de estilos inline, adição de seletores numéricos reativos e alertas de confirmação amigáveis.

### ⚙️ 3. Backend: Ajuste Transacional de Quantidades e Estoque
* **Correção no Controlador (`carritoController.js`):** Removemos a validação rígida `cantidad <= 0` que bloqueava o botão de menos (`-`).
* **Sintaxe Segura de PostgreSQL:** Corrigimos o acesso ao array de linhas substituindo formatos truncados pelo método seguro `.rows.at(0).id` para evitar erros de leitura de dados (`undefined`).
* **Regra de Negócio Absoluta:** Ajustamos a rota `POST /api/carrinhos` para que, se a quantidade de um item chegar a zero (`0`) ao ser decrementada, a linha seja eliminada fisicamente (`DELETE`) do banco relacional, disparando o retorno automático das unidades para a tabela de estoque (`produtos`).

---

## 🐙 Guia de Comandos Git - Máquina do Tempo do Código

Para gerenciar, respaldar ou reverter alterações no repositório de forma segura através do **Git Bash**, utilize os seguintes comandos:

### 📤 Respaldo Massivo e Envio para o GitHub
```bash
# 1. Adicionar todas as modificações do frontend e backend
git add .

# 2. Criar o ponto de salvamento com uma mensagem descritiva
git commit -m "Respaldo unificado: Migrado catálogo e componentes para CSS Puro, corrigido decremento de carrinho e busca funcional"

# 3. Subir os arquivos para o repositório remoto
git push origin main
```

### 🕒 Recuperar Versões Anteriores de um Arquivo
Se uma modificação quebrar o código e você precisar que **apenas um arquivo** específico retorne ao passado sem afetar o resto do projeto:

```bash
# 1. Listar o histórico de commits recentes e copiar os 7 caracteres amarelos (ID) do commit desejado
git log --oneline

# 2. Forçar o arquivo a voltar exatamente ao estado desse commit específico
git checkout <ID_DO_COMMIT> -- src/pages/Catalogo.jsx
```

### ↩️ Desfazer o Último Commit (Borrão e Conta Nova)
Se você fez um commit por engano e quer voltar atrás mantendo os arquivos salvos no VS Code para continuar editando:
```bash
git reset --soft HEAD~1
```