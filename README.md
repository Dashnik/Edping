# Telegram Mini App Boilerplate

A modern React + TypeScript boilerplate for building Telegram Mini Apps with the Telegram WebApp SDK.

## Features

- ⚛️ **React 18** with TypeScript
- ⚡ **Vite** for fast development and building
- 📱 **Telegram WebApp SDK** integration
- 🎨 **Theme support** (light/dark mode)
- 🔧 **TypeScript definitions** for Telegram WebApp API
- 📦 **Ready to deploy** structure

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Development

### Testing in Telegram

To test your Mini App in Telegram:

1. Create a bot using [@BotFather](https://t.me/botfather)
2. Use `/newapp` command to create a new Mini App
3. Set the web app URL to your development server (use ngrok or similar for local testing)
4. Open the bot and click the Mini App button

### Local Testing

For local development, you can use tools like:
- [ngrok](https://ngrok.com/) - Create a public tunnel to your local server
- [localtunnel](https://localtunnel.github.io/www/) - Alternative tunneling solution

Example with ngrok:
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Create tunnel
ngrok http 3000
# Use the HTTPS URL provided by ngrok in your bot settings
```

## Project Structure

```
├── src/
│   ├── App.tsx          # Main app component
│   ├── App.css          # App styles
│   ├── main.tsx         # Entry point
│   ├── index.css        # Global styles
│   └── types/
│       └── telegram.d.ts # Telegram WebApp TypeScript definitions
├── index.html           # HTML template with Telegram SDK script
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md           # This file
```

## Telegram WebApp SDK Features

The boilerplate includes examples of:

- ✅ User data access
- ✅ Theme parameters
- ✅ Main Button control
- ✅ Back Button control
- ✅ Haptic feedback
- ✅ Sending data to bot
- ✅ Viewport management
- ✅ Event listeners

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`

### Netlify

1. Push your code to GitHub
2. Import project in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Other Platforms

Any static hosting service that supports Node.js build processes will work. Just make sure to:
- Set the build command to `npm run build`
- Set the output directory to `dist`
- Use HTTPS (required by Telegram)

## Telegram WebApp API Reference

For complete API documentation, visit:
https://core.telegram.org/bots/webapps

## License

MIT
