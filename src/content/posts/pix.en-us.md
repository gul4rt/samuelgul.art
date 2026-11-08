---
title: "A draft about Pix"
description: "A draft about Pix: what happens between tapping send and the money arriving — PSPs, DICT and SPI in a first pass."
date: 2026-11-07
lang: en-us
slug: pix
log: "LOG.001"
class: NOTE
tags: [PIX, PAYMENTS]
---

I confess I had never stopped to think about how exactly Pix works, until I started my journey at an (infrastructure)fintech and came across terms like `DICT`, `PSP`, `SPI`.

The truth is that many of the technologies we use daily, under the hood, operate in ways we can't even imagine. One of the most interesting cases I've been digging into lately is Pix.

## What is Pix, anyway?

According to the Central Bank itself, Pix is an instant payment system created by the Brazilian Central Bank (BC) that allows transferring money between accounts in seconds, at any time and day, usable from checking, savings or prepaid accounts.

But, as you can imagine, things aren't that simple. How, by merely providing an e-mail address or a CPF (a Brazilian tax ID), can I send money to another user?

## The participants: PSPs

When you start a Pix transaction from your banking app, it's your **PSP** (Payment Service Provider) that processes it — which can be a bank, a credit cooperative, and so on. PSPs can take part in Pix in two ways: as direct participants, which hold their own account at the Central Bank, or as indirect ones, which settle through a direct participant.

## The flow of a key-based payment

In a payment made via a key (e-mail, CPF, phone number or random key), the paying PSP first queries the **DICT**, a directory that works as a database where the receivers' keys and registration information are stored. It's from there that the PSP retrieves the destination account details.

With the destination details in hand, the paying PSP holds the amount in the client's account and sends the payment order to the **SPI**, the Central Bank's centralized infrastructure that settles transactions in real time. From there:

- The SPI receives the order, validates it and forwards it to the receiving PSP for approval or rejection.
- If the operation is accepted, the SPI settles it in real time, debiting the paying PSP's account and crediting the receiving PSP's, both held at the Central Bank.
- The SPI notifies both PSPs of the outcome, and each one updates its own client's balance.

## What if the key doesn't exist in the DICT?

Simple: the DICT replies with a key-not-found error, the paying PSP lets the user know, and the flow is interrupted right there, before a single cent moves. That's an interesting design decision, since it avoids a high volume of orphaned transactions flowing through the SPI. On top of that, DICT queries are rate-limited, precisely to make key enumeration by malicious agents harder.
