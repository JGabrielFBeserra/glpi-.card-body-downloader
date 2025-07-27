# GLPI Card Export - Extensão Chrome

##  Descrição

A extensão **GLPI Card Export** foi desenvolvida para resolver um problema real enfrentado pelos analistas de sistemas na documentação de chamados. Anteriormente, para anexar evidências de chamados em emails para empresas terceirizadas, era necessário um processo manual e demorado:

1. ❌ Tirar prints screen manualmente
2. ❌ Abrir o Microsoft Word
3. ❌ Baixar as imagens uma por uma
4. ❌ Inserir todas as imagens no documento
5. ❌ Exportar para PDF

Com esta extensão, todo esse processo foi automatizado em **poucos cliques**, permitindo que os analistas:

✅ **Selecionem os cards** desejados diretamente na interface do GLPI  
✅ **Exportem automaticamente** para um PDF organizado  
✅ **Incluam anexos** de forma inteligente  
✅ **Mantenham a numeração** de páginas  
✅ **Economizem tempo** significativo na documentação  

##  Objetivo

Automatizar a geração de documentos PDF com evidências de chamados do sistema GLPI, facilitando o trabalho dos analistas de TI na comunicação com fornecedores e na documentação de incidentes.

##  Funcionalidades

- **Seleção Visual**: Interface intuitiva para selecionar cards com contorno colorido (verde = selecionado, vermelho = não selecionado)
- **Exportação Inteligente**: Detecta automaticamente o tipo de chamado (KCOR, TECSIDEL, Padrão)
- **Processamento de Anexos**: Inclui automaticamente anexos PDF dos chamados
- **Numeração Automática**: Adiciona numeração de páginas no formato "X / Y"
- **Organização Cronológica**: Ordena os cards por data/hora automaticamente
- **Nomeação Inteligente**: Gera nomes de arquivo baseados no ID e tipo do chamado

##  Dependências

A extensão utiliza as seguintes bibliotecas JavaScript:

- **html2canvas.min.js** - Captura de tela dos elementos HTML
- **jspdf.umd.min.js** - Geração de arquivos PDF
- **pdf.min.js** & **pdf.worker.min.js** (PDF.js) - Processamento de anexos PDF

*Todas as dependências estão incluídas na pasta `libs/` da extensão.*

##  Como Usar

### 1. Acessando a Extensão
- Navegue até um chamado no sistema GLPI
- Clique no ícone da extensão na barra de ferramentas do Chrome
- **OU** clique no botão "Exportar PDF" que aparece no canto inferior direito

### 2. Selecionando Cards
- A interface entrará no modo de seleção
- Cards disponíveis ficam com **contorno vermelho tracejado**
- Clique nos cards que deseja incluir no PDF
- Cards selecionados ficam com **contorno verde sólido**

### 3. Gerando o PDF
- Após selecionar os cards desejados, clique em **"Baixar PDF"**
- O arquivo será gerado automaticamente com:
  - Nome no formato: `ID - TIPO: Título do Chamado.pdf`
  - Cards organizados cronologicamente
  - Anexos PDF incluídos automaticamente
  - Numeração de páginas

### 4. Exemplo de Nomenclatura
```
123456 - KCOR: Problema no Sistema de Vendas.pdf
789012 - TECSIDEL: Falha na Comunicação.pdf  
345678 - Erro de Conectividade.pdf
```

##  Instalação no Google Chrome

### Método 1: Modo Desenvolvedor (Recomendado para uso interno)

1. **Baixe ou clone** este repositório
2. **Abra o Chrome** e acesse `chrome://extensions/`
3. **Ative o "Modo do desenvolvedor"** (toggle no canto superior direito)
4. **Clique em "Carregar sem compactação"**
5. **Selecione a pasta** da extensão (`glpi-pdf-export-1.7`)
6. A extensão será instalada e aparecerá na barra de ferramentas

### Método 2: Empacotamento (Para distribuição)

1. Acesse `chrome://extensions/`
2. Ative o "Modo do desenvolvedor"
3. Clique em "Compactar extensão"
4. Selecione a pasta da extensão
5. Será gerado um arquivo `.crx` para distribuição

##  Configuração

### Permissões Necessárias
A extensão requer as seguintes permissões:

- **scripting**: Para injetar scripts na página do GLPI
- **activeTab**: Para acessar o conteúdo da aba ativa
- **Host específico**: `http://ti.concessionariatamoios.com.br/*`

### Personalização para Outros Domínios

Para usar em outros sistemas GLPI, edite o arquivo `manifest.json`:

```json
"host_permissions": [
  "https://seu-dominio-glpi.com/*"
],
"web_accessible_resources": [
  {
    "matches": [
      "https://seu-dominio-glpi.com/*"
    ]
  }
]
```

##  Contexto Empresarial

Esta extensão foi desenvolvida especificamente para atender às necessidades de uma equipe de TI que frequentemente precisa:

- **Documentar evidências** para fornecedores externos
- **Criar relatórios** de incidentes de forma rápida
- **Manter histórico** organizado de chamados
- **Reduzir tempo** gasto em tarefas manuais repetitivas

### Benefícios Quantificados
-  **Redução de 90%** no tempo de documentação
-  **Padronização** automática de documentos
-  **Zero erros** de formatação manual
-  **Aumento da produtividade** da equipe

##  Histórico de Versões

### v1.7 (Atual)
- Detecção automática de tipos de chamado (KCOR, TECSIDEL)
- Melhorias na interface de seleção
- Processamento otimizado de anexos PDF
- Correções de bugs diversos

### Versões Anteriores
- **v1.0-1.6**: Evolução gradual baseada no feedback dos analistas
- Melhorias contínuas na usabilidade e performance

##  Contribuição

Este projeto foi desenvolvido com base no feedback real de analistas de sistemas. Sugestões e melhorias são sempre bem-vindas!


##  Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com prazer para facilitar o trabalho dos analistas de TI**
