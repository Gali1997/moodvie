#!/bin/bash
# Cloudflare Pages build script
# Generates config.js from environment variables set in the dashboard

cat > config.js << EOF
const CONFIG = {
  GROQ_API_KEY: '${GROQ_API_KEY}',
  TMDB_API_KEY: '${TMDB_API_KEY}',
  STRIPE_PAYMENT_LINK: '${STRIPE_PAYMENT_LINK}'
}
EOF

echo "config.js generated"
