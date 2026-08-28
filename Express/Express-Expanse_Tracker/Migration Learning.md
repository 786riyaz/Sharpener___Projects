npm i -D sequelize-cli 
npx sequelize-cli migration:generate --name add-note-to-expanses
npm run migrate
npx sequelize-cli db:migrate:status
npm run migrate
npm run migrate:undo
# Undo ALL migrations (careful - reverts everything, not just the last one)
npx sequelize-cli db:migrate:undo:all
# Undo migrations down to (and including) a specific one
npx sequelize-cli db:migrate:undo:all --to 20260829000000-add-note-to-expanses.cjs
# Check what's currently applied before/after undoing
npm run migrate:status
