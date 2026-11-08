---
title: "Rascunho sobre o Pix"
description: "Rascunho sobre o Pix: o que acontece entre tocar em enviar e o dinheiro chegar — PSPs, DICT e SPI em uma primeira passada."
date: 2026-11-07
lang: pt-br
slug: pix
log: "LOG.001"
class: NOTE
tags: [PIX, PAYMENTS]
---

Eu confesso que nunca havia parado para pensar sobre como exatamente o Pix funcionava, até começar minha jornada em uma (infra)fintech e me deparar com termos como `DICT`, `PSP`, `SPI`, etc.

A verdade é que muitas das tecnologias que utilizamos diariamente, por baixo dos panos, atuam de maneiras que nem imaginamos. Um dos casos mais interessantes nos quais venho me aprofundando atualmente é o Pix.

## O que é o Pix, afinal?

Segundo o próprio BC, o Pix é um sistema de pagamento instantâneo criado pelo Banco Central, que permite transferir dinheiro entre contas em segundos, a qualquer hora e dia, podendo ser utilizado a partir de contas correntes, poupança ou pré-pagas.

Mas, como você pode imaginar, as coisas não são tão simples. Como, apenas informando um e-mail ou CPF, eu consigo encaminhar um valor financeiro para outro usuário?

## Os participantes: PSPs

Quando você inicia uma transação Pix pelo seu app, quem a processa é o seu **PSP** (Prestador de Serviços de Pagamento), que pode ser um banco, uma cooperativa de crédito etc. Os PSPs podem participar do Pix de duas formas: como participantes diretos, que mantêm conta própria no Banco Central, ou como indiretos, que liquidam por meio de um participante direto.

## O fluxo de um pagamento por chave

Em um pagamento feito por meio de chaves (e-mail, CPF, telefone ou chave aleatória), o PSP pagador primeiro consulta o **DICT**, um diretório que funciona como uma base de dados onde ficam armazenadas as chaves e as informações cadastrais dos recebedores. É a partir dele que o PSP recupera os dados da conta de destino.

Com os dados do destino em mãos, o PSP pagador reserva o valor na conta do cliente e envia a ordem de pagamento ao **SPI**, a infraestrutura centralizada do BC que liquida as transações em tempo real. A partir daí:

- O SPI recebe a ordem, valida e a encaminha ao PSP recebedor para aprovação ou rejeição da operação.
- Se a operação for aceita, o SPI liquida em tempo real, debitando a conta do PSP pagador e creditando a do PSP recebedor, ambas mantidas no BC.
- O SPI notifica ambos os PSPs sobre o resultado, e cada um atualiza o saldo do seu próprio cliente.

## E se a chave não existir no DICT?

Simples: o DICT responde com um erro de chave não encontrada, o PSP pagador informa isso ao usuário, e o fluxo é interrompido ali mesmo, antes de qualquer centavo se mover. Essa é uma decisão interessante, pois evita um alto volume de transações órfãs trafegando pelo SPI. Além disso, as consultas ao DICT têm limites de taxa, justamente para dificultar a enumeração de chaves por agentes maliciosos.
