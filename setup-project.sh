#!/bin/bash

# Create project directory
#mkdir -p browser-launcher
#cd browser-launcher

# Initialize npm project
npm init -y

# Create directory structure
mkdir -p config src/controllers src/services src/routes src/utils src/models

# Create configuration files
touch config/app.config.ts
touch config/websocket.config.ts

# Create model files
touch src/models/browserSession.ts

# Create utility files
touch src/utils/browserManager.ts
touch src/utils/websocketManager.ts
touch src/utils/logger.ts

# Create service files
touch src/services/browserService.ts
touch src/services/websocketService.ts
touch src/services/browserSessionManager.ts

# Create controller files
touch src/controllers/browserController.ts

# Create route files
touch src/routes/browserRoutes.ts

# Create main server file
touch server.ts

# Create TypeScript configuration
touch tsconfig.json

# Create gitignore
cat << EOF > .gitignore
node_modules/
dist/
*.log
.env
EOF

# Install dependencies
npm install express puppeteer ws winston uuid
npm install -D typescript ts-node nodemon @types/express @types/ws @types/node @types/uuid @types/winston

# Update package.json scripts
npm pkg set scripts.start="ts-node server.ts"
npm pkg set scripts.dev="nodemon --exec ts-node server.ts"
npm pkg set scripts.build="tsc"

# Create tsconfig.json
cat << EOF > tsconfig.json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./",
    "sourceMap": true
  },
  "include": [
    "server.ts",
    "src/**/*.ts",
    "config/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
EOF

echo "Project structure created successfully!"
```

To use this script:
1. Save it as `setup-project.sh`
2. Make it executable: `chmod +x setup-project.sh`
3. Run it: `./setup-project.sh`

After creating the structure, you can copy-paste the code from the previous response into the respective files.

The project is now set up with:
- Proper TypeScript configuration
- Modular architecture
- Development and production scripts
- Necessary type definitions
- Gitignore for common exclusions

Would you like me to elaborate on any part of the project setup?
