module.exports = class Data1772008896268 {
    name = 'Data1772008896268'

    async up(db) {
        await db.query(`ALTER TABLE "assertion_added" ADD "log_index" integer NOT NULL`)
        await db.query(`ALTER TABLE "assertion_removed" ADD "log_index" integer NOT NULL`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "assertion_added" DROP COLUMN "log_index"`)
        await db.query(`ALTER TABLE "assertion_removed" DROP COLUMN "log_index"`)
    }
}
