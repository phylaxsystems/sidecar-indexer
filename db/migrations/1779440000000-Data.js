module.exports = class Data1779440000000 {
    name = 'Data1779440000000'

    async up(db) {
        await db.query(`CREATE TABLE "storage_reset" ("id" character varying NOT NULL, "block" integer NOT NULL, "tx_hash" text NOT NULL, "log_index" integer NOT NULL, "adopter" text NOT NULL, "storage_key" text NOT NULL, "reset_block" numeric NOT NULL, CONSTRAINT "PK_897e951b293f3e5e575208a82f4" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_41d2836b2e5fd55f927fdfd7be" ON "storage_reset" ("block") `)
        await db.query(`CREATE INDEX "IDX_14d9a6d0257c17f1184aad50a3" ON "storage_reset" ("adopter") `)
        await db.query(`CREATE INDEX "IDX_75915d733d905d7f5a4982ca4e" ON "storage_reset" ("storage_key") `)
    }

    async down(db) {
        await db.query(`DROP INDEX "public"."IDX_75915d733d905d7f5a4982ca4e"`)
        await db.query(`DROP INDEX "public"."IDX_14d9a6d0257c17f1184aad50a3"`)
        await db.query(`DROP INDEX "public"."IDX_41d2836b2e5fd55f927fdfd7be"`)
        await db.query(`DROP TABLE "storage_reset"`)
    }
}
