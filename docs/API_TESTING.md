# API testing

The API runs at `http://localhost:3000`. Replace `$apiKey` with the private key returned while creating a tenant.

## Create a tenant

```powershell
$tenant = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/tenants -ContentType "application/json" -Body '{"name":"Acme Support"}'
$apiKey = $tenant.apiKey
$tenant
```

## List tenants

```powershell
Invoke-RestMethod http://localhost:3000/api/tenants
```

## Upload a document

```powershell
curl.exe -X POST http://localhost:3000/api/documents -H "Authorization: Bearer $apiKey" -F "file=@C:\path\to\document.txt"
```

Supported files: PDF, DOCX, TXT, and Markdown. The maximum size is 20 MB.

## Check document status

```powershell
curl.exe http://localhost:3000/api/documents -H "Authorization: Bearer $apiKey"
```

Wait until the document status is `ready` before asking questions.

## Search source chunks

```powershell
curl.exe -X POST http://localhost:3000/api/search -H "Authorization: Bearer $apiKey" -H "Content-Type: application/json" -d '{"query":"What is the refund policy?","limit":6}'
```

## Ask the knowledge base

```powershell
curl.exe -X POST http://localhost:3000/api/chat -H "Authorization: Bearer $apiKey" -H "Content-Type: application/json" -d '{"question":"Summarize the refund policy."}'
```

The response contains `answer` plus a `sources` array with the document title, retrieval score, and excerpt used to ground the answer.
