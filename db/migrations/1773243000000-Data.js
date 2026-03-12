module.exports = class Data1773243000000 {
    name = 'Data1773243000000'

    async up(db) {
        await db.query(`ALTER TABLE "assertion_added" ADD "da_verifier" text NOT NULL DEFAULT '0x0000000000000000000000000000000000000000'`)
        await db.query(`ALTER TABLE "assertion_added" ADD "metadata" text NOT NULL DEFAULT '0x'`)
        await db.query(`ALTER TABLE "assertion_added" ADD "proof" text NOT NULL DEFAULT '0x'`)
        await db.query(`ALTER TABLE "assertion_added" ALTER COLUMN "da_verifier" DROP DEFAULT`)
        await db.query(`ALTER TABLE "assertion_added" ALTER COLUMN "metadata" DROP DEFAULT`)
        await db.query(`ALTER TABLE "assertion_added" ALTER COLUMN "proof" DROP DEFAULT`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "assertion_added" DROP COLUMN "proof"`)
        await db.query(`ALTER TABLE "assertion_added" DROP COLUMN "metadata"`)
        await db.query(`ALTER TABLE "assertion_added" DROP COLUMN "da_verifier"`)
    }
}
