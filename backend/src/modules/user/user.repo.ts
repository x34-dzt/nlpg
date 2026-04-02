import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "../../infra/database/database.module";
import { UserModel, userTable } from "../../infra/database/models";
import { RegisterUserDto } from "./dto/register-user.dto";
import { eq } from "drizzle-orm";

@Injectable()
export class UserRepo {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(registerUserDto: RegisterUserDto): Promise<UserModel> {
    const result = await this.db
      .insert(userTable)
      .values(registerUserDto)
      .returning();

    const user = result[0];

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  async findByUsername(username: string): Promise<UserModel | undefined> {
    const result = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username));

    return result[0];
  }
}
