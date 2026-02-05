# Webhook Debug

Um Cloudflare Worker simples para debugar webhooks e requisições HTTP.

## O que faz?

Retorna um JSON detalhado com todas as informações da requisição recebida:

- **Request info**: método, URL, pathname, host, protocolo
- **Query params**: parâmetros da URL
- **Headers**: todos os headers da requisição
- **Cloudflare**: propriedades do CF (geolocalização, ASN, etc.)
- **Body**: suporte para JSON, form-data, urlencoded e texto

## Deploy

```bash
npx wrangler deploy
```

## Uso

Envie qualquer requisição HTTP para o worker e receba um JSON com os detalhes:

```bash
curl https://seu-worker.workers.dev?teste=123

curl -X POST https://seu-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"hello": "world"}'
```

## Exemplo de resposta

```json
{
  "request": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "method": "POST",
    "url": "https://...",
    "pathname": "/"
  },
  "headers": { ... },
  "body": {
    "type": "json",
    "json": { "hello": "world" }
  }
}
```
