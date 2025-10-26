# MailerSend Hono Example

This small Hono app exposes a POST `/api/v1/mail/send` endpoint and forwards messages to MailerSend using the official `mailersend` SDK.

Environment variables

- `MAILERSEND_API_KEY` — your MailerSend API key (required).
- `DEFAULT_FROM_EMAIL` — default from address used when the request omits `from` (recommended).
- `DEFAULT_FROM_NAME` — default from name (optional).
- `PORT` — server port (optional, defaults to 3001 in examples).

Quick start (uses Bun as in `package.json`)

```bash
# copy example and edit values
cp .env.example .env
export $(cat .env | xargs)

# install dependencies
bun install

# start dev server (uses PORT from env if set)
bun run --hot src/index.ts
```

Example request (JSON):

{
"from": { "email": "you@domain.com", "name": "You" },
"to": [{ "email": "recipient@example.com", "name": "Recipient" }],
"subject": "Hello from MailerSend",
"html": "<p>Hi there</p>",
"text": "Hi there"
}

Notes

- The app reads `MAILERSEND_API_KEY` from the environment. Make sure it's set before starting the server.
- If a request doesn't include a `from` object, the server will use `DEFAULT_FROM_EMAIL` and `DEFAULT_FROM_NAME` from the environment.

Contact form payload

If you send data from a frontend contact form, use this shape (the server will construct a formatted message and send it to `CONTACT_RECEIVER_EMAIL`):

```json
{
  "subject": "Portfolio contact: Adhar Battulwar",
  "data": {
    "fullName": "Adhar Battulwar",
    "email": "adharbattulwar24@gmail.com",
    "mobile": "7894560237",
    "description": "adharbattulwar24@gmail.com"
  }
}
```

The endpoint will require `data.fullName` and `data.email` for contact submissions and will return the MailerSend API response on success.

Docker

Build the Docker image locally:

```bash
# build image (tag it `mailersend`)
docker build -t mailersend .
```

Run the container and pass environment variables (replace placeholders):

```bash
docker run -d \
	-e MAILERSEND_API_KEY="your_mailersend_api_key" \
	-e DEFAULT_FROM_EMAIL="you@yourdomain.com" \
	-e DEFAULT_FROM_NAME="Your Name" \
	-e PORT=3001 \
	-p 3001:3001 \
	--name mailersend-svc \
	mailersend
```

Verify the service is up:

```bash
curl http://localhost:3001/
```
