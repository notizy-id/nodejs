# Notizy Node.js SDK

Node.js library for the Notizy API.

## Installation

```bash
npm install notizy
# or
pnpm add notizy
# or
yarn add notizy
```

## Setup

```javascript
import { Notizy } from "notizy";
const notizy = new Notizy("n_xxxxxx...xxxx"); // your api key
```

## Usage

```javascript
const { data } = await notizy.whatsapp.send({
  phone_number_id: "xxxxxxxx",
  to: "+1234567890",
  template_id: "xxxxxxxxx",
  language_code: "en",
  components: [
    {
      type: "body",
      parameters: [
        {
          type: "text",
          text: "John Doe",
        },
      ],
    },
  ],
});

console.log(`Message ${data.id} has been sent`);
```
