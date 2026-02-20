module.exports = class Data1771573976650 {
    name = 'Data1771573976650'

    async up(db) {
        await db.query(`CREATE TABLE "assertion_added" ("id" character varying NOT NULL, "block" integer NOT NULL, "tx_hash" text NOT NULL, "assertion_adopter" text NOT NULL, "assertion_id" text NOT NULL, "activation_block" numeric NOT NULL, CONSTRAINT "PK_0d41bae2c557e065fb2f92464cb" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_58d21d6cb8ff867d082bf3681b" ON "assertion_added" ("block") `)
        await db.query(`CREATE INDEX "IDX_f2dc5dad8ba156dcab4c08b4f0" ON "assertion_added" ("assertion_adopter") `)
        await db.query(`CREATE INDEX "IDX_123a910249e7ab839a66d0ea64" ON "assertion_added" ("assertion_id") `)
        await db.query(`CREATE TABLE "assertion_removed" ("id" character varying NOT NULL, "block" integer NOT NULL, "tx_hash" text NOT NULL, "assertion_adopter" text NOT NULL, "assertion_id" text NOT NULL, "deactivation_block" numeric NOT NULL, CONSTRAINT "PK_f89d4b59ab77a6477987f83ee69" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_99eee474122082129ea800fb38" ON "assertion_removed" ("block") `)
        await db.query(`CREATE INDEX "IDX_3671370b2f7f0be943cade1bc6" ON "assertion_removed" ("assertion_adopter") `)
        await db.query(`CREATE INDEX "IDX_2a73cc559d4e1ebb6bf6908651" ON "assertion_removed" ("assertion_id") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "assertion_added"`)
        await db.query(`DROP INDEX "public"."IDX_58d21d6cb8ff867d082bf3681b"`)
        await db.query(`DROP INDEX "public"."IDX_f2dc5dad8ba156dcab4c08b4f0"`)
        await db.query(`DROP INDEX "public"."IDX_123a910249e7ab839a66d0ea64"`)
        await db.query(`DROP TABLE "assertion_removed"`)
        await db.query(`DROP INDEX "public"."IDX_99eee474122082129ea800fb38"`)
        await db.query(`DROP INDEX "public"."IDX_3671370b2f7f0be943cade1bc6"`)
        await db.query(`DROP INDEX "public"."IDX_2a73cc559d4e1ebb6bf6908651"`)
    }
}
