const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;
const envPath = path.resolve(process.cwd(), envFile);

// 🔍 Debug: In ra đường dẫn đang đọc
console.log('📁 Current directory:', process.cwd());
console.log('📁 Looking for env file:', envPath);
console.log('📁 File exists:', fs.existsSync(envPath));

// Nếu không tìm thấy .env.development, thử đọc .env
let actualEnvPath = envPath;
if (!fs.existsSync(envPath) && env === 'development') {
    const fallbackPath = path.resolve(process.cwd(), '.env');
    console.log('📁 Fallback to:', fallbackPath);
    if (fs.existsSync(fallbackPath)) {
        actualEnvPath = fallbackPath;
        console.log('📁 Using fallback .env file');
    }
}

let apiUrl = '';

if (fs.existsSync(actualEnvPath)) {
    const content = fs.readFileSync(actualEnvPath, 'utf8');
    console.log('📁 File content:', content);

    const lines = content.split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const [key, ...rest] = line.split('=');
        if (key && rest.length) {
            const trimmedKey = key.trim();
            const trimmedValue = rest.join('=').trim();

            console.log(`🔍 Key: "${trimmedKey}", Value: "${trimmedValue}"`);

            if (trimmedKey === 'API_URL') {
                apiUrl = trimmedValue;
                console.log(`✅ Found API_URL: ${apiUrl}`);
            }
        }
    });
}

if (!apiUrl) {
    console.warn('⚠️ API_URL not found, using default');
    apiUrl = 'http://localhost:7298/api/v1';
}

const output = `export const environment = {
  production: ${env === 'production' ? 'true' : 'false'},
  apiUrl: '${apiUrl}'
};
`;

const targetDir = 'src/environments';
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(path.join(targetDir, 'environment.ts'), output);
console.log(`✅ Generated environment.ts with API_URL: ${apiUrl} (${env} mode)`);