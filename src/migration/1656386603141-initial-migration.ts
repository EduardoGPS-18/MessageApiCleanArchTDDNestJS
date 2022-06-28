import { MigrationInterface, QueryRunner } from "typeorm";

export class initialMigration1656386603141 implements MigrationInterface {
    name = 'initialMigration1656386603141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_a85a728f01be8f15f0e52019389"`);
        await queryRunner.query(`ALTER TABLE "users-group" DROP CONSTRAINT "FK_48e1bc5d0e123ac57401dab7195"`);
        await queryRunner.query(`ALTER TABLE "group" ADD CONSTRAINT "UQ_256aa0fda9b1de1a73ee0b7106b" UNIQUE ("id")`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "UQ_ba01f0a3e0123651915008bc578" UNIQUE ("id")`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`ALTER TABLE "users-group" DROP CONSTRAINT "FK_af3a47e08d6f19684fc14e2ee2b"`);
        await queryRunner.query(`ALTER TABLE "group" DROP CONSTRAINT "FK_af997e6623c9a0e27c241126988"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_cace4a159ff9f2512dd42373760" UNIQUE ("id")`);
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
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "group" ADD CONSTRAINT "FK_af997e6623c9a0e27c241126988" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users-group" ADD CONSTRAINT "FK_af3a47e08d6f19684fc14e2ee2b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "UQ_ba01f0a3e0123651915008bc578"`);
        await queryRunner.query(`ALTER TABLE "group" DROP CONSTRAINT "UQ_256aa0fda9b1de1a73ee0b7106b"`);
        await queryRunner.query(`ALTER TABLE "users-group" ADD CONSTRAINT "FK_48e1bc5d0e123ac57401dab7195" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_a85a728f01be8f15f0e52019389" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
