# Dev Radar

## Documento 1: Descrição geral do sistema

**Data:** 18/02  
**Autor:** João Marcelo Simão de Castro - SC3029778

---

## 📌 Sobre o projeto

O **Dev Radar** é uma aplicação para buscar desenvolvedores por stack baseado na localização atual do usuário. O propósito é simples: o usuário busca por uma tecnologia e a aplicação irá informar outros devs num raio de **10KM** que trabalham com a respectiva tecnologia.

A aplicação possui duas partes principais: a aplicação **web** e o **app mobile**, os quais serão descritos a seguir.

---

## 🔗 Interação com outros sistemas

O **Dev Radar** é um sistema **independente e totalmente autocontido**, não necessitando de integrações externas para seu funcionamento principal. No entanto, ele utiliza a **API do GitHub** para obter informações sobre os desenvolvedores, como nome, biografia e tecnologias utilizadas.

---

## 🚀 Principais funcionalidades

- Cadastro de desenvolvedores com informações extraídas do GitHub.
- Busca de desenvolvedores por tecnologia dentro de um raio de **10KM**.
- Exibição de desenvolvedores em um **mapa interativo**.
- Acesso rápido ao **perfil do GitHub** de cada desenvolvedor encontrado.

---

## 👥 Atores e interação com o sistema

- **Usuário Desenvolvedor:** Cadastra-se no sistema e fornece sua localização para ser encontrado por outros desenvolvedores.
- **Usuário Buscador:** Pesquisa por desenvolvedores de uma determinada tecnologia em uma região específica.

---

## 🌍 Aplicação Web

A aplicação web tem como função ser a **interface de cadastro** dos usuários. A interface é simples e possui:

- 📌 **Formulário de cadastro** (à esquerda).
- 📌 **Lista de usuários cadastrados** (à direita).

### 📊 Dashboard

Ao acessar a página, será solicitada a permissão para acessar a localização do usuário.  
Caso seja concedida, automaticamente os dados de **latitude e longitude** do usuário serão inseridos no formulário.

A seguir, temos uma demonstração da página web em funcionamento, onde realizamos o cadastro de um novo desenvolvedor.

---

## 📱 Aplicativo Mobile

O objetivo do **app mobile** é permitir a **busca de desenvolvedores** por tecnologia desejada.  
Ao acessar o aplicativo, o usuário visualizará uma tela com:

- Um **campo** para inserir a tecnologia que deseja buscar.
- Um **mapa interativo** onde os **pins dos desenvolvedores** serão inseridos, revelando suas respectivas localizações.

### 🔎 Busca de Tecnologia

Ao clicar na **marcação** de um desenvolvedor, uma breve descrição dele será exibida, contendo:

- **Nome**
- **Bio do GitHub**
- **Tecnologias utilizadas**

### 🔗 Perfil do Desenvolvedor

Ao clicar na **biografia do desenvolvedor**, o usuário será direcionado para o **perfil dele no GitHub**, onde poderá:

- Segui-lo,
- Ver seus projetos,
- Explorar outras informações a respeito dele.
