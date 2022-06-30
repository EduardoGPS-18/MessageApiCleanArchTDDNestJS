import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1656550552990 implements MigrationInterface {
    name = 'initial1656550552990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "group" ("id" uuid NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ownerId" uuid, CONSTRAINT "UQ_256aa0fda9b1de1a73ee0b7106b" UNIQUE ("id"), CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message" ("content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL, "id" uuid NOT NULL, "updatedAt" TIMESTAMP NOT NULL, "senderId" uuid, "groupId" uuid, CONSTRAINT "UQ_ba01f0a3e0123651915008bc578" UNIQUE ("id"), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "session" character varying(255), CONSTRAINT "UQ_cace4a159ff9f2512dd42373760" UNIQUE ("id"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users-group" ("group_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_9a731ed4d5a365834187a687f4f" PRIMARY KEY ("group_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_48e1bc5d0e123ac57401dab719" ON "users-group" ("group_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_af3a47e08d6f19684fc14e2ee2" ON "users-group" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "group" ADD CONSTRAINT "FK_af997e6623c9a0e27c241126988" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_a85a728f01be8f15f0e52019389" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users-group" ADD CONSTRAINT "FK_48e1bc5d0e123ac57401dab7195" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users-group" ADD CONSTRAINT "FK_af3a47e08d6f19684fc14e2ee2b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users-group" DROP CONSTRAINT "FK_af3a47e08d6f19684fc14e2ee2b"`);
        await queryRunner.query(`ALTER TABLE "users-group" DROP CONSTRAINT "FK_48e1bc5d0e123ac57401dab7195"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_a85a728f01be8f15f0e52019389"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`ALTER TABLE "group" DROP CONSTRAINT "FK_af997e6623c9a0e27c241126988"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af3a47e08d6f19684fc14e2ee2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_48e1bc5d0e123ac57401dab719"`);
        await queryRunner.query(`DROP TABLE "users-group"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "group"`);
    }

}
