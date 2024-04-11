import { User } from "../models/UserModel";

export class UserController {
  private static users: User[] = [
    { id: "1", firstName: "Jan", lastName: "Kowalski", role: "Admin" },
    { id: "2", firstName: "Anna", lastName: "Nowak", role: "Developer" },
    { id: "3", firstName: "Paweł", lastName: "Wiśniewski", role: "DevOps" },
  ];

  static getLoggedInUser(): User {
    return this.users.find((user) => user.role === "Admin") as User;
  }

  static getUsers(): User[] {
    return this.users;
  }
}
