#!/bin/bash
cd /Users/reddqichaowu/Gemini-xianhua/quantum-mirror

# Replace Json with String
sed -i '' 's/aiFutureDeltasJson Json?/aiFutureDeltasJson String?/g' prisma/schema.prisma
sed -i '' 's/instructionsJson Json/instructionsJson String/g' prisma/schema.prisma

# Replace enums with String
sed -i '' 's/status    SessionStatus/status    String/g' prisma/schema.prisma
sed -i '' 's/role      ChatRole/role      String/g' prisma/schema.prisma

# Comment out enum definitions
sed -i '' 's/^enum SessionStatus {/\/\/ enum SessionStatus {/g' prisma/schema.prisma
sed -i '' 's/^  started/\/\/   started/g' prisma/schema.prisma
sed -i '' 's/^  completed/\/\/   completed/g' prisma/schema.prisma
sed -i '' 's/^}/\/\/ }/g' prisma/schema.prisma

sed -i '' 's/^enum ChatRole {/\/\/ enum ChatRole {/g' prisma/schema.prisma
sed -i '' 's/^  user$/\/\/   user/g' prisma/schema.prisma
sed -i '' 's/^  assistant/\/\/   assistant/g' prisma/schema.prisma
sed -i '' 's/^  system$/\/\/   system/g' prisma/schema.prisma

