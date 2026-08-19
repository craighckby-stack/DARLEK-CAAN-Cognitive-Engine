#!/bin/bash
sed -i 's/stance"}`;          const systemPrompt/stance"}`;\n          const systemPrompt/g' src/app/api/evolution/debate/route.ts
sed -i 's/}`;`;/}`;/g' src/app/api/evolution/debate/route.ts
